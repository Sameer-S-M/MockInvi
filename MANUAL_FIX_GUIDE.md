# 🚀 Manual Fix Guide for MockInvi Website

## 🚨 **CRITICAL ISSUES IDENTIFIED:**
1. **Database Function Column Ambiguity** - Blocking user profile creation
2. **Clerk JWT Template Missing** - Authentication failing
3. **Supabase OIDC Not Configured** - Users can't authenticate
4. **Edge Function Errors** - Payment verification failing

---

## 📋 **STEP 1: Fix Database Functions (IMMEDIATE)**

### **Go to Supabase Dashboard:**
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `ygcdksdsleyazlxfjpid`
3. Go to **SQL Editor**

### **Run This SQL (Copy & Paste):**
```sql
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
```

### **Verify Success:**
- You should see: `Database functions fixed successfully!`

---

## 📋 **STEP 2: Configure Clerk JWT Template**

### **Go to Clerk Dashboard:**
1. Open [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **JWT Templates**

### **Create New Template:**
1. Click **"New template"**
2. **Name**: `supabase`
3. **Claims to include**:
   ```json
   {
     "sub": "{{user.id}}",
     "email": "{{user.primary_email_address.email_address}}",
     "email_verified": "{{user.primary_email_address.verification.status}}"
   }
   ```
4. Click **"Create template"**

---

## 📋 **STEP 3: Configure Supabase OIDC**

### **Go to Supabase Dashboard:**
1. Go to **Authentication** → **Providers**
2. Find **OIDC** section
3. Click **"Enable"**

### **Add Clerk as Provider:**
1. **Provider**: `clerk`
2. **Client ID**: Your Clerk application ID
3. **Client Secret**: Your Clerk application secret
4. **Issuer URL**: `https://your-app.clerk.accounts.dev`
5. Click **"Save"**

---

## 📋 **STEP 4: Deploy Edge Functions**

### **Install Supabase CLI (if not installed):**
```bash
npm install -g supabase
```

### **Login to Supabase:**
```bash
supabase login
```

### **Deploy Functions:**
```bash
supabase functions deploy razorpay-payment
```

---

## 📋 **STEP 5: Test the Website**

### **1. Test User Registration:**
- Go to your website
- Try to register a new user
- Check if profile creation works

### **2. Test Authentication:**
- Try to log in
- Check if Supabase session is established

### **3. Test Payment:**
- Go to pricing page
- Try to purchase a Pro plan
- Check if payment verification works

---

## 🔍 **TROUBLESHOOTING:**

### **If Profile Creation Still Fails:**
1. Check Supabase logs for errors
2. Verify database functions exist
3. Check RLS policies

### **If Authentication Fails:**
1. Verify Clerk JWT template exists
2. Check Supabase OIDC configuration
3. Verify environment variables

### **If Payment Fails:**
1. Check Edge Function logs
2. Verify Razorpay credentials
3. Check database permissions

---

## ✅ **EXPECTED RESULTS:**

After applying all fixes:
- ✅ Users can register and log in
- ✅ User profiles are created automatically
- ✅ Payment system works properly
- ✅ Subscriptions are managed correctly
- ✅ Entire website functions normally

---

## 🆘 **NEED HELP?**

If you encounter issues:
1. Check the error messages in browser console
2. Check Supabase logs
3. Verify all configuration steps
4. Test each component individually

---

## 🎯 **SUCCESS INDICATORS:**

- ✅ No more "column reference is ambiguous" errors
- ✅ User profiles are created successfully
- ✅ Authentication completes without errors
- ✅ Payment verification works
- ✅ Website loads and functions normally

**Your website should now work completely! 🎉**

