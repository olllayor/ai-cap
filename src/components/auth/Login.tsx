import { useState } from 'react';
import { useAuthStore, type AuthProvider } from '../../stores/auth.store';

const providers: Array<{ key: AuthProvider; label: string; icon: JSX.Element }> = [
  {
    key: 'google',
    label: 'Continue with Google',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    ),
  },
  {
    key: 'github',
    label: 'Continue with GitHub',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.14 3 .4 2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    key: 'apple',
    label: 'Continue with Apple',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16.4 13.4c.02 2.6 2.3 3.47 2.33 3.48-.02.06-.36 1.23-1.19 2.44-.72 1.05-1.47 2.1-2.64 2.12-1.14.02-1.5-.67-2.8-.67-1.3 0-1.7.65-2.77.69-1.13.04-2-.99-2.73-2.03-1.49-2.15-2.63-6.08-1.1-8.74.76-1.32 2.12-2.16 3.6-2.18 1.12-.02 2.18.74 2.87.74.7 0 2.02-.92 3.4-.78.58.02 2.23.23 3.28 1.74-.08.05-1.96 1.14-1.94 3.39z" />
        <path d="M13.8 3.2c.6-.74 1-1.78.89-2.8-.86.03-1.9.57-2.52 1.31-.55.64-1.03 1.67-.9 2.65.95.07 1.93-.48 2.53-1.16z" />
      </svg>
    ),
  },
];

export function Login() {
  const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const signInWithProvider = useAuthStore((state) => state.signInWithProvider);

  const handleProviderSignIn = async (provider: AuthProvider) => {
    try {
      setLoadingProvider(provider);
      setError(null);
      await signInWithProvider(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">AI-Cap</h1>
            <p className="text-gray-300">
              Generate captions for your videos using AI
            </p>
          </div>

          {/* Sign In Section */}
          <div className="space-y-4">
            {providers.map((provider) => {
              const isLoading = loadingProvider === provider.key;

              return (
                <button
                  key={provider.key}
                  onClick={() => handleProviderSignIn(provider.key)}
                  disabled={Boolean(loadingProvider)}
                  className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 rounded-lg px-6 py-3 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    provider.icon
                  )}
                  <span>{isLoading ? 'Signing in...' : provider.label}</span>
                </button>
              );
            })}

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-gray-400 text-xs text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
