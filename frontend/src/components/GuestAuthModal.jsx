import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Phone, Award, ArrowRight } from 'lucide-react';

export default function GuestAuthModal({ isOpen, onClose, initialMode = 'login' }) {
  // activeTab: 0 = Sign In, 1 = Register
  const [activeTab, setActiveTab] = useState(initialMode === 'register' ? 1 : 0);
  const [isClosing, setIsClosing] = useState(false);
  const { loginGuest, registerGuest } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    setActiveTab(initialMode === 'register' ? 1 : 0);
    setError('');
    setIsClosing(false);
  }, [initialMode, isOpen]);

  const handleAnimatedClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 260);
  };

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = loginGuest(loginEmail, loginPassword);
    if (res.success) {
      handleAnimatedClose();
    } else {
      setError(res.error);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!regFirstName || !regLastName || !regEmail || !regPhone || !regPassword) {
      setError('Please complete all fields to join.');
      return;
    }
    const res = registerGuest({
      firstName: regFirstName,
      lastName: regLastName,
      email: regEmail,
      phone: regPhone,
      password: regPassword
    });
    if (res.success) {
      handleAnimatedClose();
    } else {
      setError(res.error);
    }
  };

  return (
    <div 
      onClick={handleAnimatedClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/70 ${
        isClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop'
      }`}
    >
      {/* 
        Fixed-Dimension Card:
        The outer shell NEVER resizes. It remains rock-solid in dimension,
        eliminating all jump cuts and awkward layout shifts.
      */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[460px] bg-sand-50 rounded-3xl border border-sand-300 shadow-2xl p-7 md:p-8 overflow-hidden ${
          isClosing ? 'animate-modal-card-out' : 'animate-modal-card'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleAnimatedClose}
          className="absolute top-5 right-5 p-2 rounded-full text-sand-600 hover:text-noir-950 hover:bg-sand-200 transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Tag & Segmented Sliding Pill Selector */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sand-300 bg-sand-100 text-sand-800 text-[10px] tracking-widest uppercase mb-3 font-semibold">
            <Award className="w-3 h-3 text-accent-gold" /> Maison Velour Club
          </div>

          {/* Segmented Pill Tabs with Animated Indicator */}
          <div className="relative flex p-1 bg-sand-200/80 rounded-full border border-sand-300 max-w-[260px] mx-auto text-xs font-semibold">
            {/* Sliding Pill Indicator */}
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-noir-900 rounded-full transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm"
              style={{
                transform: `translateX(${activeTab === 0 ? '0%' : '100%'})`
              }}
            />
            <button
              type="button"
              onClick={() => { setActiveTab(0); setError(''); }}
              className={`relative z-10 w-1/2 py-1.5 rounded-full transition-colors ${
                activeTab === 0 ? 'text-sand-50' : 'text-sand-700 hover:text-noir-950'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab(1); setError(''); }}
              className={`relative z-10 w-1/2 py-1.5 rounded-full transition-colors ${
                activeTab === 1 ? 'text-sand-50' : 'text-sand-700 hover:text-noir-950'
              }`}
            >
              Join Club
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 text-center animate-fade-in">
            {error}
          </div>
        )}

        {/* 
          Horizontal Sliding Carousel:
          Width is 200% with two 50% panels.
          Glides left/right seamlessly without altering the modal container.
        */}
        <div className="overflow-hidden">
          <div
            className="flex w-[200%] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              transform: `translateX(${activeTab === 0 ? '0%' : '-50%'})`
            }}
          >
            {/* Panel 1: Sign In */}
            <div className="w-1/2 pr-3 flex flex-col justify-between">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-serif text-noir-950 font-medium">Welcome Back</h3>
                <p className="text-xs text-sand-600 mt-1">Access your member rates, folio, and reservations.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-noir-850 font-semibold mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-sand-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="guest@luxurytravel.com"
                      className="w-full pl-8 pr-3 py-2 bg-white border border-sand-300 rounded-lg text-xs text-noir-900 placeholder-sand-400 focus:outline-none focus:border-noir-900 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-noir-850 font-semibold mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-sand-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-8 pr-3 py-2 bg-white border border-sand-300 rounded-lg text-xs text-noir-900 placeholder-sand-400 focus:outline-none focus:border-noir-900 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-3 py-3 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 group"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="mt-5 text-center text-xs text-sand-600">
                New to Maison Velour?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab(1); setError(''); }}
                  className="text-noir-900 font-semibold underline underline-offset-2 hover:text-accent-gold transition-colors"
                >
                  Create an account
                </button>
              </div>
            </div>

            {/* Panel 2: Register */}
            <div className="w-1/2 pl-3 flex flex-col justify-between">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-serif text-noir-950 font-medium">Join the Circle</h3>
                <p className="text-xs text-sand-600 mt-1">Receive 100 loyalty points &amp; privileged retreat rates.</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-noir-850 font-semibold mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required={activeTab === 1}
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="Elena"
                      className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs text-noir-900 placeholder-sand-400 focus:outline-none focus:border-noir-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-noir-850 font-semibold mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required={activeTab === 1}
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="Vance"
                      className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs text-noir-900 placeholder-sand-400 focus:outline-none focus:border-noir-900 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-noir-850 font-semibold mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required={activeTab === 1}
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="elena@mail.com"
                      className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs text-noir-900 placeholder-sand-400 focus:outline-none focus:border-noir-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-noir-850 font-semibold mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required={activeTab === 1}
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+1 (555) 000"
                      className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs text-noir-900 placeholder-sand-400 focus:outline-none focus:border-noir-900 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-noir-850 font-semibold mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required={activeTab === 1}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs text-noir-900 placeholder-sand-400 focus:outline-none focus:border-noir-900 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 group"
                >
                  <span>Complete Membership</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="mt-5 text-center text-xs text-sand-600">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab(0); setError(''); }}
                  className="text-noir-900 font-semibold underline underline-offset-2 hover:text-accent-gold transition-colors"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
