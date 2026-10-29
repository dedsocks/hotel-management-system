import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  CalendarCheck, 
  BedDouble, 
  Sparkles, 
  Receipt, 
  Users, 
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ currentTab, onSelectTab, onExitToPublic }) {
  const { currentStaff, logoutStaff } = useAuth();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'reservations', label: 'Reservations', icon: CalendarCheck, badge: '3 Active' },
    { id: 'rooms', label: 'Rooms & Housekeeping', icon: BedDouble },
    { id: 'pos', label: 'POS & Spa Services', icon: Sparkles },
    { id: 'billing', label: 'Billing & Invoices', icon: Receipt },
    { id: 'staff', label: 'Staff Directory', icon: Users, roleRequired: 'Manager' },
  ];

  return (
    <aside className="w-64 bg-sand-200/60 border-r border-sand-300 flex flex-col justify-between h-screen sticky top-0 backdrop-blur-md">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-sand-300">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-gold inline-block animate-pulse"></span>
            <span className="text-[10px] tracking-[0.25em] uppercase text-sand-700 font-semibold">Resort Ops</span>
          </div>
          <h2 className="text-xl font-serif tracking-wider font-semibold text-noir-900 uppercase">
            Maison Velour
          </h2>
          <p className="text-[11px] text-sand-600 tracking-wide mt-0.5">
            Cote d'Azur Retreat
          </p>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            if (item.roleRequired && currentStaff?.Role !== item.roleRequired) {
              return null;
            }
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-noir-900 text-sand-50 shadow-sm'
                    : 'text-noir-850 hover:bg-sand-300/50 hover:text-noir-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-accent-gold' : 'text-sand-600'}`} />
                  <span className="tracking-wide">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-noir-800 text-accent-champagne' : 'bg-sand-300 text-sand-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-sand-300 bg-sand-200/40 space-y-2">
        {onExitToPublic && (
          <button
            onClick={onExitToPublic}
            className="w-full py-1.5 px-3 rounded-lg text-[11px] text-sand-700 hover:text-noir-950 hover:bg-sand-300/60 font-medium transition-colors text-left flex items-center justify-between"
          >
            <span>&larr; Public Guest Website</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <img
              src={currentStaff?.Avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={currentStaff?.First_Name}
              className="w-9 h-9 rounded-full object-cover border border-sand-400"
            />
            <div className="truncate">
              <div className="text-xs font-semibold text-noir-900 truncate">
                {currentStaff?.First_Name} {currentStaff?.Last_Name}
              </div>
              <div className="text-[11px] text-sand-600 truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
                {currentStaff?.Role}
              </div>
            </div>
          </div>
          <button
            onClick={logoutStaff}
            title="Log Out"
            className="p-1.5 rounded-md hover:bg-sand-300 text-sand-600 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
