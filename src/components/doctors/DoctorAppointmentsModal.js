import React from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { Calendar } from 'lucide-react';
import Badge from '../common/Badge';

export default function DoctorAppointmentsModal({ isOpen, onClose, doctor }) {
  const { getAppointmentsForDoctor } = useData();

  if (!doctor) return null;

  const appointments = getAppointmentsForDoctor(doctor.id) || [];
  
  // Sort chronologically (latest first)
  const sortedAppts = [...appointments].sort((a, b) => {
    return `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Appointments for Dr. ${doctor.name}`}
      size="lg"
      footer={<button className="btn btn-primary" onClick={onClose}>Close</button>}
    >
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Showing all {sortedAppts.length} appointments for <strong>Dr. {doctor.name}</strong> ({doctor.specialty} · {doctor.department})
        </p>
      </div>

      {sortedAppts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 0' }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Calendar size={22} color="var(--text-muted)" />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>No Appointments Found</p>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>This doctor does not have any scheduled appointments.</p>
        </div>
      ) : (
        <div className="table-wrapper" style={{ maxHeight: '450px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Patient Name</th>
                <th>Patient ID</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedAppts.map(appt => (
                <tr key={appt.id}>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{appt.date}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>{appt.time}</td>
                  <td style={{ fontSize: 13.5, fontWeight: 600 }}>{appt.patientName}</td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: 11.5, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: 3 }}>
                      {appt.patientId}
                    </span>
                  </td>
                  <td>
                    <span style={{ background: 'var(--bg-base)', padding: '3px 8px', borderRadius: 12, fontSize: 11.5, fontWeight: 600 }}>
                      {appt.type}
                    </span>
                  </td>
                  <td>
                    <Badge 
                      label={appt.status} 
                      variant={appt.status === 'Confirmed' ? 'success' : appt.status === 'Pending' ? 'warning' : 'danger'} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
