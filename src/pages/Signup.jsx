import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import Input from '../components/Input';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { signup, loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to home
  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  function getErrorMessage(errCode) {
    switch (errCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Try signing in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed before completing. Please try again.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in request was cancelled.';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
      case 'auth/operation-not-allowed':
        return 'Google Sign-In is not enabled yet in your Firebase Console. Please enable Google in Firebase Console > Authentication > Sign-in method.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized in Firebase Console for Google sign-in.';
      default:
        return 'Failed to create account. Please try again.';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await signup(email, password);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-[420px]">
        {/* Header / Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary-soft text-primary rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm">
            🌸
          </div>
          <h1 className="text-2xl font-semibold font-heading text-textMain">
            Create your account
          </h1>
          <p className="text-textMuted text-sm mt-1">
            Track your cycle and get personalized nutrition tips
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl shadow-sm border border-pink-100 p-6 sm:p-7">
          {error && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-danger text-xs font-medium flex items-start gap-2"
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="signup-email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <Input
              id="signup-password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              helperText="Must be at least 6 characters"
              required
              autoComplete="new-password"
            />

            <Input
              id="signup-confirm-password"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              autoComplete="new-password"
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={googleLoading}
              >
                Create Account
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-pink-100" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-surface px-3 text-textMuted font-medium">
                or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="w-full min-h-[44px] flex items-center justify-center gap-2.5 px-4 py-2.5 border border-pink-200 rounded-xl bg-white text-xs font-semibold text-textMain hover:bg-pink-50/50 hover:border-pink-300 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{googleLoading ? 'Signing up with Google...' : 'Continue with Google'}</span>
          </button>

          {/* Switch link */}
          <div className="mt-6 text-center pt-5 border-t border-pink-50 text-xs text-textMuted space-y-2">
            <div>
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </Link>
            </div>
            <div>
              <Link
                to="/privacy"
                className="text-[11px] text-textMuted hover:text-primary transition-colors underline"
              >
                Privacy Policy & Health Data Protection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

