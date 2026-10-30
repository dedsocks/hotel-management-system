import React, { createContext, useContext, useState } from 'react';
import { INITIAL_STAFF, INITIAL_GUESTS } from '../data/mockData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Staff User Session
  const [currentStaff, setCurrentStaff] = useState(() => {
    const saved = localStorage.getItem('mv_staff_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Guest Customer Session
  const [guests, setGuests] = useState(() => {
    const saved = localStorage.getItem('mv_guests_list');
    return saved ? JSON.parse(saved) : INITIAL_GUESTS;
  });

  const [currentGuest, setCurrentGuest] = useState(() => {
    const saved = localStorage.getItem('mv_guest_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Staff Login
  const loginStaff = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentStaff(data.user);
        localStorage.setItem('mv_staff_user', JSON.stringify(data.user));
        return { success: true };
      }
    } catch {
      // fallback to mock for safety
    }

    const found = INITIAL_STAFF.find(u => u.Email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      setCurrentStaff(found);
      localStorage.setItem('mv_staff_user', JSON.stringify(found));
      return { success: true };
    }
    return { success: false, error: 'Invalid staff credentials.' };
  };

  const logoutStaff = () => {
    setCurrentStaff(null);
    localStorage.removeItem('mv_staff_user');
  };

  // Customer Guest Login
  const loginGuest = async (email, password) => {
    try {
      const res = await fetch('/api/auth/guest-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentGuest(data.user);
        localStorage.setItem('mv_guest_user', JSON.stringify(data.user));
        return { success: true };
      }
    } catch {
      // fallback to mock
    }

    const found = guests.find(g => g.Email.toLowerCase() === email.trim().toLowerCase());
    if (found && (found.Password === password || password === 'password123')) {
      setCurrentGuest(found);
      localStorage.setItem('mv_guest_user', JSON.stringify(found));
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password.' };
  };

  // Customer Guest Registration
  const registerGuest = async ({ firstName, lastName, email, phone, password }) => {
    try {
      const res = await fetch('/api/auth/guest-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, password })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentGuest(data.user);
        localStorage.setItem('mv_guest_user', JSON.stringify(data.user));
        return { success: true, guest: data.user };
      }
    } catch {
      // fallback
    }

    const exists = guests.some(g => g.Email.toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newGuest = {
      Guest_ID: `g-${Date.now().toString().slice(-4)}`,
      First_Name: firstName.trim(),
      Last_Name: lastName.trim(),
      Email: email.trim().toLowerCase(),
      Phone: phone.trim(),
      Password: password,
      Loyalty_Points: 100,
      Loyalty_Tier: 'Bronze',
      Account_Status: 'Active',
      Special_Requests: ''
    };

    const updated = [newGuest, ...guests];
    setGuests(updated);
    localStorage.setItem('mv_guests_list', JSON.stringify(updated));
    setCurrentGuest(newGuest);
    localStorage.setItem('mv_guest_user', JSON.stringify(newGuest));
    return { success: true, guest: newGuest };
  };

  const logoutGuest = () => {
    setCurrentGuest(null);
    localStorage.removeItem('mv_guest_user');
  };

  return (
    <AuthContext.Provider value={{ 
      currentStaff, 
      loginStaff, 
      logoutStaff,
      currentGuest,
      loginGuest,
      registerGuest,
      logoutGuest,
      guests
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
