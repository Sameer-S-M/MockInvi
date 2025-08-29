-- Complete Database Fix for MockInvi Website
-- This script fixes ALL database issues preventing the website from working

-- 1. Drop existing broken functions
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

-- 4. Ensure profiles table has all necessary columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'clerk',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 5. Create unique index on email to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique 
ON public.profiles(email) 
WHERE email IS NOT NULL;

-- 6. Fix RLS policies for payments table
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;

CREATE POLICY "Users can view their own payments" 
  ON public.payments 
  FOR SELECT 
  USING (
    auth.uid()::text = user_id::text OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert their own payments" 
  ON public.payments 
  FOR INSERT 
  WITH CHECK (
    auth.uid()::text = user_id::text OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 7. Fix RLS policies for user_subscriptions table
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;

CREATE POLICY "Users can view their own subscriptions" 
  ON public.user_subscriptions 
  FOR SELECT 
  USING (
    auth.uid()::text = user_id::text OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert their own subscriptions" 
  ON public.user_subscriptions 
  FOR INSERT 
  WITH CHECK (
    auth.uid()::text = user_id::text OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can update their own subscriptions" 
  ON public.user_subscriptions 
  FOR UPDATE 
  USING (
    auth.uid()::text = user_id::text OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 8. Grant necessary permissions
GRANT EXECUTE ON FUNCTION ensure_user_profile(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_user_profile(TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_provider ON public.profiles(auth_provider);
CREATE INDEX IF NOT EXISTS idx_payments_user_id_status ON public.payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id_status ON public.user_subscriptions(user_id, status);

-- 10. Test the functions work
SELECT 'Database functions fixed successfully!' as status;
