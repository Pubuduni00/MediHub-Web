import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import DoctorTable from '../components/doctors/DoctorTable';
import AddDoctorModal from '../components/doctors/AddDoctorModal';
import EditDoctorModal from '../components/doctors/EditDoctorModal';
import DoctorAppointmentsModal from '../components/doctors/DoctorAppointmentsModal';
import './DoctorListPage.css';

export default function DoctorListPage() {
  const { doctors } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [viewDoctorAppts, setViewDoctorAppts] = useState(null);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctor List</h1>
          <p className="page-subtitle">{doctors.length} registered doctors</p>
        </div>
      </div>
      <div className="card">
        <DoctorTable 
          doctors={doctors} 
          onAdd={() => setShowAdd(true)} 
          onEdit={(doc) => setEditDoctor(doc)}
          onViewAppointments={(doc) => setViewDoctorAppts(doc)}
        />
      </div>
      
      <AddDoctorModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
      
      <EditDoctorModal 
        isOpen={!!editDoctor} 
        onClose={() => setEditDoctor(null)} 
        doctor={editDoctor} 
      />
      
      <DoctorAppointmentsModal 
        isOpen={!!viewDoctorAppts} 
        onClose={() => setViewDoctorAppts(null)} 
        doctor={viewDoctorAppts} 
      />
    </div>
  );
}
