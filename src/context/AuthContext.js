import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:5000/api';
const KNOWN_DOCTORS = [];

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('medihub_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  // ── Staff login ──
  const loginStaff = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/staff-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        return { success: false, error: errData.error || 'Invalid credentials' };
      }
      
      const userData = await res.json();
      const sessionUser = { ...userData, role: 'staff' };
      setUser(sessionUser);
      localStorage.setItem('medihub_user', JSON.stringify(sessionUser));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Could not connect to authentication server' };
    }
  };

  // ── Doctor login via Google OAuth ──
  const loginDoctor = async (googleProfile) => {
    try {
      const res = await fetch(`${API_URL}/auth/doctor-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleProfile.email,
          name: googleProfile.name,
          picture: googleProfile.picture
        })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        return { success: false, error: errData.error || 'Google login failed' };
      }
      
      const doctorData = await res.json();
      const sessionUser = {
        ...doctorData,
        role: 'doctor',
        avatar: googleProfile.picture || doctorData.avatar || null
      };
      
      setUser(sessionUser);
      localStorage.setItem('medihub_user', JSON.stringify(sessionUser));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Could not connect to authentication server' };
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      const endpoint = user.role === 'doctor' ? `/doctors/${user.id}` : `/staff/${user.id}`;
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updatedData = await res.json();
        const sessionUser = { ...user, ...updatedData };
        setUser(sessionUser);
        localStorage.setItem('medihub_user', JSON.stringify(sessionUser));
        return { success: true };
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
    return { success: false, error: 'Failed to update profile' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medihub_user');
  };

  // ── Derived role helpers (used everywhere in the app) ──
  const isDoctor = user?.role === 'doctor';
  const isStaff  = user?.role === 'staff';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginStaff,
      loginDoctor,
      updateUserProfile,
      logout,
      isDoctor,   // ← exported so PatientTable, Sidebar, etc. can use it
      isStaff,
      KNOWN_DOCTORS,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
