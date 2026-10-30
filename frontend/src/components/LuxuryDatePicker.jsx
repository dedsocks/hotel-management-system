import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function LuxuryDatePicker({ checkInDate, checkOutDate, onDatesChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parsing dates
  const parseDate = (dStr) => {
    if (!dStr) return new Date();
    const [y, m, d] = dStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const formatDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatDisplay = (dStr) => {
    if (!dStr) return { day: '--', month: '---', dayOfWeek: '---' };
    const date = parseDate(dStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
    return { day, month, dayOfWeek };
  };

  const startDate = parseDate(checkInDate);
  const [viewMonth, setViewMonth] = useState(startDate.getMonth());
  const [viewYear, setViewYear] = useState(startDate.getFullYear());

  // Selecting state: 'checkIn' | 'checkOut'
  const [selectingStep, setSelectingStep] = useState('checkIn');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  // Monday as 0:
  const offset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handleDateClick = (day) => {
    const clickedDate = new Date(viewYear, viewMonth, day);
    const clickedStr = formatDateStr(clickedDate);

    if (selectingStep === 'checkIn') {
      onDatesChange(clickedStr, checkOutDate);
      setSelectingStep('checkOut');
    } else {
      // If selected checkOut is before or equal to checkIn, reset checkIn
      if (clickedStr <= checkInDate) {
        onDatesChange(clickedStr, '');
        setSelectingStep('checkOut');
      } else {
        onDatesChange(checkInDate, clickedStr);
        setSelectingStep('checkIn');
        setIsOpen(false);
      }
    }
  };

  const checkInDisp = formatDisplay(checkInDate);
  const checkOutDisp = formatDisplay(checkOutDate);

  // Nights calculation
  const calcNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const diff = parseDate(checkOutDate) - parseDate(checkInDate);
    const nights = Math.round(diff / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Editorial Luxury Trigger Cards (Matches User Reference Layout) */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="grid grid-cols-2 gap-3 cursor-pointer group"
      >
        <div className={`p-3.5 bg-white border rounded-2xl transition-all duration-300 hover:border-noir-900 shadow-sm ${
          isOpen && selectingStep === 'checkIn' ? 'border-noir-950 ring-1 ring-noir-950' : 'border-sand-300'
        }`}>
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-sand-600 font-semibold mb-1">
            <span>Check In</span>
            <CalendarIcon className="w-3 h-3 text-accent-gold" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-normal text-noir-950">{checkInDisp.day}</span>
            <div className="text-[11px] font-semibold text-sand-700 leading-tight">
              <div>{checkInDisp.month}</div>
              <div className="text-[9px] text-sand-500 font-normal">{checkInDisp.dayOfWeek}</div>
            </div>
          </div>
        </div>

        <div className={`p-3.5 bg-white border rounded-2xl transition-all duration-300 hover:border-noir-900 shadow-sm ${
          isOpen && selectingStep === 'checkOut' ? 'border-noir-950 ring-1 ring-noir-950' : 'border-sand-300'
        }`}>
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-sand-600 font-semibold mb-1">
            <span>Check Out</span>
            <CalendarIcon className="w-3 h-3 text-accent-gold" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-normal text-noir-950">{checkOutDisp.day}</span>
            <div className="text-[11px] font-semibold text-sand-700 leading-tight">
              <div>{checkOutDisp.month}</div>
              <div className="text-[9px] text-sand-500 font-normal">{checkOutDisp.dayOfWeek}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Overlay inside DatePicker container */}
      {isOpen && (
        <div className="absolute inset-x-0 -top-2 z-50 bg-sand-50/98 backdrop-blur-2xl rounded-2xl border border-sand-300 shadow-2xl p-4 text-noir-900 ring-1 ring-noir-950/10 animate-modal-card">
          {/* Header Month & Navigation */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-sand-200">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-sand-600 font-semibold block">
                {selectingStep === 'checkIn' ? '1. Select Check In' : '2. Select Check Out'}
              </span>
              <h4 className="text-sm font-serif font-semibold text-noir-950">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h4>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-full hover:bg-sand-200 text-sand-700 hover:text-noir-950 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-full hover:bg-sand-200 text-sand-700 hover:text-noir-950 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-sand-200 text-sand-500 hover:text-noir-950 transition-colors ml-1"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center py-1 text-[9px] font-semibold uppercase text-sand-500 tracking-wider">
            {DAYS_SHORT.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Empty Offset cells */}
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7" />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

              const isCheckIn = dateStr === checkInDate;
              const isCheckOut = dateStr === checkOutDate;
              const isInRange = checkInDate && checkOutDate && dateStr > checkInDate && dateStr < checkOutDate;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={`h-7 w-full rounded-md text-[11px] font-medium transition-all relative flex items-center justify-center ${
                    isCheckIn || isCheckOut
                      ? 'bg-noir-900 text-sand-50 font-semibold shadow-sm scale-105'
                      : isInRange
                      ? 'bg-sand-200/90 text-noir-950 font-medium'
                      : 'hover:bg-sand-200/60 text-noir-850'
                  }`}
                >
                  <span>{day}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Summary Bar */}
          <div className="mt-2.5 pt-2 border-t border-sand-200 flex items-center justify-between text-[11px] text-sand-600">
            <div>
              <span className="font-semibold text-noir-900">{calcNights()} Nights</span> selected
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-noir-900 hover:text-accent-gold transition-colors"
            >
              Confirm Dates &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
