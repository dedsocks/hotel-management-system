import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function LuxuryDatePicker({ 
  checkInDate, 
  checkOutDate, 
  onDatesChange,
  isExpanded,
  onToggleExpand
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const containerRef = useRef(null);

  const isOpen = isExpanded !== undefined ? isExpanded : internalOpen;
  const setIsOpen = (val) => {
    if (onToggleExpand) onToggleExpand(val);
    else setInternalOpen(val);
  };

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

  const calcNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const diff = parseDate(checkOutDate) - parseDate(checkInDate);
    const nights = Math.round(diff / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  return (
    <div className="w-full" ref={containerRef}>
      {/* 1. Collapsed State: Editorial Dual Cards */}
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

      {/* 2. Expanded State: Solid Opaque Calendar Expanding Over Widget */}
      {isOpen && (
        <div className="absolute inset-0 z-30 bg-[#FDFBF7] rounded-3xl p-6 sm:p-7 flex flex-col justify-between text-noir-900 shadow-2xl transition-all duration-300">
          {/* Header Month & Navigation with Close Button */}
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-sand-300">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-sand-600 font-semibold block">
                  {selectingStep === 'checkIn' ? 'Step 1 • Select Check-In Date' : 'Step 2 • Select Check-Out Date'}
                </span>
                <h3 className="text-2xl font-serif font-medium text-noir-950 mt-0.5">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center border border-sand-300 rounded-full bg-white p-0.5 shadow-sm">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-full hover:bg-sand-100 text-sand-700 hover:text-noir-950 transition-colors"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-full hover:bg-sand-100 text-sand-700 hover:text-noir-950 transition-colors"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full border border-sand-300 hover:border-noir-900 bg-white text-sand-700 hover:text-noir-950 transition-all shadow-sm active:scale-95"
                  title="Close and shrink calendar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Selected Date Badges */}
            <div className="grid grid-cols-2 gap-2 pt-3">
              <div 
                onClick={() => setSelectingStep('checkIn')}
                className={`px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectingStep === 'checkIn' 
                    ? 'border-noir-900 bg-noir-900 text-sand-50 font-medium' 
                    : 'border-sand-300 bg-white text-sand-700 hover:border-sand-400'
                }`}
              >
                <span className="text-[9px] uppercase tracking-wider block opacity-75">Check-In</span>
                <span>{checkInDisp.month} {checkInDisp.day}, {viewYear}</span>
              </div>
              <div 
                onClick={() => setSelectingStep('checkOut')}
                className={`px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectingStep === 'checkOut' 
                    ? 'border-noir-900 bg-noir-900 text-sand-50 font-medium' 
                    : 'border-sand-300 bg-white text-sand-700 hover:border-sand-400'
                }`}
              >
                <span className="text-[9px] uppercase tracking-wider block opacity-75">Check-Out</span>
                <span>{checkOutDisp.day !== '--' ? `${checkOutDisp.month} ${checkOutDisp.day}, ${viewYear}` : 'Choose date'}</span>
              </div>
            </div>
          </div>

          {/* Days Grid & Days of Week */}
          <div className="my-auto py-2">
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center py-1.5 text-[10px] font-semibold uppercase text-sand-500 tracking-wider">
              {DAYS_SHORT.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Empty Offset */}
              {Array.from({ length: offset }).map((_, i) => (
                <div key={`empty-${i}`} className="h-9" />
              ))}

              {/* Day Cells */}
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
                    className={`h-9 w-full rounded-xl text-xs font-medium transition-all relative flex items-center justify-center ${
                      isCheckIn || isCheckOut
                        ? 'bg-noir-950 text-white font-semibold shadow-md scale-105 ring-1 ring-accent-gold'
                        : isInRange
                        ? 'bg-sand-200/90 text-noir-950 font-semibold'
                        : 'hover:bg-sand-200 text-noir-850 hover:font-semibold'
                    }`}
                  >
                    <span>{day}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Confirmation Footer */}
          <div className="pt-3 border-t border-sand-300 flex items-center justify-between">
            <div className="text-xs text-sand-700">
              <span className="font-semibold text-noir-950">{calcNights()} Nights</span> stay selected
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-noir-900 hover:bg-noir-950 text-sand-50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm active:scale-95"
            >
              Done &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
