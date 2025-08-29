-- Create certificate management table for course completion tracking
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

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own certificate management" ON public.course_certificate_management;
CREATE POLICY "Users can view their own certificate management" 
  ON public.course_certificate_management 
  FOR SELECT 
  USING (clerk_user_id = auth.jwt() ->> 'sub');

DROP POLICY IF EXISTS "System can insert certificate management" ON public.course_certificate_management;
CREATE POLICY "System can insert certificate management" 
  ON public.course_certificate_management 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can update certificate management" ON public.course_certificate_management;
CREATE POLICY "System can update certificate management" 
  ON public.course_certificate_management 
  FOR UPDATE 
  USING (true);

-- Create function to update certificate management
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
