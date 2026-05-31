import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useData } from '../context/DataContext';
import DoctorTable from '../components/doctors/DoctorTable';
import AddDoctorModal from '../components/doctors/AddDoctorModal';
import { exportDoctorsPDF } from '../components/doctors/DoctorPDFExport';
import './DoctorListPage.css';

export default function DoctorListPage() {
  const { doctors } = useData();
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctor List</h1>
          <p className="page-subtitle">{doctors.length} registered doctors</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => exportDoctorsPDF(doctors)}>
          <Download size={14} /> Download PDF
        </button>
      </div>
      <div className="card">
        <DoctorTable doctors={doctors} onAdd={() => setShowAdd(true)} />
      </div>
      <AddDoctorModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
