import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_BRANCHES, INITIAL_ROOMS } from '../data/mockData';
import { 
  Calendar, 
  Users, 
  ChevronDown, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  LogOut,
  SlidersHorizontal,
  Compass,
  Check
} from 'lucide-react';

export default function GuestLandingView({ onOpenAuth, onNavigateStaffPortal }) {
  const { currentGuest, logoutGuest } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState(INITIAL_BRANCHES[0]);
  const [checkIn, setCheckIn] = useState('2026-11-10');
  const [checkOut, setCheckOut] = useState('2026-11-14');
  const [guestCount, setGuestCount] = useState('2 Guests • 1 Room');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
    if (!currentGuest) {
      onOpenAuth('register');
    } else {
      setIsBookModalOpen(true);
    }
  };

  const handleConfirmReservation = () => {
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setIsBookModalOpen(false);
      setSelectedRoom(null);
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-sand-100 text-noir-900 selection:bg-noir-900 selection:text-sand-50">
      {/* 1. Luxury Editorial Navbar */}
      <header className="sticky top-0 z-40 bg-sand-100/90 backdrop-blur-md border-b border-sand-300/80 px-6 md:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <span className="text-[10px] tracking-[0.3em] uppercase text-sand-600 block">Hotel &bull; Private Retreat</span>
              <span className="text-2xl font-serif tracking-wider font-semibold text-noir-950 uppercase">
                Maison Velour
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest text-sand-800">
              <a href="#destinations" className="hover:text-noir-950 transition-colors">The Hotel</a>
              <a href="#rooms" className="hover:text-noir-950 transition-colors">Rooms &amp; Suites</a>
              <a href="#experiences" className="hover:text-noir-950 transition-colors">Experiences</a>
              <a href="#wellness" className="hover:text-noir-950 transition-colors">Spa &amp; Wellness</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {currentGuest ? (
              <div className="flex items-center gap-3 bg-sand-50 border border-sand-300 px-3 py-1.5 rounded-full shadow-sm">
                <img
                  src={currentGuest.Avatar}
                  alt={currentGuest.First_Name}
                  className="w-7 h-7 rounded-full object-cover border border-sand-400"
                />
                <div className="text-left text-xs pr-1">
                  <div className="font-semibold text-noir-900 leading-tight">
                    {currentGuest.First_Name} {currentGuest.Last_Name}
                  </div>
                  <div className="text-[10px] text-accent-bronze font-medium flex items-center gap-1">
                    <Award className="w-3 h-3 text-accent-gold" /> {currentGuest.Loyalty_Tier} ({currentGuest.Loyalty_Points} pts)
                  </div>
                </div>
                <button
                  onClick={logoutGuest}
                  title="Sign Out"
                  className="p-1 text-sand-500 hover:text-red-700 transition-colors rounded-full"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="text-xs uppercase tracking-wider font-semibold text-noir-900 hover:text-accent-gold transition-colors px-2 py-1"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-full text-xs uppercase tracking-wider font-semibold transition-all shadow-sm active:scale-95"
                >
                  Join Maison Club
                </button>
              </div>
            )}

            <button
              onClick={() => {
                const el = document.getElementById('booking-bar');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden lg:block px-5 py-2 border border-noir-900 hover:bg-noir-900 hover:text-sand-50 rounded-full text-xs uppercase tracking-wider font-semibold transition-all"
            >
              Book Your Stay
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section Matching User Reference Screenshot */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-6 md:px-12 py-12 bg-noir-950 overflow-hidden">
        {/* Full Bleed Architecture Photograph */}
        <img
          src={selectedBranch.Image}
          alt={selectedBranch.Location_Name}
          className="absolute inset-0 w-full h-full object-cover opacity-65 scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noir-950/90 via-noir-950/40 to-noir-950/30" />

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-8">
          {/* Hero Typographic Manifesto */}
          <div className="lg:col-span-7 space-y-6 text-sand-50">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-sand-300">
              <span className="w-8 h-[1px] bg-sand-300" />
              <span>{selectedBranch.Location_Name}</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl xl:text-8xl font-serif font-normal leading-[1.05] tracking-tight">
              The world <br />
              <span className="italic font-light">can wait.</span>
            </h1>

            <p className="text-sm sm:text-base text-sand-200/90 max-w-md font-light leading-relaxed">
              A place to step away. And feel entirely yourself amidst private coastal terraces and secluded luxury.
            </p>

            <div className="pt-2">
              <a
                href="#destinations"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-sand-200 hover:text-white border-b border-sand-400 pb-1 transition-colors"
              >
                Discover the Maison &darr;
              </a>
            </div>
          </div>

          {/* Right Floating Reservation Widget (From Screenshot) */}
          <div id="booking-bar" className="lg:col-span-5 bg-sand-50/95 backdrop-blur-md rounded-2xl border border-sand-300 shadow-2xl p-6 sm:p-7 text-noir-900">
            <div className="flex items-center justify-between pb-4 border-b border-sand-300">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-sand-600 font-semibold block">Make time for you</span>
                <h3 className="text-2xl font-serif font-medium text-noir-950 mt-0.5">A stay to remember.</h3>
              </div>
              <div className="w-8 h-8 rounded-full border border-sand-400 flex items-center justify-center font-serif text-sm">
                M
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {/* Destination Selector */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-sand-700 font-semibold mb-1">
                  Destination Estate
                </label>
                <select
                  value={selectedBranch.Branch_ID}
                  onChange={(e) => {
                    const found = INITIAL_BRANCHES.find(b => b.Branch_ID === e.target.value);
                    if (found) setSelectedBranch(found);
                  }}
                  className="w-full bg-white border border-sand-300 rounded-lg px-3 py-2 text-xs font-medium text-noir-900 focus:outline-none focus:border-noir-900"
                >
                  {INITIAL_BRANCHES.map(b => (
                    <option key={b.Branch_ID} value={b.Branch_ID}>
                      {b.Location_Name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-sand-300 rounded-lg">
                  <span className="text-[10px] uppercase tracking-wider text-sand-600 block">Check In</span>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full text-xs font-semibold text-noir-900 bg-transparent focus:outline-none mt-1"
                  />
                </div>
                <div className="p-3 bg-white border border-sand-300 rounded-lg">
                  <span className="text-[10px] uppercase tracking-wider text-sand-600 block">Check Out</span>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full text-xs font-semibold text-noir-900 bg-transparent focus:outline-none mt-1"
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="p-3 bg-white border border-sand-300 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-sand-600 block">Your Company</span>
                  <span className="text-xs font-semibold text-noir-900">{guestCount}</span>
                </div>
                <Users className="w-4 h-4 text-sand-600" />
              </div>

              {/* Find Room CTA Button */}
              <button
                onClick={() => {
                  const el = document.getElementById('rooms');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-3 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-lg text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <span>Find Your Room</span>
                <span className="text-[10px] opacity-75 font-normal">&bull; 4 Nights</span>
              </button>

              <div className="text-center text-[10px] text-sand-600 pt-1">
                Complimentary breakfast &amp; resort spa access included.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Rooms & Suites Catalog (Matching Screenshot 3 & 4) */}
      <section id="rooms" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-6 border-b border-sand-300">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-sand-600 block mb-1">
              Curated Accommodations
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-noir-950 font-normal">
              Beautiful spaces. Better days.
            </h2>
          </div>
          <p className="text-xs md:text-sm text-sand-700 max-w-sm">
            A quiet room, a private terrace. A little more space. Choose the retreat you will call your own.
          </p>
        </div>

        <div className="space-y-6">
          {INITIAL_ROOMS.map((room) => (
            <div
              key={room.Room_ID}
              className="bg-sand-50 border border-sand-300/80 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 grid grid-cols-1 md:grid-cols-12 gap-0 group"
            >
              <div className="md:col-span-5 relative h-64 md:h-auto overflow-hidden bg-sand-200">
                <img
                  src={room.Image}
                  alt={room.TypeName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <span className="absolute top-4 left-4 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded bg-sand-50/90 backdrop-blur-md text-noir-900">
                  Suite {room.Room_Number}
                </span>
              </div>

              <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-2xl font-serif text-noir-950 font-medium">
                        {room.TypeName}
                      </h3>
                      <p className="text-xs text-sand-600 mt-1">{room.Specs}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-serif font-semibold text-noir-950">
                        &euro;{room.Rate}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-sand-600">Per Night</div>
                    </div>
                  </div>

                  <p className="text-xs text-sand-700 mt-3 leading-relaxed">
                    Designed around natural light and travertine textures. Features king pillowtop bedding, high-speed Wi-Fi, Nespresso bar, and panoramic French windows.
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-sand-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs text-sand-700">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent-gold" /> Breakfast Included
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Free Cancellation
                    </span>
                  </div>

                  <button
                    onClick={() => handleBookRoom(room)}
                    className="px-6 py-2.5 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all shadow-sm active:scale-95"
                  >
                    Select Room &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Booking Preview Confirmation Modal */}
      {isBookModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-sand-50 rounded-3xl border border-sand-300 shadow-2xl p-8 relative">
            <h3 className="text-2xl font-serif text-noir-950 font-medium mb-1">
              Your stay, at a glance.
            </h3>
            <p className="text-xs text-sand-600 mb-6">
              Review details for {selectedBranch.Location_Name}.
            </p>

            <div className="rounded-xl overflow-hidden border border-sand-300 mb-6">
              <img src={selectedRoom.Image} alt={selectedRoom.TypeName} className="w-full h-48 object-cover" />
              <div className="p-4 bg-sand-100 flex items-center justify-between">
                <div>
                  <div className="font-serif text-lg font-medium text-noir-950">{selectedRoom.TypeName}</div>
                  <div className="text-xs text-sand-600">{selectedRoom.Specs}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-serif font-semibold text-noir-950">&euro;{selectedRoom.Rate * 4}</div>
                  <div className="text-[10px] text-sand-600">4 Nights Total</div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs border-y border-sand-200 py-3 mb-6">
              <div className="flex justify-between text-sand-700">
                <span>Guest Name</span>
                <span className="font-semibold text-noir-900">{currentGuest?.First_Name} {currentGuest?.Last_Name}</span>
              </div>
              <div className="flex justify-between text-sand-700">
                <span>Dates</span>
                <span className="font-semibold text-noir-900">{checkIn} &rarr; {checkOut}</span>
              </div>
              <div className="flex justify-between text-sand-700">
                <span>Loyalty Reward</span>
                <span className="font-semibold text-accent-bronze">+120 Points Earned</span>
              </div>
            </div>

            {bookingSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs text-center font-medium flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Reservation Confirmed! We look forward to welcoming you.
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsBookModalOpen(false)}
                  className="flex-1 py-2.5 border border-sand-300 text-noir-900 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-sand-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReservation}
                  className="flex-1 py-2.5 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-md"
                >
                  Confirm Reservation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Editorial Footer with Discreet Staff Operations Link */}
      <footer className="bg-sand-200 border-t border-sand-300 py-12 px-6 md:px-12 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-sand-700">
          <div>
            <span className="font-serif text-lg text-noir-950 font-medium block">MAISON VELOUR</span>
            <span>&copy; {new Date().getFullYear()} Maison Velour Hospitality Group. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-noir-950 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-noir-950 transition-colors">Terms of Service</a>
            {/* Discreet Link to Internal Hotel Management Portal */}
            <button
              onClick={onNavigateStaffPortal}
              className="text-sand-600 hover:text-noir-950 underline underline-offset-4 decoration-sand-400 text-xs font-medium transition-colors"
            >
              Staff Portal &rarr;
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
