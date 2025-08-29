import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fixed namespace UUID for consistent generation (matches frontend)
const NAMESPACE_UUID = '1b671a64-40d5-491e-99b0-da01ff1f3341';

function generateConsistentUUID(userId: string): string {
  try {
    // Simple hash function to create deterministic UUID (matches frontend logic)
    let hash = 0;
    const input = userId + NAMESPACE_UUID;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert hash to hex and pad to create UUID format
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-a${hex.slice(0, 3)}-${hex.slice(0, 12).padEnd(12, '0')}`;
  } catch (error) {
    console.error("Error generating consistent UUID:", error);
    // Fallback to a random UUID
    return crypto.randomUUID();
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, ...payload } = await req.json()
    console.log('Enhanced Razorpay payment function called with action:', action);

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get Razorpay credentials from database
    const { data: adminData, error: adminError } = await supabase
      .from('admin_credentials')
      .select('razorpay_key_id, razorpay_key_secret')
      .single();

    if (adminError || !adminData?.razorpay_key_id || !adminData?.razorpay_key_secret) {
      throw new Error('Razorpay credentials not configured in admin settings');
    }

    const { razorpay_key_id, razorpay_key_secret } = adminData;
    const authHeader = btoa(`${razorpay_key_id}:${razorpay_key_secret}`)

    switch (action) {
      case 'create_order': {
        const { amount, currency = 'INR', receipt } = payload
        
        console.log('Creating Razorpay order:', { amount, currency, receipt });
        
        const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount * 100, // Convert to paise
            currency,
            receipt,
          }),
        })

        if (!orderResponse.ok) {
          const error = await orderResponse.json()
          console.error('Razorpay order creation failed:', error);
          throw new Error(error.error?.description || 'Failed to create order')
        }

        const order = await orderResponse.json()
        console.log('Razorpay order created successfully:', order.id);
        
        return new Response(JSON.stringify(order), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'verify_payment': {
        console.log('=== ENHANCED PAYMENT VERIFICATION START ===');
        
        const { 
          razorpay_order_id, 
          razorpay_payment_id, 
          razorpay_signature, 
          plan_type,
          amount,
          currency = 'INR',
          user_email, 
          user_id: clerkUserId 
        } = payload;

        console.log('Payment verification payload:', {
          razorpay_order_id,
          razorpay_payment_id,
          plan_type,
          amount,
          user_email,
          clerkUserId
        });

        if (!user_email || !clerkUserId) {
          throw new Error('Missing user email or ID in request');
        }

        // Generate consistent UUID for Supabase
        const supabaseUserId = generateConsistentUUID(clerkUserId);
        console.log('Generated Supabase user ID:', supabaseUserId);

        // Verify payment signature
        console.log('Verifying payment signature...');
        const encoder = new TextEncoder()
        const data = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`)
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(razorpay_key_secret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        )
        const signature = await crypto.subtle.sign('HMAC', key, data)
        const expectedSignature = Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')

        if (expectedSignature !== razorpay_signature) {
          console.error('Payment signature verification failed');
          throw new Error('Invalid payment signature')
        }
        console.log('Payment signature verified successfully');

        // Ensure user profile exists using database function
        console.log('Ensuring user profile exists...');
        try {
          const { data: profileId, error: profileError } = await supabase.rpc('get_or_create_user_profile', {
            p_clerk_user_id: clerkUserId,
            p_full_name: user_email.split('@')[0], // Use email prefix as fallback name
            p_email: user_email,
            p_role: 'student'
          });

          if (profileError) {
            console.error('Profile creation failed:', profileError);
            throw new Error(`Profile creation failed: ${profileError.message}`);
          }

          console.log('User profile ensured with ID:', profileId);
        } catch (profileError) {
          console.error('Error ensuring user profile:', profileError);
          // Continue with payment processing even if profile creation fails
        }

        // Store payment record
        console.log('Storing payment record...');
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: supabaseUserId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            amount,
            currency,
            plan_type,
            status: 'completed'
          });

        if (paymentError) {
          console.error('Payment record insertion failed:', paymentError);
          throw new Error(`Failed to store payment record: ${paymentError.message}`);
        }
        console.log('Payment record stored successfully');

        // Create or update subscription
        console.log('Managing user subscription...');
        const subscriptionEnd = new Date()
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1) // 1 month subscription

        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: supabaseUserId,
            plan_type,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: subscriptionEnd.toISOString(),
            was_granted: false, // This is a purchased subscription
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (subscriptionError) {
          console.error('Subscription management failed:', subscriptionError);
          throw new Error(`Failed to manage subscription: ${subscriptionError.message}`);
        }
        console.log('Subscription managed successfully');

        console.log('=== ENHANCED PAYMENT VERIFICATION SUCCESS ===');

        return new Response(JSON.stringify({ 
          success: true,
          message: 'Payment verified and subscription activated'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Enhanced Razorpay payment error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Enhanced payment processing failed'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})