'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Chrome } from 'lucide-react';

import Image from 'next/image';

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle, isDemo } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState(isDemo ? 'admin@csr360.org' : '');
  const [password, setPassword] = useState(isDemo ? 'demo1234' : '');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFirebaseErrorMessage = (err: unknown): string => {
    if (!(err instanceof Error)) return 'An unexpected error occurred.';
    const msg = err.message;
    if (msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) {
      return 'Invalid email or password. Please try again.';
    }
    if (msg.includes('auth/email-already-in-use')) {
      return 'This email is already registered. Try signing in instead.';
    }
    if (msg.includes('auth/weak-password')) {
      return 'Password must be at least 6 characters long.';
    }
    if (msg.includes('auth/invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (msg.includes('auth/too-many-requests')) {
      return 'Too many attempts. Please try again later.';
    }
    if (msg.includes('auth/popup-closed-by-user')) {
      return 'Sign-in popup was closed. Please try again.';
    }
    if (msg.includes('auth/network-request-failed')) {
      return 'Network error. Please check your connection.';
    }
    return 'Authentication failed. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, displayName || undefined);
      } else {
        await signIn(email || 'admin@csr360.org', password || 'demo1234');
      }
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn('admin@csr360.org', 'demo1234');
    } catch {
      setError('Failed to sign in to demo account.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setError(null);
    if (!isDemo) {
      setEmail('');
      setPassword('');
      setDisplayName('');
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Brand Header with Logo */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center relative w-16 h-16 mb-3">
          <Image
            src="/logo.png"
            alt="CSR Flow Logo"
            width={64}
            height={64}
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">CSR Flow</h1>
        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest mt-1">
          Plan • Track • Impact
        </p>
      </div>

      {/* Login / Sign Up Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-base font-semibold text-slate-900">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isSignUp
              ? 'Register to start managing CSR projects.'
              : 'Enter your credentials to access the CSR Flow enterprise platform.'}
          </p>
        </div>

        {isDemo && !isSignUp && (
          <div className="mx-6 mt-4 p-3 bg-brand-50 border border-brand-200 rounded-md text-xs text-brand-800 flex items-center justify-between gap-2">
            <span><strong>Demo Mode:</strong> Pre-filled credentials active.</span>
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={loading}
              className="text-xs font-semibold text-brand-700 underline hover:text-brand-900 shrink-0"
            >
              Go to Dashboard &rarr;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card-body space-y-4">
          {/* Display Name (Sign Up only) */}
          {isSignUp && (
            <div>
              <label htmlFor="displayName" className="form-label">
                Full Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="displayName"
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="form-input pl-9"
                  placeholder="Aman Verma"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input pl-9"
                placeholder="you@organization.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pl-9 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {isSignUp && (
              <p className="text-[11px] text-slate-400 mt-1">Must be at least 6 characters.</p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700"
            >
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading || googleLoading}
            className="btn-primary w-full justify-center mt-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading
              ? isSignUp ? 'Creating account…' : 'Signing in…'
              : isSignUp ? 'Create Account' : 'Sign in to Dashboard'}
          </button>

          {/* Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            id="google-signin"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="btn-secondary w-full justify-center"
          >
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" className="shrink-0">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
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
            )}
            <span>{googleLoading ? 'Connecting…' : 'Sign in with Google'}</span>
          </button>

          {/* Toggle Sign In / Sign Up */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-semibold text-brand-600 hover:text-brand-800 underline-offset-2 hover:underline"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        CSR Flow &copy; {new Date().getFullYear()} &mdash; Plan • Track • Impact
      </p>
    </div>
  );
}
