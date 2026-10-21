import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { ShieldCheck, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export const AdminLoginView: React.FC = () => {
  const { adminLogin } = useAdmin();
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = adminLogin(accessKey);
    if (!success) {
      setError('Invalid Administrator Security Key. Access denied.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)]">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glowing top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600" />

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center mx-auto mb-4 text-purple-400 shadow-xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">ConnectX Admin Console</h1>
          <p className="text-xs text-slate-400 mt-1">
            Secure administrative control & telemetry portal
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Admin Access Key / Token
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Enter admin credential"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Test credential: <strong className="text-purple-400 font-mono">ConnectX-Admin-2026</strong> or <strong className="text-purple-400 font-mono">admin123</strong>
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-transform active:scale-98"
          >
            <span>Authenticate Secure Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
          <span>Protected by Attribute-Based Access Control (ABAC)</span>
        </div>
      </div>
    </div>
  );
};
