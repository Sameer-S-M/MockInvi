# Gemini API Setup for AI Resume Feature

## 🔑 Required Configuration

The AI Resume feature requires a Gemini API key to function. Follow these steps to set it up:

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Create Environment File

Create a `.env` file in the root directory of your project with the following content:

```env
# Gemini API Key for AI Resume Generation
VITE_GEMINI_API_KEY=your_actual_api_key_here

# Other environment variables (if needed)
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Replace the Placeholder

Replace `your_actual_api_key_here` with your actual Gemini API key.

### 4. Restart Development Server

After creating the `.env` file, restart your development server:

```bash
npm run dev
```

## 🔒 Security Notes

- **Never commit your `.env` file** to version control
- The `.env` file is already in `.gitignore` to prevent accidental commits
- Keep your API key secure and don't share it publicly

## 🧪 Testing

Once configured, you can test the AI Resume feature by:

1. Going to the Resume Maker page
2. Filling in your information
3. Clicking "AI Generate" to create an AI-powered resume

## ❌ Troubleshooting

If you see "Missing VITE_GEMINI_API_KEY" error:

1. ✅ Check that `.env` file exists in the project root
2. ✅ Verify the API key is correctly set
3. ✅ Restart the development server
4. ✅ Check browser console for any additional errors

## 💰 API Usage

- Gemini API has usage limits and may incur costs
- Monitor your usage at [Google AI Studio](https://makersuite.google.com/app/apikey)
- The AI Resume feature uses the Gemini 1.5 Flash model
