import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Sparkles, Mail, Phone, Lock, User, AtSign, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

type AuthMode = 'welcome' | 'login' | 'register' | 'phone_otp' | 'forgot_password';

export const AuthView: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, sendPhoneOtp, verifyPhoneOtp, isLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>('welcome');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');

  // Phone form fields
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [mockOtpHint, setMockOtpHint] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleGoogleLogin = async () => {
    setError(null);
    const res = await loginWithGoogle();
    if (!res.success) {
      setError(res.error || 'Google login failed');
    } else {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await loginWithEmail(email, password);
    if (!res.success) {
      setError(res.error || 'Failed to sign in');
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await registerWithEmail(displayName, username, email, password);
    if (!res.success) {
      setError(res.error || 'Registration failed');
    } else {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fullNumber = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
    const res = await sendPhoneOtp(fullNumber);
    if (!res.success) {
      setError(res.error || 'Failed to send verification code');
    } else {
      setOtpSent(true);
      setMockOtpHint(res.mockOtp || '742918');
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fullNumber = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
    const res = await verifyPhoneOtp(fullNumber, otpCode, displayName, username);
    if (!res.success) {
      setError(res.error || 'Verification failed');
    } else {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-slate-100">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mt-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-600/30 mb-4 ring-2 ring-purple-500/30">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">ConnectX Messenger</h1>
        <p className="text-xs text-purple-300 font-medium tracking-wide mt-1 uppercase">
          Connect Everyone, Everywhere.
        </p>
      </div>

      {/* Error / Success Banners */}
      {error && (
        <div className="my-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="my-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Screen Views based on Mode */}
      <div className="my-auto py-4">
        {mode === 'welcome' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-slate-200">Welcome to Next-Gen Messaging</h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time conversations, WebRTC audio/video calls, and your collision-resistant Public ID.
              </p>
            </div>

            {/* 1. Continue with Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white text-slate-900 font-medium text-sm flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-md active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* 2. Email & Password */}
            <button
              onClick={() => {
                setError(null);
                setMode('login');
              }}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800/90 text-white font-medium text-sm flex items-center justify-center gap-3 border border-slate-700 hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              <Mail className="w-5 h-5 text-purple-400" />
              <span>Continue with Email</span>
            </button>

            {/* 3. Phone Number & OTP */}
            <button
              onClick={() => {
                setError(null);
                setMode('phone_otp');
              }}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800/90 text-white font-medium text-sm flex items-center justify-center gap-3 border border-slate-700 hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              <Phone className="w-5 h-5 text-blue-400" />
              <span>Continue with Phone Number</span>
            </button>

            <div className="pt-4 text-center">
              <span className="text-xs text-slate-400">Don't have an account? </span>
              <button
                onClick={() => {
                  setError(null);
                  setMode('register');
                }}
                className="text-xs font-semibold text-purple-400 hover:underline"
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* Email Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">Sign In with Email</h2>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-400">Password</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot_password')}
                  className="text-[11px] text-purple-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98]"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setMode('welcome')}
                className="text-slate-400 hover:text-white"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-purple-400 hover:underline font-semibold"
              >
                New here? Register
              </button>
            </div>
          </form>
        )}

        {/* Email Registration Form (with display name, unique username, and Public ID preview) */}
        {mode === 'register' && (
          <form onSubmit={handleEmailRegister} className="space-y-3.5">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Create Account</h2>
              <p className="text-xs text-slate-400">Set up your 3 core identities</p>
            </div>

            {/* Identity A: Display Name */}
            <div>
              <label className="text-xs text-slate-300 block mb-1">
                Display Name <span className="text-slate-500">(Shown to others)</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Mohammad Naim"
                  required
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Identity B: Unique Username */}
            <div>
              <label className="text-xs text-slate-300 block mb-1">
                Username <span className="text-slate-500">(Unique handle: letters, numbers, _)</span>
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="e.g., naim_gamer"
                  required
                  maxLength={20}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>

            {/* Identity C: Automatic Public ID Explanation */}
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-200 flex items-center justify-between">
              <div>
                <span className="font-semibold block text-purple-300">Automatic Public ID</span>
                <span className="text-purple-400">Unique code e.g. CX-7K4M9P2Q</span>
              </div>
              <span className="text-[10px] bg-purple-900/60 px-2 py-1 rounded text-purple-300 font-mono">
                Auto Generated
              </span>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98]"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setMode('welcome')}
                className="text-slate-400 hover:text-white"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-purple-400 hover:underline font-semibold"
              >
                Already have account? Sign In
              </button>
            </div>
          </form>
        )}

        {/* Phone OTP Verification Form */}
        {mode === 'phone_otp' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Phone Authentication</h2>
              <p className="text-xs text-slate-400">
                {!otpSent
                  ? 'Enter your phone number to receive a 6-digit SMS verification code'
                  : `Enter the 6-digit code sent to ${countryCode} ${phoneNumber}`}
              </p>
            </div>

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Phone Number</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-24 px-2 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+880">+880 (BD)</option>
                      <option value="+91">+91 (IN)</option>
                      <option value="+49">+49 (DE)</option>
                      <option value="+81">+81 (JP)</option>
                    </select>

                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="555 019 2834"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98]"
                >
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {mockOtpHint && (
                  <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200">
                    <span className="font-semibold block text-blue-300">SMS Verification Code:</span>
                    <span>Use test OTP: <strong className="font-mono text-white text-sm tracking-wider">{mockOtpHint}</strong></span>
                  </div>
                )}

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Enter 6-digit Code</label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="742918"
                    maxLength={6}
                    required
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-center text-xl font-mono tracking-widest text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="hover:text-white"
                  >
                    Change phone number
                  </button>
                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={handleSendOtp}
                    className="text-purple-400 hover:underline disabled:text-slate-600"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify & Continue</span>}
                </button>
              </form>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setMode('welcome')}
                className="text-xs text-slate-400 hover:text-white"
              >
                ← Back to welcome screen
              </button>
            </div>
          </div>
        )}

        {/* Password Reset */}
        {mode === 'forgot_password' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">Reset Password</h2>
            <p className="text-xs text-slate-400">
              Enter your registered email address to receive password reset instructions.
            </p>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setSuccessMsg(`Password reset instructions sent to ${email || 'your email'}`);
                setMode('login');
              }}
              className="w-full py-3 rounded-xl bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 transition-colors"
            >
              Send Reset Link
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-xs text-slate-400 hover:text-white block mx-auto"
            >
              ← Back to Sign In
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center text-[11px] text-slate-500 pt-4 border-t border-slate-900">
        <span>End-to-end cloud persistence · Built with Jetpack Compose & Firebase</span>
      </div>
    </div>
  );
};
