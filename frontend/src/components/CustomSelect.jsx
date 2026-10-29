import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Building, MapPin } from 'lucide-react';

export default function CustomSelect({ 
  options, 
  value, 
  onChange, 
  label, 
  variant = 'light',
  placeholder = 'Select an option'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDark = variant === 'dark';

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className={`block text-[10px] uppercase tracking-wider font-semibold mb-1.5 ${
          isDark ? 'text-sand-300' : 'text-sand-700'
        }`}>
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-left transition-all duration-200 outline-none ${
          isDark 
            ? 'bg-noir-900/90 hover:bg-noir-900 text-sand-50 border border-white/20 rounded-xl px-3.5 py-2 text-xs backdrop-blur-md shadow-sm focus:border-accent-gold' 
            : 'bg-white hover:border-noir-900 text-noir-900 border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs font-medium shadow-sm focus:ring-1 focus:ring-noir-900 focus:border-noir-900'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedOption?.icon ? (
            <span className="text-accent-gold">{selectedOption.icon}</span>
          ) : (
            <Building className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-accent-gold' : 'text-sand-600'}`} />
          )}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ml-2 ${
          isOpen ? 'rotate-180 text-accent-gold' : isDark ? 'text-sand-400' : 'text-sand-600'
        }`} />
      </button>

      {/* Floating Animated Dropdown Menu */}
      {isOpen && (
        <div className={`absolute left-0 right-0 mt-2 z-50 rounded-2xl border shadow-2xl p-1.5 animate-modal-card overflow-hidden ${
          isDark
            ? 'bg-noir-900 border-sand-700/60 text-sand-50 shadow-black/60'
            : 'bg-sand-50 border-sand-300 text-noir-900 shadow-xl'
        }`}>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                    isSelected
                      ? isDark 
                        ? 'bg-noir-800 text-sand-50 font-semibold' 
                        : 'bg-sand-200/90 text-noir-950 font-semibold'
                      : isDark
                        ? 'text-sand-300 hover:bg-noir-800/60 hover:text-sand-50'
                        : 'text-sand-700 hover:bg-sand-200/50 hover:text-noir-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isSelected ? 'bg-accent-gold' : 'bg-transparent'
                    }`} />
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-accent-gold shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
