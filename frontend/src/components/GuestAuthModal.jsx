import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Phone, Award, ArrowRight } from 'lucide-react';

export default function GuestAuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const { loginGuest, registerGuest } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!firstName || !lastName || !email || !password || !phone) {
        setError('Please complete all fields to join the retreat club.');
        return;
      }
      const res = registerGuest({ firstName, lastName, email, phone, password });
      if (res.success) {
        onClose();
      } else {
        setError(res.error);
      }
    } else {
      const res = loginGuest(email, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.error);
      }
    }
  };

  const handleToggleMode = (registerState) => {
    setError('');
    setIsRegister(registerState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/70 animate-modal-backdrop">
      {/* 
        Fluid Container:
        Animates max-width and min-height with smooth cubic-bezier easing
        so switching from login (compact) to register (expanded) animates smoothly.
      */}
      <div 
        className={`relative w-full bg-sand-50 rounded-3xl border border-sand-300 shadow-2xl p-7 md:p-8 overflow-hidden animate-modal-card transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isRegister ? 'max-w-lg' : 'max-w-md'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-sand-600 hover:text-noir-950 hover:bg-sand-200 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header with smooth crossfade */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sand-300 bg-sand-100 text-sand-800 text-[10px] tracking-widest uppercase mb-2 font-semibold">
            <Award className="w-3 h-3 text-accent-gold" /> Maison Velour Club
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-noir-950 font-medium transition-all duration-300">
            {isRegister ? 'Join the Circle' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-sand-600 mt-1 min-h-[32px] transition-opacity duration-300">
            {isRegister 
              ? 'Receive 100 complimentary loyalty points & bespoke booking rates.'
              : 'Sign in to access your itinerary, reservations, and member benefits.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 transition-all duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Animated Name Fields Drawer */}
          <div 
            className={`grid grid-cols-2 gap-3 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isRegister 
                ? 'max-h-24 opacity-100 transform translate-y-0' 
                : 'max-h-0 opacity-0 transform -translate-y-2 pointer-events-none'
            }`}
          >
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-noir-850 font-semibold mb-1">
                First Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-sand-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required={isRegister}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Elena"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-sand-300 rounded-lg text-xs text-noir-900 placeholder-sand-400 focus:outline-none focus:border-noir-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-noir-850 font-semibold mb-1">
                Last Name
              </label>
              <input
                type="text"
                required={isRegister}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Vance"
                className="w-full px-3 py-2 bg-white border border-sand-300 rounded-lg text-xs text-noir-900 placeholder-sand-400 focus:outline-none focus:border-noir-900 transition-colors"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-noir-850 font-semibold mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-sand-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guest@luxurytravel.com"
                className="w-full pl-8 pr-3 py-2 bg-white border border-sand-300 rounded-lg text-xs text-noir-900 placeholder-sand-400 focus:outline-none focus:border-noir-900 transition-colors"
              />
            </div>
          </div>

          {/* Animated Phone Field Drawer */}
          <div 
            className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isRegister 
                ? 'max-h-24 opacity-100 transform translate-y-0' 
                : 'max-h-0 opacity-0 transform -translate-y-2 pointer-events-none'
            }`}
          >
            <label className="block text-[10px] uppercase tracking-wider text-noir-850 font-semibold mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-sand-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required={isRegister}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-8 pr-3 py-2 bg-white border border-sand-300 rounded-lg text-xs text-noir-900 placeholder-sand-400 focus:outline-none focus:border-noir-900 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-noir-850 font-semibold mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-sand-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-8 pr-3 py-2 bg-white border border-sand-300 rounded-lg text-xs text-noir-900 placeholder-sand-400 focus:outline-none focus:border-noir-900 transition-colors"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            className="w-full mt-4 py-3 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 group"
          >
            <span>{isRegister ? 'Create Member Profile' : 'Access Your Retreat'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-6 pt-4 border-t border-sand-200 text-center text-xs text-sand-600">
          {isRegister ? (
            <span>
              Already a registered member?{' '}
              <button
                type="button"
                onClick={() => handleToggleMode(false)}
                className="text-noir-900 font-semibold underline underline-offset-2 hover:text-accent-gold transition-colors"
              >
                Sign in
              </button>
            </span>
          ) : (
            <span>
              New to Maison Velour?{' '}
              <button
                type="button"
                onClick={() => handleToggleMode(true)}
                className="text-noir-900 font-semibold underline underline-offset-2 hover:text-accent-gold transition-colors"
              >
                Join the Club
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
