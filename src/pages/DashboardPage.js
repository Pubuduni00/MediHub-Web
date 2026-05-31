import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronRight, Activity, Bell, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import StatsRow from '../components/dashboard/StatsRow';
import AppointmentList from '../components/dashboard/AppointmentList';
import DashboardCalendar from '../components/dashboard/DashboardCalendar';
import Badge from '../components/common/Badge';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user, isDoctor } = useAuth();
  const { alerts, symptomLogs, patients } = useData();
  const navigate = useNavigate();

  const recentAlerts = alerts.filter(a => !a.read).slice(0, 4);
  const recentSymptoms = symptomLogs.slice(-3).reverse();

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
          Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 3 }}>
          {format(new Date(), "EEEE, dd MMMM yyyy")} · MediHub Care Platform
        </p>
      </div>

      {/* Stats */}
      <StatsRow />

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-col-left">
          {/* Today's Appointments */}
          <AppointmentList />

          {/* Recent Patients */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recently Registered Patients</h3>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/patients')}>
                View All <ChevronRight size={13} />
              </button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>ID</th>
                    <th>Age</th>
                    <th>Blood Group</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.slice(-5).reverse().map(p => (
                    <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/patients/${p.id}`)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div className="avatar avatar-sm">{p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                          <span style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</span>
                        </div>
                      </td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 12.5, color: 'var(--primary)', fontWeight: 600 }}>{p.id}</span></td>
                      <td style={{ fontSize: 13 }}>{p.age}y</td>
                      <td><span style={{ fontWeight: 700, color: 'var(--accent-red)', fontSize: 13 }}>{p.bloodGroup}</span></td>
                      <td><Badge label={p.status} variant={p.status === 'Active' ? 'success' : 'muted'} dot /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-col-right">
          {/* Calendar */}
          <DashboardCalendar />

          {/* Unread Alerts */}
          {recentAlerts.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Bell size={16} color="var(--accent-orange)" /> Unread Alerts
                </h3>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/alerts')}>
                  View All <ChevronRight size={13} />
                </button>
              </div>
              <div className="recent-activity">
                {recentAlerts.map(a => (
                  <div key={a.id} className="activity-item" onClick={() => navigate('/alerts')} style={{ cursor: 'pointer' }}>
                    <div className="activity-dot" style={{ background: a.severity === 'danger' ? 'var(--accent-red)' : a.severity === 'warning' ? 'var(--accent-orange)' : 'var(--primary)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.message}</p>
                      <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{a.patientName} · {a.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Symptom Reports */}
          {recentSymptoms.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Activity size={16} color="var(--accent-red)" /> Recent Symptoms
                </h3>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/symptoms')}>
                  View All <ChevronRight size={13} />
                </button>
              </div>
              <div className="recent-activity">
                {recentSymptoms.map(s => (
                  <div key={s.id} className="activity-item" style={{ cursor: 'pointer' }} onClick={() => navigate(`/patients/${s.patientId}`)}>
                    <div className="activity-dot" style={{ background: s.severity === 'Severe' ? 'var(--accent-red)' : s.severity === 'Moderate' ? 'var(--accent-orange)' : 'var(--accent-green)' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 600 }}>{s.patientName}</p>
                      <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{s.symptoms.join(', ')}</p>
                    </div>
                    <Badge label={s.severity} variant={s.severity === 'Severe' ? 'danger' : s.severity === 'Moderate' ? 'warning' : 'success'} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
