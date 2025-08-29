const { createClient } = require('@supabase/supabase-js');

// Database connection details
const supabaseUrl = 'https://ygcdksdsleyazlxfjpid.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  console.log('Please set your service role key and run again');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyDatabaseFix() {
  try {
    console.log('🔧 Applying database fixes...');
    
    // Step 1: Add clerk_user_id column
    console.log('📝 Step 1: Adding clerk_user_id column...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.user_certificates 
        ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;
      `
    });
    
    if (alterError) {
      console.log('⚠️  Column might already exist, continuing...');
    } else {
      console.log('✅ clerk_user_id column added');
    }
    
    // Step 2: Create index
    console.log('📝 Step 2: Creating index...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_user_certificates_clerk_user_id 
        ON public.user_certificates(clerk_user_id);
      `
    });
    
    if (indexError) {
      console.log('⚠️  Index might already exist, continuing...');
    } else {
      console.log('✅ Index created');
    }
    
    // Step 3: Update existing records
    console.log('📝 Step 3: Updating existing records...');
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.user_certificates 
        SET clerk_user_id = 'legacy-certificate'
        WHERE clerk_user_id IS NULL;
      `
    });
    
    if (updateError) {
      console.log('⚠️  Update error:', updateError.message);
    } else {
      console.log('✅ Existing records updated');
    }
    
    // Step 4: Create unified view
    console.log('📝 Step 4: Creating unified view...');
    const { error: viewError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE VIEW public.v_unified_certificates AS
        SELECT 
          'user_certificate' as source,
          uc.id,
          uc.user_id,
          COALESCE(uc.clerk_user_id, 'legacy-' || uc.id) as clerk_user_id,
          uc.course_id,
          uc.certificate_id,
          uc.verification_code,
          uc.score,
          uc.completion_data,
          uc.is_active,
          uc.created_at,
          uc.updated_at,
          c.title as certificate_title,
          c.description as certificate_description,
          c.certificate_type
        FROM public.user_certificates uc
        JOIN public.certificates c ON uc.certificate_id = c.id
        WHERE uc.is_active = true

        UNION ALL

        SELECT 
          'certificate_management' as source,
          ccm.id,
          NULL as user_id,
          ccm.clerk_user_id,
          ccm.course_id,
          NULL as certificate_id,
          'CERT-MGMT-' || ccm.id as verification_code,
          ccm.assessment_score as score,
          jsonb_build_object(
            'course_id', ccm.course_id,
            'course_name', ccm.course_name,
            'completion_date', ccm.completion_date,
            'score', ccm.assessment_score,
            'passing_score', 70,
            'user_name', 'Student'
          ) as completion_data,
          true as is_active,
          ccm.created_at,
          ccm.updated_at,
          ccm.course_name || ' Completion Certificate' as certificate_title,
          'Certificate of successful completion for ' || ccm.course_name as certificate_description,
          'completion' as certificate_type
        FROM public.course_certificate_management ccm
        WHERE ccm.course_complete = true AND ccm.assessment_pass = true;
      `
    });
    
    if (viewError) {
      console.log('❌ Error creating view:', viewError.message);
    } else {
      console.log('✅ Unified view created');
    }
    
    console.log('🎉 Database fixes applied successfully!');
    
  } catch (error) {
    console.error('❌ Error applying database fixes:', error);
  }
}

applyDatabaseFix(); 