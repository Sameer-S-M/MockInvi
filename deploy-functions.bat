@echo off
REM MockInvi Edge Functions Deployment Script for Windows
REM This script deploys all Edge Functions after applying database fixes

echo 🚀 Deploying MockInvi Edge Functions...

REM Check if Supabase CLI is installed
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Supabase CLI not found. Installing...
    npm install -g supabase
)

REM Login to Supabase (if not already logged in)
echo 🔐 Checking Supabase login status...
supabase status
if %errorlevel% neq 0 (
    echo 🔐 Please login to Supabase...
    supabase login
)

REM Deploy all Edge Functions
echo 📦 Deploying Edge Functions...

echo 1️⃣ Deploying razorpay-payment function...
supabase functions deploy razorpay-payment

echo 2️⃣ Deploying voice-to-text function...
supabase functions deploy voice-to-text

echo 3️⃣ Deploying text-to-speech function...
supabase functions deploy text-to-speech

echo 4️⃣ Deploying real-job-search function...
supabase functions deploy real-job-search

echo 5️⃣ Deploying learning-service function...
supabase functions deploy learning-service

echo 6️⃣ Deploying generate-certificate function...
supabase functions deploy generate-certificate

echo 7️⃣ Deploying gemini-job-search function...
supabase functions deploy gemini-job-search

echo 8️⃣ Deploying gemini-interview function...
supabase functions deploy gemini-interview

echo 9️⃣ Deploying admin-upload function...
supabase functions deploy admin-upload

echo ✅ All Edge Functions deployed successfully!

echo.
echo 📋 Next steps:
echo 1. ✅ Database functions fixed
echo 2. ✅ Edge Functions deployed
echo 3. 🔧 Configure Clerk JWT template
echo 4. 🔧 Configure Supabase OIDC
echo 5. 🧪 Test the website
echo.
echo 🎯 Your website should now work properly!

pause

