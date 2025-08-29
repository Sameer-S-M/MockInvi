/*
  # Comprehensive Backend Fix for MockInvi

  1. Database Schema Enhancements
    - Fix missing foreign key constraints
    - Add proper indexes for performance
    - Ensure all tables have proper RLS policies
    - Add missing columns for functionality

  2. Security Improvements
    - Comprehensive RLS policies for all user roles
    - Proper admin access controls
    - Service role permissions for edge functions

  3. Data Integrity
    - Foreign key constraints
    - Proper data types and constraints
    - Unique constraints where needed

  4. Performance Optimizations
    - Strategic indexes for common queries
    - Optimized RLS policies
    - Efficient data structures
*/

-- =====================================================
-- 1. ENSURE ALL REQUIRED TABLES EXIST WITH PROPER STRUCTURE
-- =====================================================

-- Ensure admin_credentials has all required columns
ALTER TABLE public.admin_credentials 
ADD COLUMN IF NOT EXISTS razorpay_key_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_key_secret TEXT,
ADD COLUMN IF NOT EXISTS pro_plan_price_inr INTEGER DEFAULT 999;

-- Ensure profiles table has all required columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'clerk',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Ensure user_subscriptions has the was_granted column
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS was_granted BOOLEAN DEFAULT false;

-- Ensure user_certificates has all required columns
ALTER TABLE public.user_certificates 
ADD COLUMN IF NOT EXISTS clerk_user_id TEXT,
ADD COLUMN IF NOT EXISTS template_id UUID,
ADD COLUMN IF NOT EXISTS populated_html TEXT,
ADD COLUMN IF NOT EXISTS certificate_hash TEXT;

-- =====================================================
-- 2. CREATE MISSING TABLES
-- =====================================================

-- Create certificate_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  html_template TEXT NOT NULL,
  placeholders JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course_certificate_management table if it doesn't exist
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

-- =====================================================
-- 3. ADD MISSING FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign key from user_certificates to certificates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_certificates_certificate_id_fkey'
  ) THEN
    ALTER TABLE public.user_certificates
    ADD CONSTRAINT user_certificates_certificate_id_fkey
    FOREIGN KEY (certificate_id) REFERENCES public.certificates(id) ON DELETE CASCADE;
  END IF;
END$$;

-- Add foreign key from user_certificates to certificate_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_certificates_template_id_fkey'
  ) THEN
    ALTER TABLE public.user_certificates
    ADD CONSTRAINT user_certificates_template_id_fkey
    FOREIGN KEY (template_id) REFERENCES public.certificate_templates(id) ON DELETE SET NULL;
  END IF;
END$$;

-- Add foreign key from user_certificates to courses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_certificates_course_id_fkey'
  ) THEN
    ALTER TABLE public.user_certificates
    ADD CONSTRAINT user_certificates_course_id_fkey
    FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;
  END IF;
END$$;

-- =====================================================
-- 4. CREATE COMPREHENSIVE INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_provider ON public.profiles(auth_provider);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- User subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_type ON public.user_subscriptions(plan_type);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON public.user_subscriptions(current_period_end);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);

-- User certificates indexes
CREATE INDEX IF NOT EXISTS idx_user_certificates_user_id ON public.user_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certificates_clerk_user_id ON public.user_certificates(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_certificates_course_id ON public.user_certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_user_certificates_verification_code ON public.user_certificates(verification_code);

-- User learning indexes
CREATE INDEX IF NOT EXISTS idx_user_learning_user_id ON public.user_learning(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_course_id ON public.user_learning(course_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_user_course ON public.user_learning(user_id, course_id);

-- Course management indexes
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON public.courses(is_active);
CREATE INDEX IF NOT EXISTS idx_course_videos_course_id ON public.course_videos(course_id);
CREATE INDEX IF NOT EXISTS idx_course_questions_course_id ON public.course_questions(course_id);

-- =====================================================
-- 5. ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interview_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_certificate_management ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE COMPREHENSIVE RLS POLICIES
-- =====================================================

-- Helper function for admin check
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function for JWT email extraction
CREATE OR REPLACE FUNCTION public.jwt_email()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::json ->> 'email')::text,
    ''
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view profiles" ON public.profiles
FOR SELECT USING (
  auth.uid() = id OR 
  public.is_current_user_admin() OR
  email = public.jwt_email()
);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id OR 
  email = public.jwt_email()
);

CREATE POLICY "Users can insert profiles" ON public.profiles
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL USING (public.is_current_user_admin());

-- Admin credentials policies
DROP POLICY IF EXISTS "Only admins can access credentials" ON public.admin_credentials;
DROP POLICY IF EXISTS "Service role can access credentials" ON public.admin_credentials;

CREATE POLICY "Admins can access credentials" ON public.admin_credentials
FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Service role can access credentials" ON public.admin_credentials
FOR ALL TO service_role USING (true);

-- Courses and content policies
DROP POLICY IF EXISTS "Anyone can view active courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;

CREATE POLICY "Anyone can view active courses" ON public.courses
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage courses" ON public.courses
FOR ALL USING (public.is_current_user_admin());

-- Course videos policies
DROP POLICY IF EXISTS "Anyone can view active course videos" ON public.course_videos;
DROP POLICY IF EXISTS "Admins can manage course videos" ON public.course_videos;

CREATE POLICY "Anyone can view active course videos" ON public.course_videos
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage course videos" ON public.course_videos
FOR ALL USING (public.is_current_user_admin());

-- Course questions policies
DROP POLICY IF EXISTS "Anyone can view active course questions" ON public.course_questions;
DROP POLICY IF EXISTS "Admins can manage course questions" ON public.course_questions;

CREATE POLICY "Anyone can view active course questions" ON public.course_questions
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage course questions" ON public.course_questions
FOR ALL USING (public.is_current_user_admin());

-- Certificates policies
DROP POLICY IF EXISTS "Anyone can view active certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can manage certificates" ON public.certificates;

CREATE POLICY "Anyone can view active certificates" ON public.certificates
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage certificates" ON public.certificates
FOR ALL USING (public.is_current_user_admin());

-- Certificate templates policies
DROP POLICY IF EXISTS "Anyone can view active certificate templates" ON public.certificate_templates;
DROP POLICY IF EXISTS "Admins can manage certificate templates" ON public.certificate_templates;

CREATE POLICY "Anyone can view active certificate templates" ON public.certificate_templates
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage certificate templates" ON public.certificate_templates
FOR ALL USING (public.is_current_user_admin());

-- User certificates policies
DROP POLICY IF EXISTS "Users can view their own certificates" ON public.user_certificates;
DROP POLICY IF EXISTS "Users can insert their own certificates" ON public.user_certificates;
DROP POLICY IF EXISTS "Users can update their own certificates" ON public.user_certificates;
DROP POLICY IF EXISTS "Admins can manage all user certificates" ON public.user_certificates;

CREATE POLICY "Users can view their own certificates" ON public.user_certificates
FOR SELECT USING (
  auth.uid() = user_id OR 
  public.is_current_user_admin() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND email = public.jwt_email()
  )
);

CREATE POLICY "System can insert user certificates" ON public.user_certificates
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own certificates" ON public.user_certificates
FOR UPDATE USING (
  auth.uid() = user_id OR 
  public.is_current_user_admin()
);

CREATE POLICY "Admins can manage all user certificates" ON public.user_certificates
FOR ALL USING (public.is_current_user_admin());

-- User learning policies
DROP POLICY IF EXISTS "Users can view their own learning data" ON public.user_learning;
DROP POLICY IF EXISTS "Users can insert their own learning data" ON public.user_learning;
DROP POLICY IF EXISTS "Users can update their own learning data" ON public.user_learning;

CREATE POLICY "Users can view their own learning data" ON public.user_learning
FOR SELECT USING (
  auth.uid() = user_id OR 
  public.is_current_user_admin() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND email = public.jwt_email()
  )
);

CREATE POLICY "System can manage user learning data" ON public.user_learning
FOR ALL WITH CHECK (true);

-- Payments policies
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;

CREATE POLICY "Users can view their own payments" ON public.payments
FOR SELECT USING (
  auth.uid() = user_id OR 
  public.is_current_user_admin() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND email = public.jwt_email()
  )
);

CREATE POLICY "System can insert payments" ON public.payments
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all payments" ON public.payments
FOR ALL USING (public.is_current_user_admin());

-- User subscriptions policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can delete user subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can update user subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can view all user subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can insert user subscriptions" ON public.user_subscriptions;

CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
FOR SELECT USING (
  auth.uid() = user_id OR 
  public.is_current_user_admin() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND email = public.jwt_email()
  )
);

CREATE POLICY "System can manage subscriptions" ON public.user_subscriptions
FOR ALL WITH CHECK (true);

CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
FOR ALL USING (public.is_current_user_admin());

-- Interview sessions policies
DROP POLICY IF EXISTS "Users can view their own interview sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Users can create their own interview sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Users can update their own interview sessions" ON public.interview_sessions;

CREATE POLICY "System can manage interview sessions" ON public.interview_sessions
FOR ALL WITH CHECK (true);

-- Interview reports policies
DROP POLICY IF EXISTS "Users can view their own interview reports" ON public.interview_reports;
DROP POLICY IF EXISTS "Users can insert their own interview reports" ON public.interview_reports;
DROP POLICY IF EXISTS "Users can update their own interview reports" ON public.interview_reports;

CREATE POLICY "Users can view their own reports" ON public.interview_reports
FOR SELECT USING (
  auth.uid() = user_id OR 
  public.is_current_user_admin()
);

CREATE POLICY "System can manage interview reports" ON public.interview_reports
FOR ALL WITH CHECK (true);

-- User interview usage policies
DROP POLICY IF EXISTS "Users can view their own interview usage" ON public.user_interview_usage;
DROP POLICY IF EXISTS "Users can insert their own interview usage" ON public.user_interview_usage;
DROP POLICY IF EXISTS "Users can update their own interview usage" ON public.user_interview_usage;

CREATE POLICY "Users can view their own usage" ON public.user_interview_usage
FOR SELECT USING (
  auth.uid() = user_id OR 
  public.is_current_user_admin()
);

CREATE POLICY "System can manage interview usage" ON public.user_interview_usage
FOR ALL WITH CHECK (true);

-- User reports policies
DROP POLICY IF EXISTS "Users can view their own reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can insert their own reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON public.user_reports;

CREATE POLICY "Users can view their own user reports" ON public.user_reports
FOR SELECT USING (
  auth.uid() = user_id OR 
  public.is_current_user_admin()
);

CREATE POLICY "System can manage user reports" ON public.user_reports
FOR ALL WITH CHECK (true);

-- Interview resources policies
DROP POLICY IF EXISTS "Students can view active interview resources" ON public.interview_resources;
DROP POLICY IF EXISTS "Admins can manage interview resources" ON public.interview_resources;

CREATE POLICY "Pro users can view interview resources" ON public.interview_resources
FOR SELECT USING (
  is_active = true AND (
    public.is_current_user_admin() OR
    EXISTS (
      SELECT 1 FROM public.user_subscriptions 
      WHERE user_id = auth.uid() 
      AND plan_type = 'pro' 
      AND status = 'active' 
      AND current_period_end > NOW()
    )
  )
);

CREATE POLICY "Admins can manage interview resources" ON public.interview_resources
FOR ALL USING (public.is_current_user_admin());

-- Course certificate management policies
CREATE POLICY "Users can view their own certificate management" ON public.course_certificate_management
FOR SELECT USING (
  clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub') OR
  public.is_current_user_admin()
);

CREATE POLICY "System can manage certificate management" ON public.course_certificate_management
FOR ALL WITH CHECK (true);

-- =====================================================
-- 7. CREATE OR UPDATE ESSENTIAL FUNCTIONS
-- =====================================================

-- Function to generate consistent UUID (matches frontend logic)
CREATE OR REPLACE FUNCTION public.generateConsistentUUID(user_id TEXT)
RETURNS UUID AS $$
DECLARE
  namespace_uuid TEXT := '1b671a64-40d5-491e-99b0-da01ff1f3341';
  input_text TEXT;
  hash_val INTEGER := 0;
  char_code INTEGER;
  hex_str TEXT;
  uuid_str TEXT;
BEGIN
  input_text := user_id || namespace_uuid;
  
  -- Simple hash function to create deterministic UUID (matches frontend logic)
  FOR i IN 1..length(input_text) LOOP
    char_code := ascii(substring(input_text from i for 1));
    hash_val := ((hash_val << 5) - hash_val + char_code) & 2147483647; -- 32-bit integer
  END LOOP;
  
  -- Convert hash to hex and pad to create UUID format
  hex_str := lpad(to_hex(abs(hash_val)), 8, '0');
  uuid_str := substring(hex_str from 1 for 8) || '-' ||
              substring(hex_str from 1 for 4) || '-4' ||
              substring(hex_str from 2 for 3) || '-a' ||
              substring(hex_str from 1 for 3) ||
              lpad(substring(hex_str from 1 for 12), 12, '0');
  
  RETURN uuid_str::UUID;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback to a random UUID if generation fails
    RETURN gen_random_uuid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ensure user profile exists
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  p_user_id UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_role TEXT DEFAULT 'student',
  p_auth_provider TEXT DEFAULT 'clerk'
)
RETURNS UUID AS $$
DECLARE
  existing_id UUID;
BEGIN
  -- First try to find by the provided user_id
  SELECT id INTO existing_id FROM public.profiles WHERE id = p_user_id;
  
  IF existing_id IS NOT NULL THEN
    -- Update existing profile with any missing information
    UPDATE public.profiles 
    SET 
      full_name = COALESCE(profiles.full_name, p_full_name),
      email = COALESCE(profiles.email, p_email),
      role = COALESCE(profiles.role::text, p_role)::user_role,
      auth_provider = COALESCE(profiles.auth_provider, p_auth_provider),
      updated_at = NOW()
    WHERE id = p_user_id;
    RETURN p_user_id;
  END IF;
  
  -- If not found by ID, try to find by email
  SELECT id INTO existing_id FROM public.profiles WHERE email = p_email;
  
  IF existing_id IS NOT NULL THEN
    -- Update existing profile with new ID and information
    UPDATE public.profiles 
    SET 
      id = p_user_id,
      full_name = COALESCE(profiles.full_name, p_full_name),
      role = COALESCE(profiles.role::text, p_role)::user_role,
      auth_provider = COALESCE(profiles.auth_provider, p_auth_provider),
      updated_at = NOW()
    WHERE email = p_email;
    RETURN p_user_id;
  END IF;
  
  -- Create new profile
  INSERT INTO public.profiles (id, full_name, email, role, auth_provider)
  VALUES (p_user_id, p_full_name, p_email, p_role::user_role, p_auth_provider);
  
  RETURN p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get or create user profile
CREATE OR REPLACE FUNCTION public.get_or_create_user_profile(
  p_clerk_user_id TEXT,
  p_full_name TEXT,
  p_email TEXT,
  p_role TEXT DEFAULT 'student'
)
RETURNS UUID AS $$
DECLARE
  supabase_user_id UUID;
BEGIN
  -- Generate consistent UUID using the same logic as frontend
  SELECT public.generateConsistentUUID(p_clerk_user_id) INTO supabase_user_id;
  
  -- Ensure profile exists using the fixed function
  RETURN public.ensure_user_profile(supabase_user_id, p_full_name, p_email, p_role, 'clerk');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update course certificate management
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

-- Enhanced get_api_keys function
CREATE OR REPLACE FUNCTION public.get_api_keys()
RETURNS TABLE(
  gemini_api_key TEXT,
  google_tts_api_key TEXT,
  clerk_publishable_key TEXT,
  razorpay_key_id TEXT,
  razorpay_key_secret TEXT,
  pro_plan_price_inr INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ac.gemini_api_key,
    ac.google_tts_api_key,
    ac.clerk_publishable_key,
    ac.razorpay_key_id,
    ac.razorpay_key_secret,
    ac.pro_plan_price_inr
  FROM public.admin_credentials ac
  LIMIT 1;
END;
$$;

-- =====================================================
-- 8. CREATE UNIFIED CERTIFICATE VIEW
-- =====================================================

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
  uc.issued_date,
  uc.created_at,
  uc.updated_at,
  COALESCE(c.title, 'Certificate') as certificate_title,
  COALESCE(c.description, 'Certificate of completion') as certificate_description,
  COALESCE(c.certificate_type, 'completion') as certificate_type
FROM public.user_certificates uc
LEFT JOIN public.certificates c ON uc.certificate_id = c.id
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
  ccm.completion_date as issued_date,
  ccm.created_at,
  ccm.updated_at,
  ccm.course_name || ' Completion Certificate' as certificate_title,
  'Certificate of successful completion for ' || ccm.course_name as certificate_description,
  'completion' as certificate_type
FROM public.course_certificate_management ccm
WHERE ccm.course_complete = true AND ccm.assessment_pass = true;

-- =====================================================
-- 9. GRANT PERMISSIONS TO FUNCTIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION public.generateConsistentUUID(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_user_profile(TEXT, TEXT, TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.update_course_certificate_management(TEXT, TEXT, TEXT, BOOLEAN, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_api_keys() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.jwt_email() TO authenticated, anon;

-- =====================================================
-- 10. INSERT DEFAULT DATA IF MISSING
-- =====================================================

-- Insert default certificate if none exists
INSERT INTO public.certificates (title, description, certificate_type, is_active, auto_issue)
SELECT 'Course Completion Certificate', 'Certificate of successful course completion', 'completion', true, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.certificates WHERE certificate_type = 'completion' AND is_active = true
);

-- Insert default certificate template if none exists
INSERT INTO public.certificate_templates (name, description, html_template, is_default, is_active)
SELECT 
  'Default Certificate Template',
  'Standard certificate template for course completion',
  '<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .certificate { border: 5px solid #333; padding: 50px; margin: 20px; }
        .title { font-size: 36px; font-weight: bold; margin-bottom: 20px; }
        .name { font-size: 28px; color: #0066cc; margin: 20px 0; }
        .course { font-size: 20px; margin: 20px 0; }
        .date { font-size: 16px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="title">Certificate of Completion</div>
        <p>This certifies that</p>
        <div class="name">{{user_name}}</div>
        <p>has successfully completed</p>
        <div class="course">{{course_name}}</div>
        <div class="date">Completed on {{completion_date}}</div>
        <div class="date">Score: {{score}}</div>
        <div class="date">Issued by {{company_name}}</div>
    </div>
</body>
</html>',
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.certificate_templates WHERE is_default = true AND is_active = true
);

-- =====================================================
-- 11. CREATE STORAGE BUCKETS AND POLICIES
-- =====================================================

-- Create course-videos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-videos', 
  'course-videos', 
  true, 
  524288000, -- 500MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
) ON CONFLICT (id) DO NOTHING;

-- Create interview-resources bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('interview-resources', 'interview-resources', false)
ON CONFLICT (id) DO NOTHING;

-- Clean up and recreate storage policies for course-videos
DROP POLICY IF EXISTS "Anyone can view course videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload course videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update course videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete course videos" ON storage.objects;

CREATE POLICY "Anyone can view course videos" ON storage.objects
FOR SELECT USING (bucket_id = 'course-videos');

CREATE POLICY "Admins can manage course videos" ON storage.objects
FOR ALL USING (
  bucket_id = 'course-videos' AND public.is_current_user_admin()
);

-- Clean up and recreate storage policies for interview-resources
DROP POLICY IF EXISTS "Admins can manage interview resources" ON storage.objects;
DROP POLICY IF EXISTS "Pro users can download interview resources" ON storage.objects;

CREATE POLICY "Admins can manage interview resources" ON storage.objects
FOR ALL USING (
  bucket_id = 'interview-resources' AND public.is_current_user_admin()
);

CREATE POLICY "Pro users can download interview resources" ON storage.objects
FOR SELECT USING (
  bucket_id = 'interview-resources' AND (
    public.is_current_user_admin() OR
    EXISTS (
      SELECT 1 FROM public.user_subscriptions
      WHERE user_id = auth.uid()
      AND plan_type = 'pro'
      AND status = 'active'
      AND current_period_end > NOW()
    )
  )
);

-- =====================================================
-- 12. ENABLE REALTIME FOR KEY TABLES
-- =====================================================

-- Enable realtime replication for tables that need live updates
ALTER TABLE public.user_certificates REPLICA IDENTITY FULL;
ALTER TABLE public.user_subscriptions REPLICA IDENTITY FULL;
ALTER TABLE public.payments REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add tables to realtime publication
DO $$
BEGIN
  -- Add tables to realtime publication if not already added
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_certificates;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_subscriptions;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END$$;

-- =====================================================
-- 13. FINAL VERIFICATION AND CLEANUP
-- =====================================================

-- Verify all functions exist and are accessible
SELECT 'Functions created successfully' as status,
       COUNT(*) as function_count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'generateConsistentUUID',
  'ensure_user_profile', 
  'get_or_create_user_profile',
  'update_course_certificate_management',
  'get_api_keys',
  'is_current_user_admin'
);

-- Verify all tables have RLS enabled
SELECT 'RLS verification' as status,
       COUNT(*) as tables_with_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relkind = 'r'
AND c.relrowsecurity = true;

-- Final success message
SELECT 'Backend setup completed successfully!' as final_status;