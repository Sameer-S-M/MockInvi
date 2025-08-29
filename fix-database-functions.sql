-- Fix Database Functions - Remove Column Ambiguity
-- This fixes the "column reference is ambiguous" error

-- 1. Drop the existing broken functions
DROP FUNCTION IF EXISTS ensure_user_profile(UUID, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_or_create_user_profile(TEXT, TEXT, TEXT, TEXT);

-- 2. Create the fixed ensure_user_profile function with proper parameter naming
CREATE OR REPLACE FUNCTION ensure_user_profile(
  user_id UUID,
  user_full_name TEXT,
  user_email TEXT,
  user_role TEXT DEFAULT 'student',
  user_auth_provider TEXT DEFAULT 'clerk'
)
RETURNS UUID AS $$
DECLARE
  existing_id UUID;
BEGIN
  -- First try to find by the provided user_id
  SELECT id INTO existing_id FROM public.profiles WHERE id = user_id;
  
  IF existing_id IS NOT NULL THEN
    -- Update existing profile with any missing information
    UPDATE public.profiles 
    SET 
      full_name = COALESCE(profiles.full_name, user_full_name),
      email = COALESCE(profiles.email, user_email),
      role = COALESCE(profiles.role::text, user_role)::user_role,
      auth_provider = COALESCE(profiles.auth_provider, user_auth_provider),
      updated_at = NOW()
    WHERE id = user_id;
    RETURN user_id;
  END IF;
  
  -- If not found by ID, try to find by email
  SELECT id INTO existing_id FROM public.profiles WHERE email = user_email;
  
  IF existing_id IS NOT NULL THEN
    -- Update existing profile with new ID and information
    UPDATE public.profiles 
    SET 
      id = user_id,
      full_name = COALESCE(profiles.full_name, user_full_name),
      role = COALESCE(profiles.role::text, user_role)::user_role,
      auth_provider = COALESCE(profiles.auth_provider, user_auth_provider),
      updated_at = NOW()
    WHERE email = user_email;
    RETURN user_id;
  END IF;
  
  -- Create new profile
  INSERT INTO public.profiles (id, full_name, email, role, auth_provider)
  VALUES (user_id, user_full_name, user_email, user_role::user_role, user_auth_provider);
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the fixed get_or_create_user_profile function
CREATE OR REPLACE FUNCTION get_or_create_user_profile(
  clerk_user_id TEXT,
  user_full_name TEXT,
  user_email TEXT,
  user_role TEXT DEFAULT 'student'
)
RETURNS UUID AS $$
DECLARE
  supabase_user_id UUID;
BEGIN
  -- Generate consistent UUID using the same logic as frontend
  SELECT generateConsistentUUID(clerk_user_id) INTO supabase_user_id;
  
  -- Ensure profile exists using the fixed function
  RETURN ensure_user_profile(supabase_user_id, user_full_name, user_email, user_role, 'clerk');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant necessary permissions
GRANT EXECUTE ON FUNCTION ensure_user_profile(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_user_profile(TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- 5. Test the functions work
SELECT 'Database functions fixed successfully!' as status;

