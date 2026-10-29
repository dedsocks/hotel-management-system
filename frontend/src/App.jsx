import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginView from './components/LoginView';
import Sidebar from './components/Sidebar';
import OverviewDashboard from './components/OverviewDashboard';
import StaffDirectoryView from './components/StaffDirectoryView';
import { Sparkles, Construction } from 'lucide-react';

function MainApp() {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState('overview');

  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-sand-100 flex">
      {/* Luxury resort sidebar navigation */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {currentTab === 'overview' && (
          <OverviewDashboard onNavigateTab={setCurrentTab} />
        )}

        {currentTab === 'staff' && (
          <StaffDirectoryView />
        )}

        {/* Placeholder for Next Modules (Clean & bounded to prevent hallucination) */}
        {(currentTab === 'reservations' || currentTab === 'rooms' || currentTab === 'pos' || currentTab === 'billing') && (
          <div className="p-12 max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex p-4 rounded-2xl bg-sand-200/60 border border-sand-300 text-accent-gold mb-2">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-serif text-noir-950 font-normal capitalize">
              {currentTab} Module
            </h2>
            <p className="text-sm text-sand-700 max-w-lg mx-auto">
              Module 1 (Authentication &amp; Operations Dashboard) is active. This section is ready to connect directly to the next feature slice based on your schema.
            </p>
            <div className="pt-4">
              <button
                onClick={() => setCurrentTab('overview')}
                className="px-5 py-2.5 bg-noir-900 text-sand-50 rounded-lg text-xs uppercase tracking-wider font-medium hover:bg-noir-950 transition-colors shadow-sm"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
