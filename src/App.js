import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages — we'll fill these in one by one
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientHistoryPage from './pages/PatientHistoryPage';
import PatientProfilePage from './pages/PatientProfilePage';
import MyPatientsPage from './pages/MyPatientsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import DoctorListPage from './pages/DoctorListPage';
import AlertsPage from './pages/AlertsPage';
import SymptomLogsPage from './pages/SymptomLogsPage';
import SettingsPage from './pages/SettingsPage';
import LockPage from './pages/LockPage';
import RescheduleRequestsPage from './pages/RescheduleRequestsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/lock" element={<LockPage />} />

            {/* Protected — all roles */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="patients" element={<PatientHistoryPage />} />
              <Route path="patients/:id" element={<PatientProfilePage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="symptoms" element={<SymptomLogsPage />} />
              <Route path="settings" element={<SettingsPage />} />

              {/* Doctor only */}
              <Route path="my-patients" element={
                <ProtectedRoute role="doctor"><MyPatientsPage /></ProtectedRoute>
              } />

              {/* Staff only */}
              <Route path="doctors" element={
                <ProtectedRoute role="staff"><DoctorListPage /></ProtectedRoute>
              } />
              <Route path="reschedules" element={
                <ProtectedRoute role="staff"><RescheduleRequestsPage /></ProtectedRoute>
              } />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
