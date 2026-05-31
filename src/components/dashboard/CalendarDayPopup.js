import React from 'react';
import { X, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

export default function CalendarDayPopup({ date, appointments, onClose }) {
  const navigate = useNavigate();
  if (!date) return null;

  const sorted = [...appointments].sort((a, b) => a.time.localeCompare(b.time));
  const displayDate = typeof date === 'string' ? parseISO(date) : date;

  return (
    <div style={{
      position: 'absolute', zIndex: 200,
      background: 'var(--bg-white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-xl)',
      width: 280, padding: 0,
      overflow: 'hidden',
      animation: 'slideUp 0.15s ease'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px',
        background: 'var(--primary)', color: '#fff'
      }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700 }}>{format(displayDate, 'MMMM d, yyyy')}</p>
          <p style={{ fontSize: 11, opacity: 0.85 }}>{sorted.length} appointment{sorted.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', padding: 4 }}>
          <X size={14} />
        </button>
      </div>

      {/* List */}
      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        {sorted.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 14px', fontSize: 13 }}>No appointments</p>
        ) : sorted.map(appt => (
          <div
            key={appt.id}
            onClick={() => { navigate(`/patients/${appt.patientId}`); onClose(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer', transition: 'var(--transition)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={16} color="var(--primary)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {appt.patientName}
              </p>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{appt.type}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
              <Clock size={11} />
              {appt.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
