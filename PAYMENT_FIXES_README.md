# Payment and Subscription Fixes

This document outlines the comprehensive fixes applied to resolve payment verification failures and subscription issues in the MockInvi application.

## 🚨 Issues Identified

### 1. UUID Generation Mismatch
- **Problem**: Frontend and backend were using different UUID generation logic, causing user ID mismatches
- **Impact**: Payment verification failed because user profiles couldn't be found
- **Solution**: Created consistent UUID generation function in database

### 2. Missing Database Columns
- **Problem**: Profiles table was missing email and auth_provider columns
- **Impact**: User profile creation and lookup failed
- **Solution**: Added missing columns with proper defaults

### 3. Row Level Security (RLS) Policy Issues
- **Problem**: RLS policies were too restrictive for service role operations
- **Impact**: Payment verification couldn't access user data
- **Solution**: Updated policies to allow admin and service role access

### 4. Profile Creation Issues
- **Problem**: Users weren't getting proper profiles created in Supabase
- **Impact**: Payment and subscription data couldn't be associated with users
- **Solution**: Created robust profile management functions

## 🔧 Fixes Applied

### Database Schema Updates

1. **Added missing columns to profiles table**:
   ```sql
   ALTER TABLE public.profiles 
   ADD COLUMN IF NOT EXISTS email TEXT,
   ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'clerk',
   ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
   ```

2. **Created unique index on email**:
   ```sql
   CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique 
   ON public.profiles(email) 
   WHERE email IS NOT NULL;
   ```

### RLS Policy Updates

1. **Updated payments table policies** to allow admin access
2. **Updated user_subscriptions table policies** to allow admin access
3. **Added service role permissions** for payment verification

### Database Functions

1. **`generateConsistentUUID(user_id TEXT)`**: Generates consistent UUIDs matching frontend logic
2. **`ensure_user_profile(...)`**: Ensures user profile exists with proper data
3. **`get_or_create_user_profile(...)`**: Main function for profile management

### Performance Improvements

1. **Added indexes** for better query performance
2. **Optimized lookups** for payments and subscriptions

## 📋 How to Apply Fixes

### Option 1: Run SQL Script (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `fix-payment-issues.sql`
4. Execute the script

### Option 2: Use Migration File

1. The migration file `supabase/migrations/20250828190000_fix_payment_and_subscription_issues.sql` contains all fixes
2. Apply it using your normal migration process

### Option 3: Run Node.js Script

```bash
node apply-payment-fixes.js
```

## 🔄 Code Changes

### Backend Changes

1. **Updated Razorpay payment function** (`supabase/functions/razorpay-payment/index.ts`):
   - Removed local UUID generation
   - Uses database function for profile management
   - Improved error handling

2. **Enhanced user utilities** (`src/utils/userUtils.ts`):
   - Added `getOrCreateUserProfile` function
   - Maintains backward compatibility

3. **Updated authentication context** (`src/contexts/ClerkAuthContext.tsx`):
   - Uses new database functions for profile management
   - Improved user synchronization

### Frontend Changes

1. **Payment button component** remains largely unchanged
2. **Billing data hooks** continue to work with existing logic
3. **Admin panels** now have proper access to payment data

## 🧪 Testing

After applying fixes, test the following:

1. **User Registration**: New users should get proper profiles
2. **Payment Processing**: Payments should verify successfully
3. **Subscription Management**: Subscriptions should be created/updated properly
4. **Admin Access**: Admins should be able to view all payment data

### Test Commands

```sql
-- Test UUID generation
SELECT generateConsistentUUID('test_user_123');

-- Test profile creation
SELECT get_or_create_user_profile('test_clerk_user', 'Test User', 'test@example.com', 'student');

-- Verify RLS policies
SELECT * FROM public.payments LIMIT 1;
SELECT * FROM public.user_subscriptions LIMIT 1;
```

## 🚀 Deployment Steps

1. **Apply database fixes** using one of the methods above
2. **Deploy updated Edge Functions**:
   ```bash
   supabase functions deploy razorpay-payment
   ```
3. **Restart your application** to pick up frontend changes
4. **Test payment flow** with a small amount

## 🔍 Monitoring

After deployment, monitor:

1. **Payment success rate** in Razorpay dashboard
2. **Database logs** for any RLS policy violations
3. **Edge function logs** for payment verification errors
4. **User profile creation** success rate

## 🆘 Troubleshooting

### Common Issues

1. **"User profile not found" errors**:
   - Check if email column exists in profiles table
   - Verify RLS policies are applied correctly

2. **Payment verification still failing**:
   - Check Edge function logs
   - Verify Razorpay credentials are correct
   - Ensure database functions are created

3. **RLS policy violations**:
   - Check if admin policies are applied
   - Verify user roles are set correctly

### Debug Commands

```sql
-- Check if functions exist
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Check table structure
\d public.profiles
\d public.payments
\d public.user_subscriptions
```

## 📞 Support

If you encounter issues after applying these fixes:

1. Check the Supabase logs for detailed error messages
2. Verify all SQL statements executed successfully
3. Test with a fresh user account
4. Contact support with specific error messages

## ✅ Success Criteria

The fixes are successful when:

- ✅ New users can register without profile creation errors
- ✅ Payment verification completes successfully
- ✅ Subscriptions are created and managed properly
- ✅ Admin users can access payment and subscription data
- ✅ No RLS policy violations in logs
- ✅ Consistent user IDs across frontend and backend

---

**Last Updated**: August 28, 2025
**Version**: 1.0.0
