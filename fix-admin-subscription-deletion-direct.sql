-- DIRECT FIX FOR ADMIN SUBSCRIPTION DELETION
-- Run this in your Supabase SQL Editor to fix the "Remove Pro" functionality

-- First, let's check what policies currently exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_subscriptions';

-- Drop any existing admin policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can delete user subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can update user subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can view all user subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can insert user subscriptions" ON public.user_subscriptions;

-- Add admin policy for deleting user subscriptions
CREATE POLICY "Admins can delete user subscriptions" 
  ON public.user_subscriptions 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add admin policy for updating user subscriptions
CREATE POLICY "Admins can update user subscriptions" 
  ON public.user_subscriptions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add admin policy for viewing all user subscriptions
CREATE POLICY "Admins can view all user subscriptions" 
  ON public.user_subscriptions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add admin policy for inserting user subscriptions
CREATE POLICY "Admins can insert user subscriptions" 
  ON public.user_subscriptions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_subscriptions' 
AND policyname LIKE '%admin%';

-- Test query to see if we can access user_subscriptions as admin
-- (This will show the current user's permissions)
SELECT 
  current_user,
  session_user,
  auth.uid() as auth_uid,
  (SELECT role FROM public.profiles WHERE id = auth.uid()) as user_role;
