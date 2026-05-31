import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, ChevronRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';

export default function AppointmentList() {
  const { appointments } = useData();
  const { user, isDoctor } = useAuth();
  const navigate = useNavigate();

  const today = format(new Date(), 'yyyy-MM-dd');
  let todayAppts = appointments.filter(a => a.date === today);
  if (isDoctor) todayAppts = todayAppts.filter(a => a.doctorId === user?.id);
  todayAppts = todayAppts.sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <h3 className="card-title">Today's Appointments</h3>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/appointments')}>
          View All <ChevronRight size={13} />
        </button>
      </div>

      {todayAppts.length === 0 ? (
        <EmptyState title="No appointments today" message="All clear for today" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {todayAppts.map(appt => (
            <div
              key={appt.id}
              onClick={() => navigate(`/patients/${appt.patientId}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-light)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 'var(--radius-md)',
                background: 'var(--primary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <User size={18} color="var(--primary)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {appt.patientName}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {appt.type} · {appt.doctorName}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: 12.5, fontWeight: 600 }}>
                  <Clock size={12} />
                  {appt.time}
                </div>
                <Badge label={appt.status} variant={appt.status === 'Confirmed' ? 'success' : 'warning'} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
