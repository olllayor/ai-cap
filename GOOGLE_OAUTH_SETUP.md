# Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth authentication for AI-Cap.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Your Supabase project URL: `https://eicdiuqptidalwepdtxq.supabase.co`

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click **"New Project"**
4. Enter project details:
   - **Project Name**: `AI-Cap` (or your preferred name)
   - **Organization**: Leave as default (if applicable)
5. Click **"Create"**
6. Wait for the project to be created (may take a few seconds)
7. Select the new project from the project dropdown

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on **"Google+ API"** in the results
4. Click the **"Enable"** button
5. Wait for the API to be enabled

> **Note**: Google+ API is required for OAuth to work, even though Google+ has been shut down. The API is still used for authentication.

## Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** user type (unless you have a Google Workspace account)
3. Click **"Create"**

### App Information
- **App name**: `AI-Cap`
- **User support email**: Your email address
- **App logo**: (Optional) Upload your app logo
- **Application home page**: Your app URL (e.g., `http://localhost:5173` for dev)
- **Application privacy policy link**: (Optional, can add later)
- **Application terms of service link**: (Optional, can add later)

### Developer Contact Information
- **Email addresses**: Your email address

4. Click **"Save and Continue"**

### Scopes
5. Click **"Add or Remove Scopes"**
6. Select the following scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
7. Click **"Update"** and then **"Save and Continue"**

### Test Users (Development Only)
8. Click **"Add Users"**
9. Add your email address (and any other testers)
10. Click **"Save and Continue"**

### Summary
11. Review your settings and click **"Back to Dashboard"**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"** as the application type
4. Configure the OAuth client:

### Application Details
- **Name**: `AI-Cap Web Client`

### Authorized JavaScript Origins
Add the following origins:
- `http://localhost:5173` (for local development)
- `https://eicdiuqptidalwepdtxq.supabase.co` (for Supabase)
- Your production domain (when deployed, e.g., `https://ai-cap.vercel.app`)

### Authorized Redirect URIs
Add the following redirect URIs:
- `http://localhost:5173` (for local development)
- `https://eicdiuqptidalwepdtxq.supabase.co/auth/v1/callback` (for Supabase)
- Your production domain callback (when deployed, e.g., `https://ai-cap.vercel.app`)

5. Click **"Create"**

### Save Your Credentials
6. A popup will appear with your credentials:
   - **Client ID**: Copy this (looks like `xxxxx.apps.googleusercontent.com`)
   - **Client Secret**: Copy this (looks like `GOCSPX-xxxxx`)

⚠️ **Important**: Keep these credentials secure! Don't commit them to version control.

## Step 5: Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project: **ai-cap**
3. Go to **"Authentication"** → **"Providers"**
4. Find **"Google"** in the list and click to expand

### Enable Google Provider
5. Toggle **"Enable Sign in with Google"** to ON
6. Enter your credentials:
   - **Client ID**: Paste the Client ID from Step 4
   - **Client Secret**: Paste the Client Secret from Step 4
7. Click **"Save"**

## Step 6: Configure Redirect URLs in Supabase

1. In Supabase Dashboard, go to **"Authentication"** → **"URL Configuration"**
2. Set the following URLs:

### Site URL
- For development: `http://localhost:5173`
- For production: Your actual domain (e.g., `https://ai-cap.vercel.app`)

### Redirect URLs
Add the following (one per line):
```
http://localhost:5173
http://localhost:5173/**
https://your-production-domain.com
https://your-production-domain.com/**
```

3. Click **"Save"**

## Step 7: Test the Setup

1. Start your development server:
   ```bash
   cd ai-cap
   bun run dev
   ```

2. Open your browser to `http://localhost:5173`

3. You should see the login screen with "Continue with Google"

4. Click the button and test the authentication flow:
   - You'll be redirected to Google
   - Sign in with your Google account
   - Authorize the application
   - You'll be redirected back to your app
   - You should see the main interface

5. Check your profile in the top-right corner

6. Verify in Supabase Dashboard:
   - Go to **"Authentication"** → **"Users"**
   - Your user should appear in the list
   - Go to **"Table Editor"** → **"profiles"**
   - Your profile should be automatically created

## Troubleshooting

### Error: "Redirect URI mismatch"

**Problem**: The redirect URI in your request doesn't match the ones configured in Google Cloud Console.

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Make sure the redirect URI exactly matches: `https://eicdiuqptidalwepdtxq.supabase.co/auth/v1/callback`
4. Save and try again

### Error: "Access blocked: This app's request is invalid"

**Problem**: The OAuth consent screen is not properly configured.

**Solution**:
1. Go to Google Cloud Console → OAuth consent screen
2. Make sure you've added your email as a test user
3. Make sure the app is in "Testing" mode
4. Add the required scopes (email and profile)

### Error: "User not found" or "Profile not created"

**Problem**: The database trigger might not be working.

**Solution**:
1. Check Supabase Dashboard → Database → Functions
2. Verify `handle_new_user` function exists
3. Check Database → Triggers
4. Verify `on_auth_user_created` trigger is enabled
5. Try signing in again

### Authentication works but user data not showing

**Problem**: Row Level Security (RLS) policies might be blocking access.

**Solution**:
1. Go to Supabase Dashboard → Authentication → Policies
2. Verify the policies for `profiles` table
3. Make sure "Users can view their own profile" policy exists
4. Check the policy SQL matches the user's ID

### Popup blocked by browser

**Problem**: Browser is blocking the OAuth popup.

**Solution**:
1. Allow popups for `localhost:5173`
2. Or use redirect flow instead (current implementation)
3. Check browser console for errors

## Production Deployment

When deploying to production:

1. **Update Google Cloud Console**:
   - Add your production domain to Authorized JavaScript Origins
   - Add your production callback to Authorized Redirect URIs
   - Format: `https://your-domain.com/auth/callback`

2. **Update Supabase**:
   - Set Site URL to your production domain
   - Add production domain to Redirect URLs
   - Update CORS settings if needed

3. **Environment Variables**:
   - Make sure production environment has the correct Supabase credentials
   - Never expose credentials in client-side code (already handled)

4. **Google OAuth Consent Screen**:
   - Consider publishing your app (removes "unverified app" warning)
   - Add privacy policy and terms of service
   - Complete OAuth verification process

## Security Best Practices

✅ Client credentials are safe to expose in client-side code  
✅ Never commit `.env` file to version control  
✅ Use environment variables for all credentials  
✅ Enable RLS on all database tables  
✅ Regularly review user access logs  
✅ Keep Supabase and dependencies updated  

## Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Dashboard](https://app.supabase.com/)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review Supabase logs in the Dashboard
3. Check Google Cloud Console logs
4. Open an issue on GitHub

---

**Setup Complete!** 🎉

Once you've completed these steps, your AI-Cap application will be fully configured with Google OAuth authentication.