import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_STAFF } from '../data/mockData';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginView() {
  const { login, switchUser } = useAuth();
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

  const handleDemoSelect = (staff) => {
    setEmail(staff.Email);
    setPassword('••••••••');
    switchUser(staff.Staff_ID);
  };

  return (
    <div className="min-h-screen bg-sand-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-sand-300/40 via-sand-200/20 to-transparent pointer-events-none rounded-b-full blur-2xl" />

      {/* Brand Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sand-400 bg-sand-50/80 text-sand-800 text-xs tracking-widest uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5 text-accent-gold" /> Staff Portal &amp; Management
        </div>
        <h1 className="text-4xl md:text-5xl font-serif tracking-wide text-noir-950 font-normal uppercase">
          Maison Velour
        </h1>
        <p className="text-xs uppercase tracking-[0.3em] text-sand-600 mt-1">
          Hotel &amp; Private Retreat &bull; DBMS Portal
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

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-noir-900 hover:bg-noir-950 text-sand-50 font-medium rounded-lg text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
          >
            Authenticate Staff <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="mt-8 pt-6 border-t border-sand-300">
          <p className="text-xs uppercase tracking-wider text-sand-600 font-semibold mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-gold" /> Quick Demo Role Switcher
          </p>
          <div className="grid grid-cols-1 gap-2">
            {INITIAL_STAFF.map((staff) => (
              <button
                key={staff.Staff_ID}
                type="button"
                onClick={() => handleDemoSelect(staff)}
                className="w-full text-left p-2.5 rounded-lg border border-sand-300/70 hover:border-noir-900 bg-sand-100/60 hover:bg-sand-200/70 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={staff.Avatar}
                    alt={staff.First_Name}
                    className="w-8 h-8 rounded-full object-cover border border-sand-400"
                  />
                  <div>
                    <div className="text-xs font-semibold text-noir-900">
                      {staff.First_Name} {staff.Last_Name}
                    </div>
                    <div className="text-[11px] text-sand-700">{staff.Role}</div>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-sand-600 group-hover:text-noir-900 transition-colors">
                  Instant Login &rarr;
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-sand-600 tracking-wider">
        Maison Velour Property Management System &bull; Database Schema v1.0
      </p>
    </div>
  );
}
