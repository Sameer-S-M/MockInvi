// Test script to check certificate system
console.log('=== Certificate System Test ===');

// Test 1: Check if course_certificate_management table exists
console.log('\n1. Checking if course_certificate_management table exists...');
console.log('Run this SQL in Supabase Dashboard:');
console.log(`
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'course_certificate_management'
);
`);

// Test 2: Check if update_course_certificate_management function exists
console.log('\n2. Checking if update_course_certificate_management function exists...');
console.log('Run this SQL in Supabase Dashboard:');
console.log(`
SELECT EXISTS (
  SELECT FROM information_schema.routines 
  WHERE routine_schema = 'public' 
  AND routine_name = 'update_course_certificate_management'
);
`);

// Test 3: Manual SQL to create the table and function
console.log('\n3. Manual SQL to create table and function (run in Supabase Dashboard):');
console.log(`
-- Create certificate management table
CREATE TABLE IF NOT EXISTS public.course_certificate_management (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  course_name TEXT NOT NULL,
  course_complete BOOLEAN DEFAULT FALSE,
  assessment_pass BOOLEAN DEFAULT FALSE,
  assessment_score INTEGER DEFAULT 0,
  completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clerk_user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.course_certificate_management ENABLE ROW LEVEL SECURITY;

-- Create function
CREATE OR REPLACE FUNCTION public.update_course_certificate_management(
  p_clerk_user_id TEXT,
  p_course_id TEXT,
  p_course_name TEXT,
  p_course_complete BOOLEAN,
  p_assessment_score INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.course_certificate_management (
    clerk_user_id,
    course_id,
    course_name,
    course_complete,
    assessment_pass,
    assessment_score,
    completion_date
  ) VALUES (
    p_clerk_user_id,
    p_course_id,
    p_course_name,
    p_course_complete,
    p_assessment_score >= 70,
    p_assessment_score,
    CASE WHEN p_course_complete AND p_assessment_score >= 70 THEN NOW() ELSE NULL END
  )
  ON CONFLICT (clerk_user_id, course_id)
  DO UPDATE SET
    course_complete = EXCLUDED.course_complete,
    assessment_pass = EXCLUDED.assessment_pass,
    assessment_score = EXCLUDED.assessment_score,
    completion_date = EXCLUDED.completion_date,
    updated_at = NOW();
END;
$$;
`);

// Test 4: Check user_learning table structure
console.log('\n4. Check user_learning table structure:');
console.log('Run this SQL in Supabase Dashboard:');
console.log(`
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_learning'
ORDER BY ordinal_position;
`);

// Test 5: Check for duplicate user_learning records
console.log('\n5. Check for duplicate user_learning records:');
console.log('Run this SQL in Supabase Dashboard:');
console.log(`
SELECT user_id, course_id, COUNT(*) as record_count
FROM user_learning
GROUP BY user_id, course_id
HAVING COUNT(*) > 1
ORDER BY record_count DESC;
`);

console.log('\n=== Test Complete ===');
console.log('\nInstructions:');
console.log('1. Go to Supabase Dashboard > SQL Editor');
console.log('2. Run the SQL commands above one by one');
console.log('3. Check the results and let me know what you find'); 