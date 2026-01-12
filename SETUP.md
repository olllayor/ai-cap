# AI-Cap Setup Guide

This guide will help you set up the AI-Cap project with Supabase authentication and database.

## Prerequisites

- [Bun](https://bun.sh/) installed (v1.0.0 or higher)
- A [Supabase](https://supabase.com/) account
- A Google Cloud project (for Google OAuth)

## 1. Install Dependencies

```bash
bun install
```

## 2. Supabase Setup

### 2.1 Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - **Name**: `ai-cap` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
4. Wait for the project to be created (this may take a few minutes)

### 2.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### 2.3 Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and update with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 2.4 Database Schema

The database schema has already been set up with the following:
- `profiles` table to store user information
- Row Level Security (RLS) policies for data protection
- Automatic profile creation trigger when users sign up

## 3. Google OAuth Setup

### 3.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Choose **Web application**
   - Add authorized redirect URIs:
     - `https://your-project-id.supabase.co/auth/v1/callback`
     - For local development: `http://localhost:5173/auth/callback` (optional)
5. Copy your **Client ID** and **Client Secret**

### 3.2 Configure Google OAuth in Supabase

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** in the list and click to expand
3. Enable Google provider
4. Paste your Google **Client ID** and **Client Secret**
5. Click **Save**

### 3.3 Configure Redirect URLs

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add your site URL to **Site URL**:
   - For development: `http://localhost:5173`
   - For production: Your actual domain (e.g., `https://ai-cap.vercel.app`)
3. Add redirect URLs to **Redirect URLs**:
   - For development: `http://localhost:5173`
   - For production: Your actual domain

## 4. Running the Application

### Development Mode

Start the development server:

```bash
bun run dev
```

The app will be available at `http://localhost:5173`

### Production Build

Build the application for production:

```bash
bun run build
```

Preview the production build:

```bash
bun run preview
```

## 5. Testing Authentication

1. Open the app in your browser
2. You should see a login screen with "Continue with Google"
3. Click the Google sign-in button
4. Authorize with your Google account
5. You should be redirected back to the app and see the main interface
6. Your profile should appear in the top-right corner
7. Click on your profile to see sign-out option

## 6. Troubleshooting

### "Missing Supabase environment variables" Error

- Make sure you've created the `.env` file
- Verify that the environment variables are correctly set
- Restart the development server after changing `.env`

### Google Sign-In Not Working

- Verify that your Google OAuth credentials are correct in Supabase
- Check that your redirect URLs are properly configured
- Ensure the Google+ API is enabled in Google Cloud Console
- Check browser console for error messages

### "Browser Not Supported" Message

This app requires modern browser features:
- **WebAssembly**: For FFmpeg video processing
- **SharedArrayBuffer**: For multi-threaded processing
- Use Chrome, Edge, or Firefox (latest versions)
- Ensure secure context (HTTPS in production)

### Authentication Redirect Issues

- Make sure your Site URL and Redirect URLs are correctly configured in Supabase
- For local development, use `http://localhost:5173` (not `127.0.0.1`)
- Clear browser cookies and try again

## 7. Database Schema Reference

### Profiles Table

```sql
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### Row Level Security Policies

- Users can only view their own profile
- Users can only update their own profile
- Profiles are automatically created when users sign up

## 8. Next Steps

Now that authentication is set up, you can:

1. Start uploading videos and generating captions
2. Customize caption styles
3. Export videos with burned-in captions

All video processing happens client-side, ensuring your privacy and security.

## 9. Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## 10. Security Notes

- Never commit `.env` file to version control
- The anon key is safe to use in client-side code
- Row Level Security (RLS) protects user data
- All video processing happens client-side (no data sent to servers)

## Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/olllayor/ai-cap/issues)
- Review Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)