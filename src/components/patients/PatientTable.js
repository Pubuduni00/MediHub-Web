import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, UserPlus, Search, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import EmptyState from '../common/EmptyState';

export default function PatientTable({ patients, onRegister }) {
  const { isDoctor, user } = useAuth();
  const { assignPatientToDoctor } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [signedIds, setSignedIds] = useState([]);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || (p.phone || '').includes(q);
    const matchFilter = filter === 'All' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const handleSign = (patientId) => {
    assignPatientToDoctor(patientId, user.id);
    setSignedIds(prev => [...prev, patientId]);
  };

  const isAlreadyAssigned = (patient) =>
    patient.assignedDoctors?.includes(user?.id) || signedIds.includes(patient.id);

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, gap:12, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div className="search-bar" style={{ width:260 }}>
            <Search size={14} color="var(--text-muted)" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, ID, phone..." />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <Filter size={13} color="var(--text-muted)" />
            {['All','Active','Inactive'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter===f?'btn-primary':'btn-ghost'}`}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:12.5, color:'var(--text-muted)' }}>{filtered.length} patient{filtered.length!==1?'s':''}</span>
          {!isDoctor && (
            <button className="btn btn-primary btn-sm" onClick={onRegister}>
              <UserPlus size={14}/> Register Patient
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {filtered.length === 0 ? (
          <EmptyState title="No patients found" message="Try adjusting your search or filters" />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>ID</th>
                <th>Age / Gender</th>
                <th>Blood Group</th>
                <th>Phone</th>
                <th>Registered</th>
                <th>Status</th>
                <th style={{ textAlign:'center' }}>View</th>
                {isDoctor && <th style={{ textAlign:'center' }}>Sign</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <Avatar name={p.name} size="sm" />
                      <div>
                        <p style={{ fontWeight:600, fontSize:13.5, color:'var(--text-primary)', cursor:'pointer' }}
                          onClick={() => navigate(`/patients/${p.id}`)}>
                          {p.name}
                        </p>
                        <p style={{ fontSize:11.5, color:'var(--text-muted)' }}>{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily:'monospace', fontSize:12.5, background:'var(--bg-base)', padding:'2px 7px', borderRadius:4, color:'var(--primary)', fontWeight:600 }}>
                      {p.id}
                    </span>
                  </td>
                  <td style={{ fontSize:13 }}>{p.age}y · {p.gender}</td>
                  <td><span style={{ fontWeight:700, color:'var(--accent-red)', fontSize:13 }}>{p.bloodGroup}</span></td>
                  <td style={{ fontSize:13 }}>{p.phone}</td>
                  <td style={{ fontSize:12.5, color:'var(--text-muted)' }}>{p.registeredDate}</td>
                  <td><Badge label={p.status} variant={p.status==='Active'?'success':'muted'} dot /></td>
                  <td style={{ textAlign:'center' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate(`/patients/${p.id}`)}>
                      <Eye size={13}/> View
                    </button>
                  </td>
                  {isDoctor && (
                    <td style={{ textAlign:'center' }}>
                      {isAlreadyAssigned(p)
                        ? <span className="badge badge-success">✓ Signed</span>
                        : <button className="btn btn-secondary btn-sm" onClick={() => handleSign(p.id)}>
                            <UserPlus size={13}/> Sign
                          </button>
                      }
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
