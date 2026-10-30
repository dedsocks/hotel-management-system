import React, { useState, useEffect } from 'react';
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
import PosSpaServicesView from './components/PosSpaServicesView';
import { Sparkles } from 'lucide-react';

function AppContent() {
  const { currentStaff } = useAuth();
  
  // Navigation mode: 'guest' (default public site) or 'staff' (internal operations)
  const [viewMode, setViewMode] = useState(() => {
    return window.location.hash === '#staff' ? 'staff' : 'guest';
  });
  const [currentStaffTab, setCurrentStaffTab] = useState('overview');

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#staff') {
        setViewMode('staff');
      } else if (window.location.hash === '#guest' || window.location.hash === '') {
        setViewMode('guest');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Customer Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleGoToStaff = () => {
    window.location.hash = '#staff';
    setViewMode('staff');
  };

  const handleGoToGuest = () => {
    window.location.hash = '';
    setViewMode('guest');
  };

  // 1. Staff Operations Experience
  if (viewMode === 'staff') {
    // If not logged in as staff, show internal staff login screen
    if (!currentStaff) {
      return (
        <LoginView onBackToPublic={handleGoToGuest} />
      );
    }

    return (
      <div className="min-h-screen bg-sand-100 flex">
        <Sidebar 
          currentTab={currentStaffTab} 
          onSelectTab={setCurrentStaffTab}
          onExitToPublic={handleGoToGuest}
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
              <PosSpaServicesView />
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
        onNavigateStaffPortal={handleGoToStaff}
      />
      <GuestAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSwitchStaff={handleGoToStaff}
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
