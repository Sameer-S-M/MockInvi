-- Fix duplicate subscriptions and add unique constraint
-- This script will clean up duplicate data and then add the proper constraint

-- Step 1: Check for duplicate user_id values
SELECT 
    user_id, 
    COUNT(*) as duplicate_count
FROM public.user_subscriptions 
GROUP BY user_id 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Step 2: Show the duplicate records for inspection
SELECT 
    id,
    user_id,
    plan_type,
    status,
    current_period_start,
    current_period_end,
    created_at,
    updated_at
FROM public.user_subscriptions 
WHERE user_id IN (
    SELECT user_id 
    FROM public.user_subscriptions 
    GROUP BY user_id 
    HAVING COUNT(*) > 1
)
ORDER BY user_id, created_at DESC;

-- Step 3: Keep only the most recent subscription for each user
-- Delete older duplicate records, keeping the one with the latest updated_at
DELETE FROM public.user_subscriptions 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM public.user_subscriptions
    ORDER BY user_id, updated_at DESC NULLS LAST, created_at DESC
);

-- Step 4: Verify duplicates are removed
SELECT 
    user_id, 
    COUNT(*) as record_count
FROM public.user_subscriptions 
GROUP BY user_id 
HAVING COUNT(*) > 1
ORDER BY record_count DESC;

-- Step 5: Now add the unique constraint
ALTER TABLE public.user_subscriptions 
ADD CONSTRAINT user_subscriptions_user_id_unique 
UNIQUE (user_id);

-- Step 6: Verify the constraint was added
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE 
    tc.constraint_type = 'UNIQUE' 
    AND tc.table_name = 'user_subscriptions';

-- Step 7: Final verification - check table structure
SELECT 
    COUNT(*) as total_subscriptions,
    COUNT(DISTINCT user_id) as unique_users
FROM public.user_subscriptions;




