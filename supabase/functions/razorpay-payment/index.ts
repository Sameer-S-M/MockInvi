
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

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error('Razorpay credentials not configured')
    }

    const authHeader = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)

    switch (action) {
      case 'create_order': {
        const { amount, currency = 'INR', receipt } = payload
        
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
          throw new Error(error.error?.description || 'Failed to create order')
        }

        const order = await orderResponse.json()
        return new Response(JSON.stringify(order), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'verify_payment': {
        console.log('=== PAYMENT VERIFICATION START ===');
        
        // Initialize Supabase client with service role key
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)
        console.log('Supabase client initialized with service role key');
        
        // Get user data from request payload (sent from frontend)
        const { user_email, user_id: clerkUserId } = payload;
        console.log('User data from payload:', {
          user_email,
          clerkUserId
        });

        if (!user_email || !clerkUserId) {
          console.log('ERROR: Missing user data in payload');
          throw new Error('Missing user email or ID in request');
        }

        // Generate consistent UUID for Supabase (matches frontend logic)
        const supabaseUserId = generateConsistentUUID(clerkUserId);
        console.log('Generated Supabase user ID:', {
          clerkUserId,
          supabaseUserId,
          email: user_email
        });

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_type } = payload
        console.log('Payment payload received:', {
          razorpay_order_id,
          razorpay_payment_id, 
          plan_type,
          amount: payload.amount
        });

        // Verify user exists in profiles table and determine actual user ID
        console.log('Verifying user exists in profiles table...');
        let actualUserId: string;
        
        try {
          // First try to find by the generated UUID
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('id', supabaseUserId)
            .maybeSingle();

          if (profileError) {
            console.error('Profile lookup by generated ID failed:', profileError);
            throw new Error(`Profile lookup failed: ${profileError.message}`);
          }

          if (profile) {
            console.log('Found user profile by generated ID:', {
              email: profile.email,
              userId: supabaseUserId
            });
            actualUserId = supabaseUserId;
          } else {
            console.log('Profile not found by generated ID, attempting to create...');
            
            // Try to create a new profile using the database function
            try {
              const { data: newProfileId, error: createError } = await supabase.rpc('get_or_create_user_profile', {
                clerk_user_id: clerkUserId,
                full_name: user_email.split('@')[0], // Use email prefix as fallback name
                user_email: user_email,
                user_role: 'student'
              });

              if (createError) {
                console.error('Failed to create profile via function:', createError);
                throw createError;
              }

              console.log('Profile created successfully via function:', newProfileId);
              actualUserId = newProfileId;
            } catch (functionError) {
              console.error('Database function failed, trying manual creation:', functionError);
              
              // Fallback: try to create profile manually
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: supabaseUserId,
                  full_name: user_email.split('@')[0], // Use email prefix as fallback name
                  email: user_email,
                  role: 'student',
                  auth_provider: 'clerk'
                })
                .select('id')
                .single();

              if (createError) {
                console.error('Manual profile creation also failed:', createError);
                // Try fallback: find by email
                console.log('Attempting fallback lookup by email...');
                
                const { data: emailProfile, error: emailError } = await supabase
                  .from('profiles')
                  .select('id, email')
                  .eq('email', user_email)
                  .maybeSingle();
                  
                if (emailError) {
                  console.error('Email-based profile lookup also failed:', emailError);
                  throw new Error('Failed to find or create user profile');
                }
                
                if (emailProfile) {
                  console.log('Found user via email fallback:', emailProfile);
                  actualUserId = emailProfile.id;
                } else {
                  throw new Error('User profile not found and could not be created');
                }
              } else {
                console.log('Profile created manually:', newProfile);
                actualUserId = supabaseUserId;
              }
            }
          }
        } catch (error) {
          console.error('Profile management failed:', error);
          throw new Error(`Profile management failed: ${error.message}`);
        }

        console.log('Using actual user ID:', actualUserId);
        
        // Verify payment signature using Web Crypto API
        console.log('Starting signature verification...');
        
        const encoder = new TextEncoder()
        const data = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`)
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(razorpayKeySecret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        )
        const signature = await crypto.subtle.sign('HMAC', key, data)
        const expectedSignature = Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')

        if (expectedSignature !== razorpay_signature) {
          console.log('ERROR: Signature mismatch', {
            expected: expectedSignature,
            received: razorpay_signature
          });
          throw new Error('Invalid payment signature')
        }
        console.log('Payment signature verified successfully');

        // Store payment record using actual user ID
        console.log('Inserting payment record with user_id:', actualUserId);
        console.log('Payment data to insert:', {
          user_id: actualUserId,
          razorpay_order_id,
          razorpay_payment_id,
          amount: payload.amount,
          currency: payload.currency || 'INR',
          plan_type,
          status: 'completed'
        });
        
        try {
          const { error: paymentError } = await supabase
            .from('payments')
            .insert({
              user_id: actualUserId,
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
              amount: payload.amount,
              currency: payload.currency || 'INR',
              plan_type,
              status: 'completed'
            });

          if (paymentError) {
            console.error('Payment record insertion failed:', paymentError);
            console.error('Error details:', JSON.stringify(paymentError));
            throw new Error(`Failed to store payment record: ${paymentError.message}`);
          }
          console.log('Payment record inserted successfully');
        } catch (error) {
          console.error('Exception during payment insertion:', error);
          throw error;
        }

        // Update user subscription using actual user ID - FIXED VERSION
        console.log('Creating/updating subscription for user_id:', actualUserId);
        const subscriptionEnd = new Date()
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1) // 1 month subscription
        
        console.log('Subscription dates:', {
          start: new Date().toISOString(),
          end: subscriptionEnd.toISOString()
        });

        try {
          // First try to insert
          const { error: insertError } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: actualUserId,
              plan_type,
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: subscriptionEnd.toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError && insertError.code === '23505') {
            // Duplicate key error, try to update instead
            console.log('Subscription already exists, updating...');
            const { error: updateError } = await supabase
              .from('user_subscriptions')
              .update({
                plan_type,
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: subscriptionEnd.toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('user_id', actualUserId);

            if (updateError) {
              console.error('Subscription update failed:', updateError);
              throw new Error(`Failed to update subscription: ${updateError.message}`);
            }
            console.log('Subscription updated successfully');
          } else if (insertError) {
            console.error('Subscription insertion failed:', insertError);
            throw new Error(`Failed to insert subscription: ${insertError.message}`);
          } else {
            console.log('Subscription created successfully');
          }
        } catch (error) {
          console.error('Subscription creation/update failed:', error);
          throw new Error(`Failed to manage subscription: ${error.message}`);
        }

        console.log('=== PAYMENT VERIFICATION SUCCESS ===');

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Razorpay payment error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack || 'No stack trace available'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
