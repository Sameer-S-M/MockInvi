#!/usr/bin/env node

/**
 * Quick Test Script for MockInvi Fixes
 * Tests if the database functions are working after fixes
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration - Update these with your actual values
const SUPABASE_URL = 'https://ygcdksdsleyazlxfjpid.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // Get this from Supabase Dashboard

if (SUPABASE_ANON_KEY === 'YOUR_ANON_KEY_HERE') {
  console.error('❌ Please update SUPABASE_ANON_KEY with your actual anon key');
  console.log('Get it from: Supabase Dashboard → Settings → API');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabaseFunctions() {
  console.log('🧪 Testing Database Functions...\n');
  
  try {
    // Test 1: Check if functions exist
    console.log('1️⃣ Testing generateConsistentUUID function...');
    const { data: uuidResult, error: uuidError } = await supabase.rpc('generateConsistentUUID', {
      user_id: 'test-user-123'
    });
    
    if (uuidError) {
      console.error('❌ generateConsistentUUID failed:', uuidError.message);
      return false;
    }
    
    console.log('✅ generateConsistentUUID working:', uuidResult);
    
    // Test 2: Test profile creation function
    console.log('\n2️⃣ Testing get_or_create_user_profile function...');
    const { data: profileResult, error: profileError } = await supabase.rpc('get_or_create_user_profile', {
      clerk_user_id: 'test-clerk-user-123',
      full_name: 'Test User',
      user_email: 'test@example.com',
      user_role: 'student'
    });
    
    if (profileError) {
      console.error('❌ get_or_create_user_profile failed:', profileError.message);
      return false;
    }
    
    console.log('✅ get_or_create_user_profile working:', profileResult);
    
    // Test 3: Check if profile was created
    console.log('\n3️⃣ Verifying profile was created...');
    const { data: profile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('id', profileResult)
      .single();
    
    if (profileCheckError) {
      console.error('❌ Profile verification failed:', profileCheckError.message);
      return false;
    }
    
    console.log('✅ Profile created successfully:', profile);
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing MockInvi Database Fixes...\n');
  
  const success = await testDatabaseFunctions();
  
  if (success) {
    console.log('\n🎉 All tests passed! Database functions are working correctly.');
    console.log('\n📋 Next steps:');
    console.log('1. ✅ Database functions fixed');
    console.log('2. 🔧 Configure Clerk JWT template');
    console.log('3. 🔧 Configure Supabase OIDC');
    console.log('4. 🚀 Deploy Edge Functions');
    console.log('5. 🧪 Test the website');
  } else {
    console.log('\n❌ Tests failed. Please check the errors above.');
    console.log('Make sure you have:');
    console.log('1. Applied the database fixes from MANUAL_FIX_GUIDE.md');
    console.log('2. Updated SUPABASE_ANON_KEY in this script');
  }
}

main().catch(console.error);

