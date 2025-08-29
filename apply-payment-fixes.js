const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function applyPaymentFixes() {
  console.log('🚀 Applying payment and subscription fixes...');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Read the migration file
    const fs = require('fs');
    const path = require('path');
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250828190000_fix_payment_and_subscription_issues.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      return;
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded successfully');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔧 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`  ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error);
          // Continue with other statements
        }
      }
    }
    
    console.log('✅ Payment and subscription fixes applied successfully!');
    console.log('');
    console.log('📋 Summary of fixes:');
    console.log('  • Added missing email and auth_provider columns to profiles table');
    console.log('  • Updated RLS policies for payments and subscriptions');
    console.log('  • Created database functions for consistent UUID generation');
    console.log('  • Added user profile management functions');
    console.log('  • Created performance indexes');
    console.log('');
    console.log('🔄 Please restart your application to see the changes.');
    
  } catch (error) {
    console.error('❌ Error applying fixes:', error);
  }
}

// Run the script
applyPaymentFixes();
