// Test script to debug the "Remove Pro" functionality
// Run this in your browser console on the admin page

async function testRemovePro() {
  console.log('Testing Remove Pro functionality...');
  
  // Test 1: Check if we can access user_subscriptions table
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .limit(1);
    
    console.log('Test 1 - Can access user_subscriptions:', { data, error });
  } catch (e) {
    console.error('Test 1 failed:', e);
  }
  
  // Test 2: Check if we can delete from user_subscriptions
  try {
    // First, let's find a user with pro subscription
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .limit(5);
    
    console.log('Test 2 - Found users:', { users, usersError });
    
    if (users && users.length > 0) {
      const testUserId = users[0].id;
      console.log('Testing with user:', testUserId);
      
      // Try to delete a non-existent subscription (should not error)
      const { error: deleteError } = await supabase
        .from('user_subscriptions')
        .delete()
        .eq('user_id', testUserId)
        .eq('plan_type', 'pro')
        .eq('status', 'active');
      
      console.log('Test 2 - Delete attempt result:', { deleteError });
    }
  } catch (e) {
    console.error('Test 2 failed:', e);
  }
  
  // Test 3: Check current user's role
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Test 3 - Current user:', user);
    
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      console.log('Test 3 - User profile:', { profile, profileError });
    }
  } catch (e) {
    console.error('Test 3 failed:', e);
  }
}

// Run the test
testRemovePro();
