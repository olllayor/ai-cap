# Authentication Guide

This document provides a quick reference for the Supabase authentication integration in AI-Cap.

## Overview

AI-Cap uses **Supabase Authentication** with **Google OAuth** as the social login provider. All authentication happens securely through Supabase's hosted authentication service.

## Supported Providers

AI-Cap currently supports the following OAuth providers:

- **Google** (implemented in the UI today)

Provider settings are configured in the **Supabase Dashboard** under **Authentication → Providers**. If you enable additional providers in Supabase, you will also need to update the UI/auth flow to expose them in the app.

## Architecture

### Components

1. **AuthProvider** (`src/components/auth/AuthProvider.tsx`)
   - Wraps the entire application
   - Manages authentication state initialization
   - Shows loading screen during auth check
   - Displays login screen if user is not authenticated
   - Renders app content when user is authenticated

2. **Login** (`src/components/auth/Login.tsx`)
   - Presents the Google sign-in button
   - Handles sign-in flow
   - Shows error messages if authentication fails

3. **UserProfile** (`src/components/auth/UserProfile.tsx`)
   - Displays user information in the header
   - Shows user avatar and name
   - Provides sign-out functionality

### State Management

The authentication state is managed using **Zustand** in `src/stores/auth.store.ts`:

```typescript
interface AuthState {
  user: User | null;           // Current authenticated user
  session: Session | null;     // Current session
  loading: boolean;            // Loading state
  initialized: boolean;        // Whether auth has been initialized
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}
```

## Authentication Flow

### Sign In Flow

1. User clicks "Continue with Google" button
2. `signInWithGoogle()` is called
3. Supabase redirects to Google OAuth consent screen
4. User authorizes the application
5. Google redirects back to your app with auth code
6. Supabase exchanges code for user session
7. Session is stored in browser (localStorage)
8. User profile is created in database (via trigger)
9. App re-renders with authenticated state

### Sign Out Flow

1. User clicks "Sign out" in profile dropdown
2. `signOut()` is called
3. Supabase clears the session
4. Local storage is cleared
5. Auth state is reset to null
6. App redirects to login screen

## Database Schema

### Profiles Table

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### Row Level Security (RLS)

- **View Policy**: Users can only view their own profile
- **Update Policy**: Users can only update their own profile
- Profiles are automatically created when users sign up

### Automatic Profile Creation

A database trigger automatically creates a profile when a new user signs up:

```sql
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Configuration

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Supabase Client

The Supabase client is initialized in `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
```

### Google OAuth Configuration

In Supabase Dashboard:

1. **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Add Google Client ID and Client Secret
4. Configure redirect URLs

## Usage Examples

### Check Authentication Status

```typescript
import { useAuthStore } from './stores/auth.store';

function MyComponent() {
  const { user, session, loading } = useAuthStore();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

  return <div>Welcome, {user.email}!</div>;
}
```

### Sign In

```typescript
import { useAuthStore } from './stores/auth.store';

function SignInButton() {
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);

  return (
    <button onClick={signInWithGoogle}>
      Sign in with Google
    </button>
  );
}
```

### Sign Out

```typescript
import { useAuthStore } from './stores/auth.store';

function SignOutButton() {
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <button onClick={signOut}>
      Sign out
    </button>
  );
}
```

### Access User Data

```typescript
import { useAuthStore } from './stores/auth.store';

function UserInfo() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Name: {user.user_metadata?.full_name}</p>
      <img src={user.user_metadata?.avatar_url} alt="Avatar" />
    </div>
  );
}
```

## Security Considerations

### Client-Side Security

- The `anon` key is safe to use in client-side code
- Row Level Security (RLS) protects data at the database level
- Users can only access their own data
- All sensitive operations are validated server-side

### Session Management

- Sessions are stored in browser localStorage
- Sessions automatically refresh before expiration
- Sessions are cleared on sign-out
- Sessions are validated on every request

### Data Privacy

- Video processing happens entirely client-side
- No video data is sent to servers
- Only user profile information is stored in database
- User can delete their account and all data

## Troubleshooting

### "Missing Supabase environment variables"

- Ensure `.env` file exists
- Check that variables are correctly set
- Restart dev server after changing `.env`

### Google Sign-In Popup Blocked

- Check browser popup blocker settings
- Ensure redirect URLs are correctly configured
- Try in incognito mode to rule out extensions

### Session Not Persisting

- Check browser localStorage is enabled
- Ensure cookies are allowed
- Check for browser extensions blocking storage

### "Invalid redirect URL"

- Verify redirect URLs in Supabase dashboard
- Ensure Site URL matches your domain
- Check for typos in URLs

## Future Enhancements

Potential authentication improvements:

- [ ] Add email/password authentication
- [ ] Add GitHub OAuth provider
- [ ] Implement email verification
- [ ] Add password reset flow
- [ ] Add account deletion
- [ ] Add profile editing
- [ ] Add session management (view all sessions)
- [ ] Add two-factor authentication

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signinwithoauth)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
