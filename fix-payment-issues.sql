-- Fix payment and subscription issues
-- Run this script in your Supabase SQL editor

-- 1. Ensure profiles table has all necessary columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'clerk',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 2. Create unique index on email to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique 
ON public.profiles(email) 
WHERE email IS NOT NULL;

-- 3. Update RLS policies for payments table to be more permissive for service role
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

-- 4. Update RLS policies for user_subscriptions table
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

-- 5. Create function to generate consistent UUID (matches frontend logic)
CREATE OR REPLACE FUNCTION generateConsistentUUID(user_id TEXT)
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
$$ LANGUAGE plpgsql;

-- 6. Create function to ensure user profile exists
CREATE OR REPLACE FUNCTION ensure_user_profile(
  user_id UUID,
  full_name TEXT,
  user_email TEXT,
  user_role TEXT DEFAULT 'student',
  auth_provider TEXT DEFAULT 'clerk'
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
      full_name = COALESCE(profiles.full_name, full_name),
      email = COALESCE(profiles.email, user_email),
      role = COALESCE(profiles.role::text, user_role)::user_role,
      auth_provider = COALESCE(profiles.auth_provider, auth_provider),
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
      full_name = COALESCE(profiles.full_name, full_name),
      role = COALESCE(profiles.role::text, user_role)::user_role,
      auth_provider = COALESCE(profiles.auth_provider, auth_provider),
      updated_at = NOW()
    WHERE email = user_email;
    RETURN user_id;
  END IF;
  
  -- Create new profile
  INSERT INTO public.profiles (id, full_name, email, role, auth_provider)
  VALUES (user_id, full_name, user_email, user_role::user_role, auth_provider);
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to get or create user profile
CREATE OR REPLACE FUNCTION get_or_create_user_profile(
  clerk_user_id TEXT,
  full_name TEXT,
  user_email TEXT,
  user_role TEXT DEFAULT 'student'
)
RETURNS UUID AS $$
DECLARE
  supabase_user_id UUID;
BEGIN
  -- Generate consistent UUID using the same logic as frontend
  SELECT generateConsistentUUID(clerk_user_id) INTO supabase_user_id;
  
  -- Ensure profile exists
  RETURN ensure_user_profile(supabase_user_id, full_name, user_email, user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant necessary permissions
GRANT EXECUTE ON FUNCTION ensure_user_profile(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_user_profile(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generateConsistentUUID(TEXT) TO authenticated;

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_provider ON public.profiles(auth_provider);
CREATE INDEX IF NOT EXISTS idx_payments_user_id_status ON public.payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id_status ON public.user_subscriptions(user_id, status);

-- 10. Test the functions
SELECT 'UUID generation test:' as test_name, generateConsistentUUID('test_user_123') as generated_uuid;
SELECT 'Profile creation test:' as test_name, get_or_create_user_profile('test_clerk_user', 'Test User', 'test@example.com', 'student') as profile_id;
