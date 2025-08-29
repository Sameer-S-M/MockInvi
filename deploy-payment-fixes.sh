#!/bin/bash

# Payment and Subscription Fixes Deployment Script
# This script applies all the necessary fixes to resolve payment verification issues

echo "🚀 Deploying Payment and Subscription Fixes..."
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed"
    echo "Please install it with: npm install -g supabase"
    exit 1
fi

# Check if environment variables are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Missing Supabase environment variables"
    echo "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
    exit 1
fi

echo "✅ Environment check passed"

# Step 1: Apply database migration
echo ""
echo "📊 Step 1: Applying database migration..."
if [ -f "supabase/migrations/20250828190000_fix_payment_and_subscription_issues.sql" ]; then
    echo "✅ Migration file found"
    echo "Please run the following SQL in your Supabase dashboard:"
    echo ""
    echo "1. Go to your Supabase Dashboard"
    echo "2. Navigate to SQL Editor"
    echo "3. Copy and paste the contents of: supabase/migrations/20250828190000_fix_payment_and_subscription_issues.sql"
    echo "4. Execute the script"
    echo ""
    read -p "Press Enter after you've applied the database migration..."
else
    echo "❌ Migration file not found"
    exit 1
fi

# Step 2: Deploy Edge Functions
echo ""
echo "🔧 Step 2: Deploying updated Edge Functions..."
echo "Deploying razorpay-payment function..."

if supabase functions deploy razorpay-payment; then
    echo "✅ Razorpay payment function deployed successfully"
else
    echo "❌ Failed to deploy razorpay-payment function"
    echo "Please check your Supabase configuration and try again"
    exit 1
fi

# Step 3: Test the fixes
echo ""
echo "🧪 Step 3: Testing the fixes..."
if command -v node &> /dev/null; then
    if [ -f "test-payment-fixes.js" ]; then
        echo "Running test script..."
        node test-payment-fixes.js
    else
        echo "⚠️  Test script not found, skipping tests"
    fi
else
    echo "⚠️  Node.js not found, skipping tests"
fi

# Step 4: Build and restart application
echo ""
echo "🏗️  Step 4: Building application..."
if npm run build; then
    echo "✅ Application built successfully"
else
    echo "❌ Build failed"
    echo "Please check for any TypeScript or build errors"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Restart your application server"
echo "2. Test payment flow with a small amount"
echo "3. Check the logs for any errors"
echo "4. Monitor payment success rate"
echo ""
echo "📚 For more information, see: PAYMENT_FIXES_README.md"
echo ""
echo "🔍 To monitor the fixes:"
echo "- Check Supabase logs for any RLS policy violations"
echo "- Monitor Edge function logs for payment verification errors"
echo "- Test with a fresh user account"
echo ""
echo "✅ All payment and subscription fixes have been applied!"
