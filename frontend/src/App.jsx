import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import GuestLandingView from './components/GuestLandingView';
import GuestAuthModal from './components/GuestAuthModal';
import LoginView from './components/LoginView';
import Sidebar from './components/Sidebar';
import OverviewDashboard from './components/OverviewDashboard';
import StaffDirectoryView from './components/StaffDirectoryView';
import ReservationsManagerView from './components/ReservationsManagerView';
import RoomsHousekeepingView from './components/RoomsHousekeepingView';
import BillingInvoicesView from './components/BillingInvoicesView';
import { Sparkles } from 'lucide-react';

function AppContent() {
  const { currentStaff } = useAuth();
  
  // Navigation mode: 'guest' (default public site) or 'staff' (internal operations)
  const [viewMode, setViewMode] = useState('guest');
  const [currentStaffTab, setCurrentStaffTab] = useState('overview');
  
  // Customer Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // 1. Staff Operations Experience
  if (viewMode === 'staff') {
    // If not logged in as staff, show internal staff login screen
    if (!currentStaff) {
      return (
        <LoginView onBackToPublic={() => setViewMode('guest')} />
      );
    }

    return (
      <div className="min-h-screen bg-sand-100 flex">
        <Sidebar 
          currentTab={currentStaffTab} 
          onSelectTab={setCurrentStaffTab}
          onExitToPublic={() => setViewMode('guest')}
        />
        <main className="flex-1 overflow-y-auto">
          <div key={currentStaffTab} className="animate-fade-in transition-all duration-300">
            {currentStaffTab === 'overview' && (
              <OverviewDashboard onNavigateTab={setCurrentStaffTab} />
            )}
            {currentStaffTab === 'reservations' && (
              <ReservationsManagerView />
            )}
            {currentStaffTab === 'rooms' && (
              <RoomsHousekeepingView />
            )}
            {currentStaffTab === 'billing' && (
              <BillingInvoicesView />
            )}
            {currentStaffTab === 'staff' && (
              <StaffDirectoryView />
            )}
            {currentStaffTab === 'pos' && (
              <div className="p-12 max-w-4xl mx-auto text-center space-y-4">
                <div className="inline-flex p-4 rounded-2xl bg-sand-200/60 border border-sand-300 text-accent-gold mb-2">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-serif text-noir-950 font-normal capitalize">
                  POS &amp; Spa Services Module
                </h2>
                <p className="text-sm text-sand-700 max-w-lg mx-auto">
                  Spa amenities, dining folios, and poolside charges billing interface connected to guest rooms.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setCurrentStaffTab('overview')}
                    className="px-5 py-2.5 bg-noir-900 text-sand-50 rounded-lg text-xs uppercase tracking-wider font-medium hover:bg-noir-950 transition-colors shadow-sm"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // 2. Default Public Guest Experience (Matches reference screenshot)
  return (
    <>
      <GuestLandingView 
        onOpenAuth={handleOpenAuth}
        onNavigateStaffPortal={() => setViewMode('staff')}
      />
      <GuestAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
