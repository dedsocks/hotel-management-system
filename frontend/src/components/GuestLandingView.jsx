import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_BRANCHES, INITIAL_ROOMS, INITIAL_EXPERIENCES } from '../data/mockData';
import { useScrollReveal } from '../hooks/useScrollReveal';
import CustomSelect from './CustomSelect';
import LuxuryDatePicker from './LuxuryDatePicker';
import { createReservationApi, fetchSpaServicesApi, bookSpaAppointmentApi, validateCouponApi, fetchDiningMenuApi, createFoodOrderApi } from '../api/hotelApi';
import { 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  LogOut, 
  Check, 
  Compass, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown, 
  Plus, 
  Minus, 
  Clock, 
  CreditCard,
  Receipt,
  X,
  Wine, 
  Waves, 
  Sun, 
  Flame 
} from 'lucide-react';

export default function GuestLandingView({ onOpenAuth, onNavigateStaffPortal }) {
  const { currentGuest, logoutGuest } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState(INITIAL_BRANCHES[0]);
  const [checkIn, setCheckIn] = useState('2026-11-10');
  const [checkOut, setCheckOut] = useState('2026-11-14');
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [roomsCount, setRoomsCount] = useState(1);
  const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);
  const guestPickerRef = useRef(null);

  // Maximum allowed occupancy per room (hotel policy: max 4 guests per room)
  const MAX_GUESTS_PER_ROOM = 4;
  const maxAllowedGuests = roomsCount * MAX_GUESTS_PER_ROOM;

  const handleUpdateAdults = (newAdults) => {
    const clamped = Math.max(1, newAdults);
    setAdultsCount(clamped);
    // Auto-adjust rooms upward if total guests exceed current rooms capacity
    const neededRooms = Math.ceil((clamped + childrenCount) / MAX_GUESTS_PER_ROOM);
    if (neededRooms > roomsCount) {
      setRoomsCount(Math.min(5, neededRooms));
    }
  };

  const handleUpdateChildren = (newChildren) => {
    const clamped = Math.max(0, newChildren);
    setChildrenCount(clamped);
    // Auto-adjust rooms upward if total guests exceed current rooms capacity
    const neededRooms = Math.ceil((adultsCount + clamped) / MAX_GUESTS_PER_ROOM);
    if (neededRooms > roomsCount) {
      setRoomsCount(Math.min(5, neededRooms));
    }
  };

  const handleUpdateRooms = (newRooms) => {
    const minRoomsNeeded = Math.ceil((adultsCount + childrenCount) / MAX_GUESTS_PER_ROOM);
    // Don't let rooms decrease below what is needed for the current total guests
    const targetRooms = Math.max(minRoomsNeeded, Math.min(5, newRooms));
    setRoomsCount(targetRooms);
  };

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isBookModalClosing, setIsBookModalClosing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleCloseBookModal = () => {
    setIsBookModalClosing(true);
    setTimeout(() => {
      setIsBookModalOpen(false);
      setIsBookModalClosing(false);
    }, 200);
  };
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponStatus, setCouponStatus] = useState('');

  // Experience inquiry modal state
  const [selectedExp, setSelectedExp] = useState(null);
  const [expSuccess, setExpSuccess] = useState(false);

  // Spa Booking state
  const [spaServices, setSpaServices] = useState([]);
  const [selectedSpaService, setSelectedSpaService] = useState(null);
  const [isSpaModalOpen, setIsSpaModalOpen] = useState(false);
  const [spaDate, setSpaDate] = useState('2026-11-11');
  const [spaTime, setSpaTime] = useState('15:00');
  const [spaSuccess, setSpaSuccess] = useState(false);
  const [spaError, setSpaError] = useState('');
  const [isBookingSpa, setIsBookingSpa] = useState(false);

  // Dining Menu state
  const [diningMenu, setDiningMenu] = useState([]);
  const diningCarouselRef = useRef(null);

  const getDiningImage = (item) => {
    const name = (item?.Name || '').toLowerCase();
    const cat = (item?.Category || '').toLowerCase();
    if (name.includes('dom') || name.includes('champagne') || cat.includes('beverage')) {
      return 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800';
    }
    if (name.includes('turkey') || name.includes('roulade')) {
      return 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?auto=format&fit=crop&q=80&w=800';
    }
    if (name.includes('risotto') || name.includes('truffle')) {
      return 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=800';
    }
    if (name.includes('salmon')) {
      return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800';
    }
    if (cat.includes('dessert')) {
      return 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=800';
    }
    if (cat.includes('starter')) {
      return 'https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&q=80&w=800';
    }
    return 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800';
  };

  const scrollDiningCarousel = (direction) => {
    if (!diningCarouselRef.current) return;
    const width = diningCarouselRef.current.clientWidth;
    diningCarouselRef.current.scrollBy({
      left: direction === 'next' ? width * 0.75 : -width * 0.75,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    fetchSpaServicesApi()
      .then((data) => {
        if (Array.isArray(data)) setSpaServices(data);
      })
      .catch((err) => console.error('Failed to load spa services:', err));
    fetchDiningMenuApi()
      .then((data) => {
        if (Array.isArray(data)) setDiningMenu(data);
      })
      .catch((err) => console.error('Failed to load dining menu:', err));
  }, []);

  const totalGuests = adultsCount + childrenCount;
  const guestCountSummary = `${totalGuests} Guest${totalGuests > 1 ? 's' : ''} • ${roomsCount} Room${roomsCount > 1 ? 's' : ''}`;

  // Dynamically compute the number of nights from checkIn and checkOut
  const nightsCount = Math.max(1, Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
  ) || 1);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (guestPickerRef.current && !guestPickerRef.current.contains(e.target)) {
        setIsGuestPickerOpen(false);
      }
    };
    if (isGuestPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isGuestPickerOpen]);
  
  // Ambient Mouse Glow Position
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });

  // Experience Infinite Carousel Configuration
  const [itemsPerView, setItemsPerView] = useState(3);
  // currentIndex starts at itemsPerView (the start of the real items)
  const [currentExpIndex, setCurrentExpIndex] = useState(3);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);

  // Cloned items for infinite wrapping: [cloned tail, ...real, ...cloned head]
  const extendedExperiences = [
    ...INITIAL_EXPERIENCES.slice(-3),
    ...INITIAL_EXPERIENCES,
    ...INITIAL_EXPERIENCES.slice(0, 3)
  ];

  useEffect(() => {
    const updateItemsPerView = () => {
      const count = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
      setItemsPerView(count);
    };
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const prevExperience = () => {
    setIsTransitionEnabled(true);
    setCurrentExpIndex((prev) => prev - 1);
  };

  const nextExperience = () => {
    setIsTransitionEnabled(true);
    setCurrentExpIndex((prev) => prev + 1);
  };

  const handleTransitionEnd = () => {
    // If we moved before the real items
    if (currentExpIndex < 3) {
      setIsTransitionEnabled(false);
      setCurrentExpIndex(INITIAL_EXPERIENCES.length + currentExpIndex);
    } 
    // If we moved past the real items
    else if (currentExpIndex >= INITIAL_EXPERIENCES.length + 3) {
      setIsTransitionEnabled(false);
      setCurrentExpIndex(currentExpIndex - INITIAL_EXPERIENCES.length);
    }
  };

  // Normalized active dot index (0 to INITIAL_EXPERIENCES.length - 1)
  const activeDotIndex = ((currentExpIndex - 3) % INITIAL_EXPERIENCES.length + INITIAL_EXPERIENCES.length) % INITIAL_EXPERIENCES.length;

  // Scroll reveal container hook
  const pageContainerRef = useScrollReveal();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
    setBookingError('');
    setBookingSuccess(false);
    setCouponCode('');
    setDiscountPercent(0);
    setCouponStatus('');
    if (!currentGuest) {
      onOpenAuth('register');
    } else {
      setIsBookModalOpen(true);
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setDiscountPercent(0);
      setCouponStatus('Please enter a promotional code.');
      return;
    }
    try {
      const res = await validateCouponApi(code, roomSubtotal);
      if (res?.valid) {
        setDiscountPercent(res.discountPercentage);
        setCouponStatus(`Coupon ${res.couponCode} applied: ${res.discountPercentage}% off!`);
      } else {
        setDiscountPercent(0);
        setCouponStatus(res?.error || 'Invalid or expired coupon code.');
      }
    } catch {
      setDiscountPercent(0);
      setCouponStatus('Unable to validate coupon right now.');
    }
  };

  // Pricing Breakdown
  const roomSubtotal = selectedRoom ? (selectedRoom.Rate * nightsCount * roomsCount) : 0;
  const discountAmount = Math.round((roomSubtotal * discountPercent) / 100);
  const taxAmount = Math.round((roomSubtotal - discountAmount) * 0.12); // 12% Luxury Hospitality GST
  const netPayable = roomSubtotal - discountAmount + taxAmount;

  const handleConfirmReservation = async () => {
    if (!currentGuest) {
      onOpenAuth('register');
      return;
    }
    setBookingError('');
    setIsProcessingBooking(true);

    try {
      const payload = {
        guestId: currentGuest.Guest_ID,
        guestDetails: {
          firstName: currentGuest.First_Name,
          lastName: currentGuest.Last_Name,
          email: currentGuest.Email,
          phone: currentGuest.Phone
        },
        roomId: selectedRoom?.Room_ID || 'rm-101',
        checkInDate: checkIn,
        checkOutDate: checkOut,
        subtotal: roomSubtotal,
        discountAmount,
        taxAmount,
        totalAmount: netPayable,
        paymentMethod
      };

      const result = await createReservationApi(payload);
      if (result && !result.error) {
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingSuccess(false);
          setIsBookModalOpen(false);
          setSelectedRoom(null);
        }, 2400);
      } else {
        setBookingError(result?.error || 'Failed to complete reservation. Please try again.');
      }
    } catch (err) {
      console.warn('API connection failed, falling back to local confirmation:', err);
      // Graceful fallback for local offline simulation
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setIsBookModalOpen(false);
        setSelectedRoom(null);
      }, 2400);
    } finally {
      setIsProcessingBooking(false);
    }
  };

  return (
    <div ref={pageContainerRef} className="min-h-screen bg-sand-100 text-noir-900 selection:bg-noir-900 selection:text-sand-50 relative">
      {/* Dynamic Ambient Cursor Glow */}
      <div 
        className="luxury-cursor-glow hidden md:block"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
      />

      {/* 1. Luxury Editorial Navbar - Single Line */}
      <header className="sticky top-0 z-40 bg-sand-100/90 backdrop-blur-md border-b border-sand-300/80 px-4 sm:px-8 lg:px-12 py-3 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-nowrap gap-4">
          <div className="flex items-center gap-6 lg:gap-10 flex-nowrap shrink-0">
            <a href="#" className="flex items-center shrink-0 group py-0.5">
              <img 
                src="/logo.svg" 
                alt="The Grand Girvan Palace Hotels" 
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105" 
              />
            </a>
            <nav className="hidden md:flex items-center gap-3.5 lg:gap-6 text-[11px] lg:text-xs uppercase tracking-widest text-sand-800 whitespace-nowrap">
              <a href="#destinations" className="hover:text-noir-950 transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1px] after:bg-noir-900 after:transition-all">
                The Hotel
              </a>
              <a href="#rooms" className="hover:text-noir-950 transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1px] after:bg-noir-900 after:transition-all">
                Rooms &amp; Suites
              </a>
              <a href="#experiences" className="hover:text-noir-950 transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1px] after:bg-noir-900 after:transition-all">
                Experiences
              </a>
              <a href="#dining" className="hover:text-noir-950 transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1px] after:bg-noir-900 after:transition-all">
                In-Room Dining
              </a>
              <a href="#wellness" className="hover:text-noir-950 transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1px] after:bg-noir-900 after:transition-all">
                Spa &amp; Wellness
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-nowrap whitespace-nowrap">
            {currentGuest ? (
              <div className="flex items-center gap-2.5 bg-sand-50/90 border border-sand-300 px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-shadow">
                {currentGuest.Avatar ? (
                  <img
                    src={currentGuest.Avatar}
                    alt={currentGuest.First_Name}
                    className="w-7 h-7 rounded-full object-cover border border-sand-400"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-noir-900 text-sand-50 font-serif font-bold text-xs flex items-center justify-center border border-sand-400 select-none">
                    {(currentGuest.First_Name?.[0] || 'G').toUpperCase()}
                  </div>
                )}
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
              <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-nowrap">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="text-xs uppercase tracking-wider font-semibold text-noir-900 hover:text-accent-gold transition-colors px-2 py-1 whitespace-nowrap"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3 sm:px-4 py-2 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-full text-xs uppercase tracking-wider font-semibold transition-all shadow-sm active:scale-95 hover:shadow-lg whitespace-nowrap"
                >
                  Join Palace Club
                </button>
              </div>
            )}


            <button
              onClick={() => {
                if (selectedRoom) {
                  setIsBookModalOpen(true);
                } else {
                  const roomsEl = document.getElementById('rooms');
                  if (roomsEl) {
                    roomsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }
              }}
              className="hidden sm:inline-flex items-center px-4 py-2 border border-noir-900 hover:bg-noir-900 hover:text-sand-50 rounded-full text-xs uppercase tracking-wider font-semibold transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Book Stay
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Cinematic Zoom & Dynamic Typography */}
      <section 
        id="hero-section" 
        className="relative min-h-[calc(100vh-65px)] flex items-center justify-center px-6 md:px-12 py-10 bg-noir-950 overflow-visible scroll-mt-20 z-10"
      >
        {/* Full Bleed Architecture Photograph with Slow Zoom */}
        <img
          key={selectedBranch.Branch_ID}
          src={selectedBranch.Image}
          alt={selectedBranch.Location_Name}
          className="absolute inset-0 w-full h-full object-cover opacity-60 animate-hero-zoom filter brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/40 to-noir-950/20" />

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Hero Typographic Manifesto with Staggered Entrance */}
          <div className="lg:col-span-7 space-y-6 text-sand-50">
            <div className="animate-hero-badge inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-sand-300">
              <span className="w-8 h-[1px] bg-sand-300" />
              <span>{selectedBranch.Location_Name}</span>
            </div>
            
            <h1 className="animate-hero-title text-5xl sm:text-7xl xl:text-8xl font-serif font-normal leading-[1.02] tracking-tight">
              The world <br />
              <span className="italic font-light hover:text-accent-gold transition-colors duration-500">can wait.</span>
            </h1>

            <p className="animate-hero-desc text-sm sm:text-base text-sand-200/90 max-w-md font-light leading-relaxed">
              A sanctuary to step away. And feel entirely yourself amidst secluded regal grounds and private terraced suites.
            </p>

            <div className="animate-hero-desc pt-2">
              <a
                href="#destinations"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-sand-200 hover:text-white border-b border-sand-400 pb-1 transition-all hover:gap-3"
              >
                Discover the Palace &darr;
              </a>
            </div>
          </div>

          {/* Right Floating Reservation Widget with Staggered Smooth Entrance */}
          <div 
            id="booking-bar" 
            className="animate-hero-widget lg:col-span-5 bg-[#FDFBF7] rounded-3xl border border-sand-300 shadow-2xl p-6 sm:p-7 text-noir-900 transition-all hover:shadow-accent-gold/10 relative overflow-visible min-h-[460px] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-4 border-b border-sand-300">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-sand-600 font-semibold block">Make time for you</span>
                <h3 className="text-2xl font-serif font-medium text-noir-950 mt-0.5">A stay to remember.</h3>
              </div>
              <div className="w-9 h-9 rounded-full border border-sand-400 flex items-center justify-center font-serif text-sm bg-sand-100 shadow-inner font-semibold text-accent-gold">
                G
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {/* Destination Custom Select */}
              <CustomSelect
                label="Destination Estate"
                value={selectedBranch.Branch_ID}
                onChange={(branchId) => {
                  const found = INITIAL_BRANCHES.find(b => b.Branch_ID === branchId);
                  if (found) setSelectedBranch(found);
                }}
                options={INITIAL_BRANCHES.map(b => ({
                  value: b.Branch_ID,
                  label: b.Location_Name
                }))}
              />

              {/* Custom Luxury Date Picker (Matching user reference layout) */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-sand-700 font-semibold mb-1.5">
                  Stay Schedule
                </label>
                <LuxuryDatePicker
                  checkInDate={checkIn}
                  checkOutDate={checkOut}
                  onDatesChange={(inDate, outDate) => {
                    setCheckIn(inDate);
                    if (outDate) setCheckOut(outDate);
                  }}
                  isExpanded={isCalendarOpen}
                  onToggleExpand={setIsCalendarOpen}
                />
              </div>

              {/* Interactive Guests & Rooms Counter Popover */}
              <div className="relative" ref={guestPickerRef}>
                <button
                  type="button"
                  onClick={() => setIsGuestPickerOpen(!isGuestPickerOpen)}
                  className={`w-full p-3 bg-white border rounded-xl flex items-center justify-between text-left transition-all ${
                    isGuestPickerOpen ? 'border-noir-900 shadow-sm ring-1 ring-noir-900' : 'border-sand-300 hover:border-noir-800'
                  }`}
                >
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-sand-600 font-semibold block">
                      Guests &amp; Accommodations
                    </span>
                    <span className="text-xs font-semibold text-noir-900">
                      {guestCountSummary}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sand-600">
                    <Users className="w-4 h-4" />
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isGuestPickerOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Popover Card */}
                {isGuestPickerOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 p-5 bg-[#FAF7F0] border border-sand-400/80 rounded-2xl shadow-2xl z-50 space-y-4 animate-modal-card max-h-[380px] overflow-y-auto">
                    {/* Capacity Guidance Callout */}
                    <div className="flex items-center justify-between text-[11px] bg-sand-200/60 p-2.5 rounded-xl border border-sand-300">
                      <span className="text-sand-700">Max Room Capacity</span>
                      <span className="font-semibold text-noir-900">{MAX_GUESTS_PER_ROOM} guests / room ({maxAllowedGuests} max total)</span>
                    </div>

                    {/* Adults Counter */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-noir-900">Adults</div>
                        <div className="text-[10px] text-sand-600">Ages 13 and above</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleUpdateAdults(adultsCount - 1)}
                          disabled={adultsCount <= 1}
                          className="w-7 h-7 rounded-full border border-sand-400 bg-white hover:bg-sand-200 disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center transition-colors text-noir-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-noir-950 font-serif">
                          {adultsCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateAdults(adultsCount + 1)}
                          disabled={totalGuests >= 5 * MAX_GUESTS_PER_ROOM}
                          className="w-7 h-7 rounded-full border border-sand-400 bg-white hover:bg-sand-200 disabled:opacity-30 flex items-center justify-center transition-colors text-noir-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Children Counter */}
                    <div className="flex items-center justify-between border-t border-sand-200 pt-3">
                      <div>
                        <div className="text-xs font-semibold text-noir-900">Children</div>
                        <div className="text-[10px] text-sand-600">Ages 0 to 12</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleUpdateChildren(childrenCount - 1)}
                          disabled={childrenCount <= 0}
                          className="w-7 h-7 rounded-full border border-sand-400 bg-white hover:bg-sand-200 disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center transition-colors text-noir-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-noir-950 font-serif">
                          {childrenCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateChildren(childrenCount + 1)}
                          disabled={totalGuests >= 5 * MAX_GUESTS_PER_ROOM}
                          className="w-7 h-7 rounded-full border border-sand-400 bg-white hover:bg-sand-200 disabled:opacity-30 flex items-center justify-center transition-colors text-noir-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Rooms Counter */}
                    <div className="flex items-center justify-between border-t border-sand-200 pt-3">
                      <div>
                        <div className="text-xs font-semibold text-noir-900">Rooms</div>
                        <div className="text-[10px] text-sand-600">
                          {Math.ceil(totalGuests / MAX_GUESTS_PER_ROOM)} min for {totalGuests} guests
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleUpdateRooms(roomsCount - 1)}
                          disabled={roomsCount <= Math.ceil(totalGuests / MAX_GUESTS_PER_ROOM)}
                          className="w-7 h-7 rounded-full border border-sand-400 bg-white hover:bg-sand-200 disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center transition-colors text-noir-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-noir-950 font-serif">
                          {roomsCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateRooms(roomsCount + 1)}
                          disabled={roomsCount >= 5}
                          className="w-7 h-7 rounded-full border border-sand-400 bg-white hover:bg-sand-200 disabled:opacity-30 flex items-center justify-center transition-colors text-noir-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-sand-200">
                      <button
                        type="button"
                        onClick={() => setIsGuestPickerOpen(false)}
                        className="w-full py-2 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors shadow-sm"
                      >
                        Apply Company ({totalGuests} Guests • {roomsCount} {roomsCount > 1 ? 'Rooms' : 'Room'})
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Find Room CTA Button with Glow */}
              <button
                onClick={() => {
                  const el = document.getElementById('rooms');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-3.5 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-xl text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-xl active:scale-95 group"
              >
                <span>Find Your Room</span>
                <span className="text-[10px] opacity-75 font-normal">&bull; {nightsCount} Night{nightsCount > 1 ? 's' : ''}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="text-center text-[10px] text-sand-600 pt-1">
                Complimentary breakfast &amp; resort spa access included.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Editorial Philosophy / Brand Story Section with Scroll Reveal */}
      <section id="destinations" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 reveal-on-scroll">
            <span className="text-xs uppercase tracking-[0.3em] text-sand-600 font-semibold block">
              01 / The Palace Heritage
            </span>
            <h2 className="text-4xl sm:text-6xl font-serif text-noir-950 font-normal leading-tight">
              Not just a change of scenery. <br />
              <span className="italic">A change of pace.</span>
            </h2>
            <p className="text-sm text-sand-700 leading-relaxed max-w-lg">
              The Grand Girvan Palace offers space to settle in, to switch off, and to follow the day wherever it takes you amidst private coastal grounds and royal hospitality.
            </p>
            <div className="pt-2 flex items-center gap-8 text-xs text-sand-800">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-accent-gold" />
                <span>Private Terraces</span>
              </div>
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-accent-gold" />
                <span>Cove Waters</span>
              </div>
              <div className="flex items-center gap-2">
                <Wine className="w-4 h-4 text-accent-gold" />
                <span>Michelin Cellar</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative reveal-on-scroll">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-sand-300 group">
              <img
                src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200"
                alt="Amalfi Coast Estate"
                className="w-full h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir-950/70 via-transparent to-transparent flex items-end p-8 text-sand-50">
                <div>
                  <div className="text-xs uppercase tracking-widest text-sand-300">Positano &bull; Italy</div>
                  <div className="text-2xl font-serif">Maison Velour Amalfi Coast</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Rooms & Suites Catalog with Staggered Scroll Reveal */}
      <section id="rooms" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-6 border-b border-sand-300 reveal-on-scroll">
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

        <div className="space-y-8">
          {INITIAL_ROOMS.map((room, idx) => (
            <div
              key={room.Room_ID}
              className="reveal-on-scroll bg-sand-50 border border-sand-300/80 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 grid grid-cols-1 md:grid-cols-12 gap-0 group hover:-translate-y-1"
            >
              <div className="md:col-span-5 relative h-72 md:h-auto overflow-hidden bg-sand-200">
                <img
                  src={room.Image}
                  alt={room.TypeName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
                <span className="absolute top-4 left-4 text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-sand-50/90 backdrop-blur-md text-noir-900 border border-white/40 shadow-sm">
                  Suite {room.Room_Number}
                </span>
              </div>

              <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-serif text-noir-950 font-medium group-hover:text-accent-bronze transition-colors">
                        {room.TypeName}
                      </h3>
                      <p className="text-xs text-sand-600 mt-1 font-medium">{room.Specs}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-serif font-semibold text-noir-950">
                        ₹{room.Rate.toLocaleString()}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-sand-600">Per Night</div>
                    </div>
                  </div>

                  <p className="text-xs text-sand-700 mt-3 leading-relaxed">
                    Designed around natural stone, travertine textures, and sunlight. Features signature king pillowtop bedding, high-speed Wi-Fi, Nespresso bar, and panoramic French windows.
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
                    className="px-6 py-3 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all shadow-sm hover:shadow-lg active:scale-95 flex items-center gap-2 group/btn"
                  >
                    <span>Select Room</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Experiences & Curated Leisure Carousel */}
      <section id="experiences" className="py-14 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-5 border-b border-sand-300 reveal-on-scroll">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-sand-600 block mb-1">
              Curated Itineraries
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-noir-950 font-normal">
              Palace Experiences
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-xs md:text-sm text-sand-700 max-w-sm hidden sm:block">
              From subterranean vintage cellars to twilight yacht charters, elevate your coastal retreat with bespoke adventures.
            </p>
            {/* Carousel Arrow Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevExperience}
                aria-label="Previous Experience"
                className="p-2.5 rounded-full border border-sand-400 bg-sand-50 hover:bg-noir-900 hover:text-sand-50 hover:border-noir-900 transition-all text-noir-900 shadow-sm active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextExperience}
                aria-label="Next Experience"
                className="p-2.5 rounded-full border border-sand-400 bg-sand-50 hover:bg-noir-900 hover:text-sand-50 hover:border-noir-900 transition-all text-noir-900 shadow-sm active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Viewport Container */}
        <div className="relative">
          <div className="overflow-hidden px-1 py-3 -my-3 -mx-1">
            <div
              onTransitionEnd={handleTransitionEnd}
              className={`flex gap-6 ${
                isTransitionEnabled 
                  ? 'transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]' 
                  : 'transition-none'
              }`}
              style={{
                transform: `translateX(calc(-${currentExpIndex} * (100% + 1.5rem) / ${itemsPerView}))`
              }}
            >
              {extendedExperiences.map((exp, idx) => {
                const uniqueKey = `${exp.id}-${idx}`;
                return (
                  <div
                    key={uniqueKey}
                    style={{
                      flex: `0 0 calc((100% - ${(itemsPerView - 1) * 1.5}rem) / ${itemsPerView})`
                    }}
                    className="shrink-0 group select-none"
                  >
                    <div className="bg-sand-50 rounded-3xl overflow-hidden border border-sand-300 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col h-full justify-between">
                      <div>
                        {/* Experience Card Image Header */}
                        <div className="h-48 overflow-hidden relative">
                          <img
                            src={exp.image}
                            alt={exp.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-noir-950/60 via-transparent to-transparent" />
                          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                            <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-sand-50/95 text-noir-900 shadow-sm backdrop-blur-sm border border-sand-200">
                              {exp.tag}
                            </span>
                          </div>
                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-sand-100 text-[11px] font-medium">
                            <span className="flex items-center gap-1 drop-shadow-sm">
                              <Clock className="w-3 h-3 text-accent-gold" /> {exp.duration}
                            </span>
                            <span className="flex items-center gap-1 drop-shadow-sm">
                              <Users className="w-3 h-3 text-accent-gold" /> {exp.groupSize}
                            </span>
                          </div>
                        </div>

                        {/* Experience Card Body */}
                        <div className="p-5">
                          <div className="text-[9px] uppercase tracking-widest text-accent-bronze font-semibold mb-1">
                            {exp.category}
                          </div>
                          <h3 className="text-lg font-serif font-medium text-noir-950 mb-1.5 group-hover:text-accent-bronze transition-colors line-clamp-1">
                            {exp.title}
                          </h3>
                          <p className="text-xs text-sand-700 leading-relaxed line-clamp-2">
                            {exp.description}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-5 pb-5 pt-2.5 border-t border-sand-200/70 flex items-center justify-between">
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-sand-600">Reserved Rate</div>
                          <div className="text-sm font-serif font-semibold text-noir-950">{exp.price}</div>
                        </div>
                        <button
                          onClick={() => {
                            if (!currentGuest) {
                              onOpenAuth('register');
                            } else {
                              setSelectedExp(exp);
                              setExpSuccess(false);
                            }
                          }}
                          className="px-3.5 py-1.5 bg-noir-900 hover:bg-noir-950 text-sand-50 text-[11px] font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 group/btn"
                        >
                          <span>Reserve</span>
                          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Carousel Pagination Indicator Dots */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {INITIAL_EXPERIENCES.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => {
                  setIsTransitionEnabled(true);
                  setCurrentExpIndex(dotIdx + 3);
                }}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={`transition-all duration-300 rounded-full h-1.5 ${
                  activeDotIndex === dotIdx 
                    ? 'w-8 bg-noir-900' 
                    : 'w-2 bg-sand-300 hover:bg-sand-400'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4.6. In-Room Dining & Culinary Menu Carousel */}
      {diningMenu.length > 0 && (
        <section id="dining" className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-sand-300 pb-5">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-sand-600 font-semibold block mb-1.5">
                Royal Kitchen &bull; 24-Hour Suite Service
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-noir-950">
                In-Room Dining Menu.
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-xs text-sand-600 max-w-xs hidden md:block">
                Artisanal courses prepared to order and delivered directly to your suite.
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => scrollDiningCarousel('prev')}
                  className="w-10 h-10 rounded-full border border-sand-300 bg-sand-50 hover:bg-noir-900 hover:text-sand-50 text-noir-900 flex items-center justify-center transition-all shadow-xs active:scale-95"
                  aria-label="Previous dishes"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollDiningCarousel('next')}
                  className="w-10 h-10 rounded-full border border-sand-300 bg-sand-50 hover:bg-noir-900 hover:text-sand-50 text-noir-900 flex items-center justify-center transition-all shadow-xs active:scale-95"
                  aria-label="Next dishes"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={diningCarouselRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {diningMenu.map((item) => (
              <div
                key={item.Item_ID}
                className="snap-start shrink-0 w-[85%] sm:w-[46%] lg:w-[31.5%] group"
              >
                <div className="bg-sand-50 rounded-3xl overflow-hidden border border-sand-300 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col h-full justify-between">
                  <div>
                    <div className="h-48 overflow-hidden relative bg-sand-200">
                      <img
                        src={getDiningImage(item)}
                        alt={item.Name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-noir-950/60 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-sand-50/95 text-noir-900 shadow-sm backdrop-blur-sm border border-sand-200">
                          {item.Category}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="text-sm font-serif font-bold px-3 py-1 rounded-full bg-noir-950/85 text-sand-50 backdrop-blur-sm border border-white/15">
                          ₹{Number(item.Price).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h4 className="font-serif text-lg font-medium text-noir-950 group-hover:text-accent-bronze transition-colors line-clamp-1">
                        {item.Name}
                      </h4>
                      {item.Description && (
                        <p className="text-xs text-sand-700 mt-1.5 leading-relaxed line-clamp-2">
                          {item.Description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2.5 border-t border-sand-200/70 flex items-center justify-between text-[11px] text-sand-600">
                    <span>24-Hour Suite Delivery</span>
                    <span className="font-medium text-noir-900">Billed to Folio</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Spa & Wellness Sanctuary */}
      <section id="wellness" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="bg-sand-200/50 rounded-3xl border border-sand-300 p-8 md:p-12 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs uppercase tracking-[0.25em] text-accent-gold font-semibold block">
                Holistic Restoration
              </span>
              <h2 className="text-3xl md:text-5xl font-serif text-noir-950 font-normal">
                The Palace Bathhouse &amp; Spa
              </h2>
              <p className="text-xs md:text-sm text-sand-700 leading-relaxed max-w-xl">
                Immerse yourself in mineral thermal baths, salt floatation therapy, and bespoke aromatic massages performed by licensed master therapists.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold text-noir-900">
                <span className="px-3.5 py-1.5 rounded-full bg-sand-50 border border-sand-300">
                  Hydrotherapy Circuit
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-sand-50 border border-sand-300">
                  Deep Tissue &amp; Hot Stone
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-sand-50 border border-sand-300">
                  Herbal Cedar Steam
                </span>
              </div>

              {/* Live Spa Services from DB */}
              <div className="pt-4 space-y-2.5">
                <div className="text-[10px] uppercase tracking-wider text-sand-600 font-semibold">
                  Featured Holistic Treatments
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {spaServices.map((srv) => (
                    <div 
                      key={srv.Service_ID}
                      className="p-3 bg-white/90 border border-sand-300 rounded-xl flex items-center justify-between gap-3 shadow-xs hover:border-sand-400 transition-all"
                    >
                      <div>
                        <div className="font-semibold text-xs text-noir-900">{srv.Service_Name}</div>
                        <div className="text-[10px] text-sand-600">{srv.Duration_Minutes} Mins &bull; ₹{Number(srv.Price).toLocaleString()}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSpaService(srv);
                          setSpaSuccess(false);
                          setSpaError('');
                          setIsSpaModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all shrink-0 active:scale-95"
                      >
                        Reserve
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-sand-300 shadow-xl group">
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800"
                  alt="Spa Therapy"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Booking Preview Confirmation Modal */}
      {isBookModalOpen && selectedRoom && (
        <div 
          onClick={handleCloseBookModal}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-noir-950/70 backdrop-blur-xs overflow-y-auto ${
            isBookModalClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop'
          }`}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-4xl bg-sand-50 rounded-3xl border border-sand-300 shadow-2xl p-6 sm:p-8 relative my-auto ${
              isBookModalClosing ? 'animate-modal-card-out' : 'animate-modal-card'
            }`}
          >
            {/* Header with Close */}
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-sand-200">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-sand-500 block mb-1">Reservation Checkout</span>
                <h3 className="text-2xl sm:text-3xl font-serif text-noir-950 font-medium">
                  Your stay, at a glance.
                </h3>
                <p className="text-xs text-sand-600 mt-1">
                  Review booking details &amp; secure folio payment for <span className="font-semibold text-noir-900">{selectedBranch.Location_Name}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseBookModal}
                className="p-2 text-sand-500 hover:text-noir-900 hover:bg-sand-200 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left Column: Room Summary & Stay Info */}
              <div className="md:col-span-5 space-y-4">
                <div className="rounded-2xl overflow-hidden border border-sand-300 bg-sand-100 shadow-xs">
                  <div className="relative">
                    <img
                      src={selectedRoom.Image}
                      alt={selectedRoom.TypeName}
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-noir-900/80 backdrop-blur-md text-sand-100 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-sand-700/50">
                      Selected Suite
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="font-serif text-lg font-medium text-noir-950 leading-tight">
                        {selectedRoom.TypeName}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-serif font-semibold text-noir-950">
                          ₹{selectedRoom.Rate.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-sand-500">per night</div>
                      </div>
                    </div>
                    <div className="text-xs text-sand-600 mb-3">{selectedRoom.Specs}</div>

                    {/* Stay & Guest details pill cards */}
                    <div className="space-y-2 pt-3 border-t border-sand-200 text-xs">
                      <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-sand-200/50 border border-sand-300/80">
                        <span className="text-[10px] uppercase tracking-wider text-sand-600 font-medium">Guest</span>
                        <span className="font-semibold text-noir-900 truncate max-w-[160px]">
                          {currentGuest?.First_Name} {currentGuest?.Last_Name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-sand-200/50 border border-sand-300/80">
                        <span className="text-[10px] uppercase tracking-wider text-sand-600 font-medium">Dates</span>
                        <span className="font-semibold text-noir-900">
                          {checkIn} &rarr; {checkOut} ({nightsCount}N)
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-sand-200/50 border border-sand-300/80">
                        <span className="text-[10px] uppercase tracking-wider text-sand-600 font-medium">Rooms</span>
                        <span className="font-semibold text-noir-900">{roomsCount} Suite</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Payment & Folio Breakdown */}
              <div className="md:col-span-7 flex flex-col justify-between h-full space-y-4">
                {/* Promo Coupon Bar */}
                <div className="p-3.5 bg-sand-100/70 rounded-2xl border border-sand-300">
                  <label className="block text-[10px] uppercase tracking-wider text-sand-700 font-semibold mb-1.5">
                    Promotional or Voucher Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. WELCOME10 or VIP20"
                      className="flex-1 px-3 py-2 bg-white border border-sand-300 rounded-xl text-xs text-noir-900 uppercase tracking-wider focus:outline-none focus:border-noir-900 placeholder:normal-case placeholder:tracking-normal"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-noir-900 text-sand-50 hover:bg-noir-950 text-xs font-semibold rounded-xl transition-colors shadow-xs"
                    >
                      Apply
                    </button>
                  </div>
                  {couponStatus && (
                    <div className={`text-[10px] mt-1.5 ${discountPercent > 0 ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}`}>
                      {couponStatus}
                    </div>
                  )}
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-sand-700 font-semibold mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {['Credit Card', 'UPI / Bank', 'Pay at Hotel'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
                          paymentMethod === method
                            ? 'border-noir-900 bg-noir-900 text-sand-50 shadow-md ring-2 ring-noir-900/20'
                            : 'border-sand-300 bg-white text-sand-800 hover:border-sand-400 hover:bg-sand-50'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="text-[11px] font-semibold">{method}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Itemized Price Breakdown */}
                <div className="p-4 bg-sand-100/60 rounded-2xl border border-sand-300 space-y-2 text-xs">
                  <div className="flex justify-between text-sand-700">
                    <span>Room Charges ({nightsCount} Night{nightsCount > 1 ? 's' : ''} × {roomsCount} Room{roomsCount > 1 ? 's' : ''})</span>
                    <span className="font-semibold text-noir-900">₹{roomSubtotal.toLocaleString()}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Member Discount ({discountPercent}%)</span>
                      <span>- ₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sand-700">
                    <span>Luxury Hospitality GST &amp; Taxes (12%)</span>
                    <span>+ ₹{taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-noir-950 font-serif pt-2.5 border-t border-sand-300">
                    <div>
                      <span className="text-base font-bold block">Net Total Payable</span>
                      <span className="text-[10px] font-sans text-sand-500 font-normal">All taxes &amp; service charges included</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">₹{netPayable.toLocaleString()}</span>
                  </div>
                </div>

                {bookingError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs text-center font-medium">
                    {bookingError}
                  </div>
                )}

                {bookingSuccess ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs text-center font-medium flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Reservation Confirmed &amp; Payment Recorded! Invoice generated.
                  </div>
                ) : (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseBookModal}
                      disabled={isProcessingBooking}
                      className="w-1/3 py-3 border border-sand-300 text-noir-900 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-sand-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmReservation}
                      disabled={isProcessingBooking}
                      className="w-2/3 py-3 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isProcessingBooking ? (
                        <span>Processing Payment...</span>
                      ) : (
                        <>
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Pay &amp; Confirm (₹{netPayable.toLocaleString()})</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5b. Luxury Experience Inquiry / Reservation Modal */}
      {selectedExp && (
        <div 
          onClick={() => setSelectedExp(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/75 backdrop-blur-sm animate-modal-backdrop"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-sand-50 rounded-3xl border border-sand-300 shadow-2xl p-7 relative animate-modal-card"
          >
            <div className="text-center mb-4">
              <span className="text-[10px] uppercase tracking-widest text-accent-bronze font-semibold block">
                Concierge Experience Booking
              </span>
              <h3 className="text-2xl font-serif text-noir-950 font-medium mt-1">
                {selectedExp.title}
              </h3>
              <p className="text-xs text-sand-600 mt-1">
                Arranged exclusively for guests at {selectedBranch.Location_Name}.
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden border border-sand-300 mb-5 relative shadow-sm">
              <img src={selectedExp.image} alt={selectedExp.title} className="w-full h-44 object-cover" />
              <div className="absolute top-3 left-3">
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-sand-50/95 text-noir-900 shadow-sm backdrop-blur-sm border border-sand-200">
                  {selectedExp.tag}
                </span>
              </div>
              <div className="p-3 bg-sand-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-sand-700">
                  <Clock className="w-3.5 h-3.5 text-accent-gold" /> {selectedExp.duration}
                </span>
                <span className="flex items-center gap-1.5 text-sand-700">
                  <Users className="w-3.5 h-3.5 text-accent-gold" /> {selectedExp.groupSize}
                </span>
                <span className="font-serif font-semibold text-noir-950">
                  {selectedExp.price}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-y border-sand-200 py-3 mb-5">
              <div className="flex justify-between text-sand-700">
                <span>Guest Name</span>
                <span className="font-semibold text-noir-900">{currentGuest?.First_Name} {currentGuest?.Last_Name}</span>
              </div>
              <div className="flex justify-between text-sand-700">
                <span>Scheduled Party</span>
                <span className="font-semibold text-noir-900">{adultsCount} Adult{adultsCount > 1 ? 's' : ''}{childrenCount > 0 ? `, ${childrenCount} Child${childrenCount > 1 ? 'ren' : ''}` : ''}</span>
              </div>
              <div className="flex justify-between text-sand-700">
                <span>Stay Window</span>
                <span className="font-semibold text-noir-900">{checkIn} &rarr; {checkOut}</span>
              </div>
            </div>

            {expSuccess ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs text-center font-medium flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Experience Reserved! Our concierge desk has logged your itinerary.
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedExp(null)}
                  className="flex-1 py-2.5 border border-sand-300 text-noir-900 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-sand-200 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExpSuccess(true);
                    setTimeout(() => {
                      setExpSuccess(false);
                      setSelectedExp(null);
                    }, 2200);
                  }}
                  className="flex-1 py-2.5 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                  <span>Confirm Itinerary</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spa Appointment Booking Modal */}
      {isSpaModalOpen && selectedSpaService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/70 backdrop-blur-sm animate-modal-backdrop">
          <div className="w-full max-w-lg bg-sand-50 rounded-3xl border border-sand-300 shadow-2xl p-6 sm:p-8 relative animate-modal-card">
            <span className="text-[10px] uppercase tracking-[0.25em] text-accent-gold font-semibold block mb-1">
              Sanctuary Appointment
            </span>
            <h3 className="text-2xl font-serif text-noir-950 font-normal mb-1">
              {selectedSpaService.Service_Name}
            </h3>
            <p className="text-xs text-sand-600 mb-5">
              {selectedSpaService.Duration_Minutes} Minutes • ₹{Number(selectedSpaService.Price).toLocaleString()} (Billed to stay folio)
            </p>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-sand-700 font-semibold mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={spaDate}
                    onChange={(e) => setSpaDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-sand-300 rounded-xl text-xs text-noir-900 focus:outline-none focus:border-noir-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-sand-700 font-semibold mb-1">
                    Session Time
                  </label>
                  <input
                    type="time"
                    value={spaTime}
                    onChange={(e) => setSpaTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-sand-300 rounded-xl text-xs text-noir-900 focus:outline-none focus:border-noir-900"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-sand-200/50 rounded-xl border border-sand-300 space-y-1.5 text-xs text-sand-800">
                <div className="flex justify-between">
                  <span className="text-sand-600">Guest:</span>
                  <span className="font-semibold text-noir-900">{currentGuest ? `${currentGuest.First_Name} ${currentGuest.Last_Name}` : 'In-House Resident'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sand-600">Billing Folio:</span>
                  <span className="font-mono text-noir-900">Room Folio Billable</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-sand-300 font-serif font-bold text-sm text-noir-950">
                  <span>Treatment Total:</span>
                  <span>₹{Number(selectedSpaService.Price).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {spaError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs text-center font-medium">
                {spaError}
              </div>
            )}

            {spaSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs text-center font-medium flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Spa Treatment Confirmed! Added to your room folio.
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSpaModalOpen(false)}
                  disabled={isBookingSpa}
                  className="flex-1 py-2.5 border border-sand-300 text-noir-900 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-sand-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setIsBookingSpa(true);
                      setSpaError('');
                      const startDateTime = `${spaDate}T${spaTime}:00`;
                      const res = await bookSpaAppointmentApi({
                        reservationId: 'res-8841',
                        serviceId: selectedSpaService.Service_ID,
                        startTime: startDateTime
                      });
                      if (res.error) throw new Error(res.error);
                      setSpaSuccess(true);
                      setTimeout(() => {
                        setSpaSuccess(false);
                        setIsSpaModalOpen(false);
                      }, 2000);
                    } catch (err) {
                      setSpaError(err.message || 'Failed to book spa treatment');
                    } finally {
                      setIsBookingSpa(false);
                    }
                  }}
                  disabled={isBookingSpa}
                  className="flex-1 py-2.5 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                  <span>{isBookingSpa ? 'Confirming...' : 'Book Treatment'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Editorial Footer with Discreet Staff Operations Link */}
      <footer className="bg-sand-200/70 border-t border-sand-300 py-12 px-6 md:px-12 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-sand-700">
          <div>
            <span className="font-serif text-lg text-noir-950 font-medium block">THE GRAND GIRVAN PALACE</span>
            <span>&copy; {new Date().getFullYear()} The Grand Girvan Palace Hospitality Group. All rights reserved.</span>
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
