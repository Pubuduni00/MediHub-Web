import React, { useState } from 'react';
import { format } from 'date-fns';
import { Download, Search, Filter } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import AppointmentCalendar from '../components/appointments/AppointmentCalendar';
import AddAppointmentModal from '../components/appointments/AddAppointmentModal';
import { exportAppointmentsPDF } from '../components/appointments/AppointmentPDFExport';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import './AppointmentsPage.css';

export default function AppointmentsPage() {
  const { appointments } = useData();
  const { isDoctor, user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [prefillDate, setPrefillDate] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const today = format(new Date(), 'yyyy-MM-dd');

  const handleAddFromCalendar = (date) => { setPrefillDate(date); setShowAdd(true); };

  let todayAppts = appointments.filter(a => a.date === today);
  if (isDoctor) todayAppts = todayAppts.filter(a => a.doctorId === user?.id);
  todayAppts = todayAppts
    .filter(a => {
      const q = search.toLowerCase();
      const matchSearch = a.patientName.toLowerCase().includes(q) || a.patientId.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'All' || a.status === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="appts-layout">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">Schedule management & calendar</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => exportAppointmentsPDF(todayAppts, today)}>
            <Download size={14} /> Download Today's PDF
          </button>
        </div>
      </div>

      {/* Calendar */}
      <AppointmentCalendar onAddAppointment={handleAddFromCalendar} />

      {/* Today's List */}
      <div className="card">
        <div className="appts-list-header">
          <h3 className="card-title">Today's Appointments — {format(new Date(), 'dd MMMM yyyy')}</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-bar" style={{ width: 220 }}>
              <Search size={13} color="var(--text-muted)" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {['All', 'Confirmed', 'Pending'].map(f => (
                <button key={f} onClick={() => setFilterStatus(f)} className={`btn btn-sm ${filterStatus === f ? 'btn-primary' : 'btn-ghost'}`}>{f}</button>
              ))}
            </div>
          </div>
        </div>

        {todayAppts.length === 0 ? (
          <EmptyState title="No appointments today" message="Use the calendar above to add appointments." />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Hospital ID</th>
                  <th>Doctor</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAppts.map((a, i) => (
                  <tr key={a.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{i + 1}</td>
                    <td><span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>{a.time}</span></td>
                    <td style={{ fontWeight: 600, fontSize: 13.5 }}>{a.patientName}</td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 7px', borderRadius: 4 }}>{a.patientId}</span></td>
                    <td style={{ fontSize: 13 }}>{a.doctorName}</td>
                    <td><span className="badge badge-primary">{a.type}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{a.duration || 30} min</td>
                    <td style={{ fontSize: 12.5, color: 'var(--text-secondary)', maxWidth: 200 }}>{a.details || '—'}</td>
                    <td><Badge label={a.status} variant={a.status === 'Confirmed' ? 'success' : 'warning'} dot /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddAppointmentModal isOpen={showAdd} onClose={() => setShowAdd(false)} prefillDate={prefillDate} />
    </div>
  );
}
