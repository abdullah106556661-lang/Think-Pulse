import React, { useState } from 'react';
import { ThinkPulseLogo } from './ThinkPulseLogo';
import { ViewMode, User } from '../types';
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  Key,
  Check,
  ChevronLeft,
} from 'lucide-react';

interface AuthViewProps {
  initialMode?: 'login' | 'signup' | 'forgot';
  onSuccess: (user: User, token: string) => void;
  onNavigateLanding: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  onSuccess,
  onNavigateLanding,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset' | 'verify'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Recovery & verification state
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const safeJson = async (res: Response, fallbackError: string) => {
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (!res.ok) {
        throw new Error(data.error || fallbackError);
      }
      return data;
    } catch (parseErr: any) {
      if (!res.ok) {
        if (text.includes('A server error has occurred') || text.includes('Internal Server Error')) {
          throw new Error('The server is initializing. Please wait a moment and try again.');
        }
        throw new Error(`Server returned error code ${res.status}. Please try again.`);
      }
      throw new Error(parseErr.message || fallbackError);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'signup') {
      if (!name.trim()) return setError('Please enter your full name.');
      if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email address.');
      if (password.length < 6) return setError('Password must be at least 6 characters.');
      if (password !== confirmPassword) return setError('Passwords do not match.');
      if (!acceptTerms) return setError('You must accept the Terms of Service.');
    } else if (mode === 'login') {
      if (!email.trim() || !password) return setError('Please fill in both email and password.');
    } else if (mode === 'forgot') {
      if (!email.trim() || !email.includes('@')) return setError('Please enter your account email.');
    } else if (mode === 'reset') {
      if (!email.trim() || !resetCode.trim() || !newPassword) {
        return setError('Please provide your email, reset code, and new password.');
      }
      if (newPassword.length < 6) return setError('New password must be at least 6 characters.');
    } else if (mode === 'verify') {
      if (!email.trim() || !verifyCode.trim()) return setError('Please enter your email and verification code.');
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password, terms: acceptTerms }),
        });
        const data = await safeJson(res, 'Registration failed');

        localStorage.setItem('thinkpulse_token', data.token);
        localStorage.setItem('thinkpulse_auth_token', data.token);
        localStorage.setItem('thinkpulse_user', JSON.stringify(data.user));
        onSuccess(data.user, data.token);
      } else if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password, rememberMe }),
        });
        const data = await safeJson(res, 'Authentication failed');

        localStorage.setItem('thinkpulse_token', data.token);
        localStorage.setItem('thinkpulse_auth_token', data.token);
        localStorage.setItem('thinkpulse_user', JSON.stringify(data.user));
        onSuccess(data.user, data.token);
      } else if (mode === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        });
        const data = await safeJson(res, 'Failed to request reset');

        setSuccessMsg(data.message || 'Reset code sent! Check below to enter your code.');
        if (data.devResetCode) {
          setResetCode(data.devResetCode);
        }
        setMode('reset');
      } else if (mode === 'reset') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), code: resetCode.trim(), newPassword }),
        });
        await safeJson(res, 'Failed to reset password');

        setSuccessMsg('Password reset successfully! You can now sign in with your new password.');
        setMode('login');
      } else if (mode === 'verify') {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), code: verifyCode.trim() }),
        });
        await safeJson(res, 'Email verification failed');

        setSuccessMsg('Email verified successfully! You may now sign in.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          onClick={onNavigateLanding}
          className="inline-block hover:opacity-90 transition-opacity mb-4"
        >
          <ThinkPulseLogo size="lg" animated />
        </button>

        <h2 className="text-2xl font-extrabold text-white font-heading">
          {mode === 'login' && 'Sign in to ThinkPulse AI'}
          {mode === 'signup' && 'Create your ThinkPulse account'}
          {mode === 'forgot' && 'Reset your password'}
          {mode === 'reset' && 'Set a new password'}
          {mode === 'verify' && 'Verify your email address'}
        </h2>

        <p className="mt-1.5 text-xs text-slate-400">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="font-semibold text-cyan-400 hover:text-cyan-300"
              >
                Sign up free
              </button>
            </>
          ) : mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="font-semibold text-cyan-400 hover:text-cyan-300"
              >
                Sign in
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className="inline-flex items-center gap-1 font-medium text-cyan-400 hover:text-cyan-300"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to sign in</span>
            </button>
          )}
        </p>

        <div className="mt-2.5">
          <button
            type="button"
            onClick={onNavigateLanding}
            className="text-[11px] text-slate-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
          >
            <span>Explore Platform Showcase & Features</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/90 py-8 px-4 shadow-2xl shadow-cyan-950/40 sm:rounded-2xl sm:px-10 border border-slate-800">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* SIGNUP: Name */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Abdullah Khan"
                    required
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            )}

            {/* Email Field (for all modes) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* LOGIN / SIGNUP: Password */}
            {(mode === 'login' || mode === 'signup') && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            )}

            {/* SIGNUP: Confirm Password */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            )}

            {/* RESET: Reset Code & New Password */}
            {mode === 'reset' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    6-Digit Reset Code
                  </label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="e.g. 849201"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-amber-300 font-mono text-center tracking-widest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* VERIFY EMAIL: Code */}
            {mode === 'verify' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Verification Code
                </label>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="e.g. 109283"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-cyan-300 font-mono text-center tracking-widest"
                />
              </div>
            )}

            {/* Checkboxes */}
            {mode === 'login' && (
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                  />
                  <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer">
                    Remember my session (30 days)
                  </label>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="terms" className="text-xs text-slate-400">
                  I agree to the{' '}
                  <span className="text-slate-200 underline">Terms of Service</span> and{' '}
                  <span className="text-slate-200 underline">Privacy Policy</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In to Workspace'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Send Password Reset Code'}
                    {mode === 'reset' && 'Confirm & Reset Password'}
                    {mode === 'verify' && 'Verify Account'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure 256-bit Encrypted Server Sessions</span>
          </div>
        </div>
      </div>
    </div>
  );
};
