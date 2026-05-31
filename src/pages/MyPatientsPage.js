import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { format } from 'date-fns';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';
import './MyPatientsPage.css';

const SORT_OPTIONS = [
  { value: 'name', label: 'Patient Name' },
  { value: 'id', label: 'Patient ID' },
  { value: 'date', label: 'Registered Date' },
  { value: 'nextAppt', label: 'Next Appointment' },
];

export default function MyPatientsPage() {
  const { user } = useAuth();
  const { getPatientsForDoctor, appointments } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showSort, setShowSort] = useState(false);

  const myPatients = getPatientsForDoctor(user?.id);

  const getNextAppt = (patientId) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const upcoming = appointments
      .filter(a => a.patientId === patientId && a.doctorId === user?.id && a.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
    return upcoming[0] || null;
  };

  const sorted = myPatients
    .filter(p => {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'id') return a.id.localeCompare(b.id);
      if (sortBy === 'date') return (b.registeredDate || '').localeCompare(a.registeredDate || '');
      if (sortBy === 'nextAppt') {
        const aA = getNextAppt(a.id), bA = getNextAppt(b.id);
        if (!aA && !bA) return 0;
        if (!aA) return 1; if (!bA) return -1;
        return aA.date.localeCompare(bA.date);
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Patients</h1>
          <p className="page-subtitle">{myPatients.length} patient{myPatients.length !== 1 ? 's' : ''} under your care</p>
        </div>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="my-patients-toolbar">
          <div className="search-bar" style={{ width: 280 }}>
            <Search size={14} color="var(--text-muted)" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your patients..." />
          </div>
          <div style={{ position: 'relative' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowSort(s => !s)}>
              <ArrowUpDown size={13} /> Sort: {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
            </button>
            {showSort && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 100, minWidth: 200, overflow: 'hidden' }}>
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                    style={{ display: 'block', width: '100%', padding: '9px 16px', textAlign: 'left', background: sortBy === opt.value ? 'var(--primary-light)' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13.5, color: sortBy === opt.value ? 'var(--primary)' : 'var(--text-primary)', fontWeight: sortBy === opt.value ? 600 : 400 }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        {sorted.length === 0 ? (
          <EmptyState title={myPatients.length === 0 ? "No patients assigned yet" : "No patients match your search"} message={myPatients.length === 0 ? "Go to Patient History and click Sign to add patients under your care." : ''} />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>ID</th>
                  <th>Age / Gender</th>
                  <th>Blood Group</th>
                  <th>Phone</th>
                  <th>Next Appointment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(p => {
                  const nextAppt = getNextAppt(p.id);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={p.name} size="sm" />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 13.5, cursor: 'pointer', color: 'var(--text-primary)' }} onClick={() => navigate(`/patients/${p.id}`)}>{p.name}</p>
                            <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 12.5, background: 'var(--bg-base)', padding: '2px 7px', borderRadius: 4, color: 'var(--primary)', fontWeight: 600 }}>{p.id}</span></td>
                      <td style={{ fontSize: 13 }}>{p.age}y · {p.gender}</td>
                      <td><span style={{ fontWeight: 700, color: 'var(--accent-red)', fontSize: 13 }}>{p.bloodGroup}</span></td>
                      <td style={{ fontSize: 13 }}>{p.phone}</td>
                      <td>
                        {nextAppt
                          ? <div><p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--primary)' }}>{nextAppt.date}</p><p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{nextAppt.time} · {nextAppt.type}</p></div>
                          : <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>—</span>
                        }
                      </td>
                      <td><Badge label={p.status} variant={p.status === 'Active' ? 'success' : 'muted'} dot /></td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/patients/${p.id}`)}>
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
