import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_STAFF } from '../data/mockData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('mv_auth_user');
    return saved ? JSON.parse(saved) : INITIAL_STAFF[0]; // Default to Elena (Manager)
  });

  const login = (email, password) => {
    const found = INITIAL_STAFF.find(u => u.Email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('mv_auth_user', JSON.stringify(found));
      return { success: true };
    }
    return { success: false, error: 'Invalid staff email or password.' };
  };

  const switchUser = (staffId) => {
    const found = INITIAL_STAFF.find(u => u.Staff_ID === staffId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('mv_auth_user', JSON.stringify(found));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mv_auth_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
