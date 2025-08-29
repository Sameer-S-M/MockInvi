-- Fix subscription constraint for payment system to work
-- This adds the missing unique constraint that prevents upsert operations from working

-- Add unique constraint to user_subscriptions table for upsert to work
ALTER TABLE public.user_subscriptions 
ADD CONSTRAINT user_subscriptions_user_id_unique 
UNIQUE (user_id);

-- If the above fails (constraint already exists), try this instead:
-- ALTER TABLE public.user_subscriptions 
-- ADD CONSTRAINT user_subscriptions_user_id_status_unique 
-- UNIQUE (user_id, status);

-- Verify the constraint was added
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


