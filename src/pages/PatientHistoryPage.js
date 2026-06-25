import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import PatientTable from '../components/patients/PatientTable';
import RegisterPatientModal from '../components/patients/RegisterPatientModal';
import './PatientHistoryPage.css';

export default function PatientHistoryPage() {
  const { patients } = useData();
  const [showRegister, setShowRegister] = useState(false);
  return (
    <div>
      <p style={{fontSize:13.5,color:'var(--text-muted)',marginBottom:16}}>All registered patients — {patients.length} total</p>
      <div className="card">
        <PatientTable patients={patients} onRegister={()=>setShowRegister(true)}/>
      </div>
      <RegisterPatientModal isOpen={showRegister} onClose={()=>setShowRegister(false)}/>
    </div>
  );
}
