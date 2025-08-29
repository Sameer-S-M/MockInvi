-- Fix admin subscription deletion by adding proper RLS policies
-- Run this script in your Supabase SQL Editor to fix the "Remove Pro" functionality

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

-- Add admin policy for updating user subscriptions (in case we need to modify instead of delete)
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

-- Add admin policy for viewing all user subscriptions (for admin panel)
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

-- Add admin policy for inserting user subscriptions (for granting pro)
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
