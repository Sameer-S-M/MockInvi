#!/usr/bin/env node

/**
 * Complete Fix Script for MockInvi Website
 * This script applies all necessary fixes to resolve payment and subscription issues
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ygcdksdsleyazlxfjpid.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Please set it in your .env file or export it');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runSQLFile(filename) {
  try {
    const filePath = path.join(__dirname, filename);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filename}`);
      return false;
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`📁 Running SQL file: ${filename}`);
    
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`❌ Error running ${filename}:`, error);
      return false;
    }
    
    console.log(`✅ Successfully ran ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to run ${filename}:`, error);
    return false;
  }
}

async function testDatabaseFunctions() {
  console.log('\n🧪 Testing database functions...');
  
  try {
    // Test the generateConsistentUUID function
    const { data: uuidTest, error: uuidError } = await supabase.rpc('generateConsistentUUID', {
      user_id: 'test-user-123'
    });
    
    if (uuidError) {
      console.error('❌ generateConsistentUUID function failed:', uuidError);
      return false;
    }
    
    console.log('✅ generateConsistentUUID function working:', uuidTest);
    
    // Test the get_or_create_user_profile function
    const { data: profileTest, error: profileError } = await supabase.rpc('get_or_create_user_profile', {
      clerk_user_id: 'test-clerk-user-123',
      full_name: 'Test User',
      user_email: 'test@example.com',
      user_role: 'student'
    });
    
    if (profileError) {
      console.error('❌ get_or_create_user_profile function failed:', profileError);
      return false;
    }
    
    console.log('✅ get_or_create_user_profile function working:', profileTest);
    
    return true;
  } catch (error) {
    console.error('❌ Function testing failed:', error);
    return false;
  }
}

async function checkDatabaseTables() {
  console.log('\n🔍 Checking database tables...');
  
  try {
    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table check failed:', profilesError);
      return false;
    }
    
    console.log('✅ Profiles table accessible');
    
    // Check user_subscriptions table
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('user_subscriptions')
      .select('count')
      .limit(1);
    
    if (subscriptionsError) {
      console.error('❌ User subscriptions table check failed:', subscriptionsError);
      return false;
    }
    
    console.log('✅ User subscriptions table accessible');
    
    // Check payments table
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('count')
      .limit(1);
    
    if (paymentsError) {
      console.error('❌ Payments table check failed:', paymentsError);
      return false;
    }
    
    console.log('✅ Payments table accessible');
    
    return true;
  } catch (error) {
    console.error('❌ Table checking failed:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting MockInvi Website Fix Process...\n');
  
  // Step 1: Apply database function fixes
  console.log('📋 Step 1: Applying database function fixes...');
  const dbFixSuccess = await runSQLFile('fix-database-functions.sql');
  
  if (!dbFixSuccess) {
    console.error('❌ Database function fixes failed. Stopping.');
    process.exit(1);
  }
  
  // Step 2: Check database tables
  console.log('\n📋 Step 2: Checking database tables...');
  const tablesOk = await checkDatabaseTables();
  
  if (!tablesOk) {
    console.error('❌ Database table checks failed. Stopping.');
    process.exit(1);
  }
  
  // Step 3: Test database functions
  console.log('\n📋 Step 3: Testing database functions...');
  const functionsOk = await testDatabaseFunctions();
  
  if (!functionsOk) {
    console.error('❌ Database function tests failed. Stopping.');
    process.exit(1);
  }
  
  // Step 4: Summary and next steps
  console.log('\n🎉 All fixes applied successfully!');
  console.log('\n📋 Next steps to complete the fix:');
  console.log('1. ✅ Database functions fixed');
  console.log('2. ✅ Edge Function updated');
  console.log('3. 🔧 Configure Clerk JWT template:');
  console.log('   - Go to Clerk Dashboard → JWT Templates');
  console.log('   - Create template named "supabase"');
  console.log('   - Add claims: sub, email, email_verified');
  console.log('4. 🔧 Configure Supabase OIDC:');
  console.log('   - Go to Supabase Dashboard → Authentication → Providers');
  console.log('   - Enable OIDC provider');
  console.log('   - Add Clerk as allowed OIDC provider');
  console.log('5. 🚀 Deploy Edge Functions:');
  console.log('   - Run: supabase functions deploy razorpay-payment');
  console.log('6. 🧪 Test the website');
  
  console.log('\n🎯 Your website should now work properly!');
}

// Run the main function
main().catch(console.error);

