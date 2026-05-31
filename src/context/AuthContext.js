import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// ── Staff credentials (replace with API call when backend is ready) ──
const STAFF_CREDENTIALS = [
  { id: 'ST001', email: 'admin@medihub.com',      password: 'Staff@1234', name: 'Sarah Johnson',   role: 'staff', department: 'Administration' },
  { id: 'ST002', email: 'reception@medihub.com',  password: 'Staff@1234', name: 'Michael Chen',    role: 'staff', department: 'Reception' },
  { id: 'ST003', email: 'staff@medihub.com',      password: 'Staff@1234', name: 'Pubuduni Mayanthi',role: 'staff', department: 'General Medicine' },
];

// ── Known doctors (matched by Google email after OAuth) ──
// Add any real doctor Google emails here before going to production
const KNOWN_DOCTORS = [
  { id: 'DR001', email: 'amara.patel@medihub.com',  name: 'Dr. Amara Patel',   specialty: 'Cardiology',       department: 'Cardiology' },
  { id: 'DR002', email: 'james.wilson@medihub.com', name: 'Dr. James Wilson',  specialty: 'General Medicine', department: 'General Medicine' },
  { id: 'DR003', email: 'priya.nair@medihub.com',   name: 'Dr. Priya Nair',    specialty: 'Neurology',        department: 'Neurology' },
];

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
  const loginStaff = (email, password) => {
    const found = STAFF_CREDENTIALS.find(
      s => s.email.toLowerCase() === email.toLowerCase() && s.password === password
    );
    if (found) {
      const userData = { ...found };
      setUser(userData);
      localStorage.setItem('medihub_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password. Please try again.' };
  };

  // ── Doctor login via Google OAuth ──
  // googleProfile = { name, email, picture } from Google userinfo endpoint
  const loginDoctor = (googleProfile) => {
    // Check if email matches a known doctor
    let doctor = KNOWN_DOCTORS.find(
      d => d.email.toLowerCase() === googleProfile.email?.toLowerCase()
    );

    if (!doctor) {
      // ── DEMO FALLBACK ──
      // Any Google account that isn't in KNOWN_DOCTORS logs in as a demo doctor.
      // In production: remove this block and return { success: false, error: '...' }
      doctor = {
        id: 'DR001',
        name: googleProfile.name || 'Demo Doctor',
        email: googleProfile.email,
        specialty: 'General Medicine',
        department: 'General Medicine',
      };
    }

    const userData = {
      ...doctor,
      role: 'doctor',                          // ← THIS is what isDoctor checks
      avatar: googleProfile.picture || null,
    };

    setUser(userData);
    localStorage.setItem('medihub_user', JSON.stringify(userData));
    return { success: true };
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
