// Test script to verify Edge Function is working
const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://ygcdksdsleyazlxfjpid.supabase.co';
const supabaseKey = 'YOUR_ANON_KEY'; // Replace with your actual anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEdgeFunction() {
  try {
    console.log('🧪 Testing Edge Function...');
    
    const { data, error } = await supabase.functions.invoke('razorpay-payment', {
      body: {
        action: 'verify_payment',
        razorpay_order_id: 'test_order_123',
        razorpay_payment_id: 'test_payment_123',
        razorpay_signature: 'test_signature_123',
        plan_type: 'pro',
        amount: 111,
        currency: 'INR',
        user_email: 'test@example.com',
        user_id: 'test_user_123',
      },
    });
    
    if (error) {
      console.error('❌ Edge Function Error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Edge Function Response:', data);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testEdgeFunction();


