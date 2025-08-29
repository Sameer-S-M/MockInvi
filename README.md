# MockInvi – AI-Powered Interview Preparation

## Project Overview

MockInvi is an AI-powered platform designed to help you master interviews. Upload your resume, practice with personalized questions, and receive real-time feedback with a modern macOS/iOS-inspired glassmorphic UI. It includes an AI Resume Maker, Learning Hub with assessments, certificates, and an admin area.

## Getting Started

### Prerequisites

- Node.js & npm installed – [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- GitHub CLI (optional) – `https://cli.github.com/`

### Installation

Follow these steps to set up the project locally:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies
npm i

# Step 4: Start the development server with auto-reloading and an instant preview
npm run dev
```

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Backend)
- Clerk (Authentication)

## Features

- AI-powered interview question generation (role-based and resume-based)
- Resume analysis and AI Resume Maker (PDF + DOCX export, live preview, templates)
- Real-time voice-to-text interview practice (Web Speech API)
- Face presence guard (non-blocking) during interviews
- Comprehensive performance reports and trend analytics
- Learning modules with assessments and certificates
- Certificate preview/download with branded template
- Admin dashboard for content management
- Light/Dark mode with system preference support
- Smooth 120Hz-friendly animations and glassmorphic UI

## Environment Variables

Create a `.env` (or `.env.local`) file in the root directory and add your environment variables:
