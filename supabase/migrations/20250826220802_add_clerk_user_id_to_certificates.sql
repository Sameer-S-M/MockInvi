-- Add clerk_user_id column to user_certificates table for consistency with certificate management
ALTER TABLE public.user_certificates 
ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

-- Create index for better performance on clerk_user_id lookups
CREATE INDEX IF NOT EXISTS idx_user_certificates_clerk_user_id 
ON public.user_certificates(clerk_user_id);

-- Update existing certificates to have clerk_user_id if possible
-- This will be populated by the Edge Function going forward
UPDATE public.user_certificates 
SET clerk_user_id = 'legacy-certificate'
WHERE clerk_user_id IS NULL;

-- Create a view that combines both certificate sources for the frontend
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
