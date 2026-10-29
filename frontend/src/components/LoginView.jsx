import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(email, password);
    if (!result.success) {
      setError(result.error);
    } else {
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-noir-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Hero Photography with Dark Overlay */}
      <img
        src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000"
        alt="Maison Velour Estate"
        className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-[1px] scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/80 to-noir-950/60" />

      {/* Brand Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sand-400/40 bg-sand-50/10 backdrop-blur-md text-sand-200 text-xs tracking-widest uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5 text-accent-gold" /> Staff &amp; Operations
        </div>
        <h1 className="text-4xl md:text-5xl font-serif tracking-wide text-white font-normal uppercase">
          Maison Velour
        </h1>
        <p className="text-xs uppercase tracking-[0.3em] text-sand-300 mt-1">
          Hotel &amp; Private Retreat
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-sand-50 border border-sand-300/80 shadow-2xl rounded-2xl p-8 relative z-10 backdrop-blur-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-serif text-noir-900 font-medium">Internal Sign In</h2>
          <p className="text-sm text-sand-700 mt-1">
            Access reservations, room states, operations, and billing.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-noir-850 font-medium mb-1.5">
              Staff Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-sand-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@maisonvelour.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-sand-300 rounded-lg text-sm text-noir-900 placeholder-sand-500 focus:outline-none focus:border-noir-900 focus:ring-1 focus:ring-noir-900 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-noir-850 font-medium mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-sand-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-sand-300 rounded-lg text-sm text-noir-900 placeholder-sand-500 focus:outline-none focus:border-noir-900 focus:ring-1 focus:ring-noir-900 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-sand-600 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-sand-300 text-noir-900 focus:ring-noir-900" />
              <span>Remember this terminal</span>
            </label>
            <a href="#reset" onClick={(e) => { e.preventDefault(); alert('Please contact the IT Security Department for password reset.'); }} className="hover:text-noir-900 transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-noir-900 hover:bg-noir-950 text-sand-50 font-medium rounded-lg text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
          >
            Authenticate Staff <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <p className="mt-8 text-xs text-sand-300/80 tracking-wider">
        Maison Velour Property Management System &bull; Restricted Access
      </p>
    </div>
  );
}
