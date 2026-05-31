import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import PatientTable from '../components/patients/PatientTable';
import RegisterPatientModal from '../components/patients/RegisterPatientModal';
import './PatientHistoryPage.css';

export default function PatientHistoryPage() {
  const { patients } = useData();
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="patient-history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Patient History</h1>
          <p className="page-subtitle">All registered patients — {patients.length} total</p>
        </div>
      </div>

      <div className="card">
        <PatientTable patients={patients} onRegister={() => setShowRegister(true)} />
      </div>

      <RegisterPatientModal isOpen={showRegister} onClose={() => setShowRegister(false)} />
    </div>
  );
}
