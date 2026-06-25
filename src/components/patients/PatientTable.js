import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, Filter } from 'lucide-react';
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
    const matchSearch = p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.phone||'').includes(q);
    const matchFilter = filter==='All' || p.status===filter;
    return matchSearch && matchFilter;
  });

  const handleSign = (e, patientId) => {
    e.stopPropagation();
    assignPatientToDoctor(patientId, user.id);
    setSignedIds(prev => [...prev, patientId]);
  };

  const isAlreadyAssigned = (p) =>
    p.assignedDoctors?.includes(user?.id) || signedIds.includes(p.id);

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, gap:12, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div className="search-bar" style={{ width:260 }}>
            <Search size={14} color="var(--text-muted)"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, ID, phone..."/>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <Filter size={13} color="var(--text-muted)"/>
            {['All','Active','Inactive'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={`btn btn-sm ${filter===f?'btn-primary':'btn-ghost'}`}>{f}</button>
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
      {filtered.length===0 ? (
        <EmptyState title="No patients found" message="Try adjusting your search or filters"/>
      ) : (
        <div style={{ overflowX:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
            <thead>
              <tr style={{ background:'var(--bg-base)' }}>
                <th style={th()}>Patient</th>
                <th style={th(68)}>ID</th>
                <th style={th(100)}>Age / Gender</th>
                <th style={th(80)}>Blood</th>
                <th style={th(110)}>Phone</th>
                <th style={th(95)}>Registered</th>
                <th style={th(90)}>Status</th>
                {isDoctor && <th style={th(88)}>Sign</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p=>(
                <tr key={p.id}
                  onClick={()=>navigate(`/patients/${p.id}`)}
                  style={{ borderBottom:'1px solid var(--border)', cursor:'pointer', transition:'var(--transition)' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--primary-light)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  <td style={td()}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <Avatar name={p.name} size="sm"/>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontWeight:600, fontSize:13.5, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
                        <p style={{ fontSize:11.5, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={td()}>
                    <span style={{ fontFamily:'monospace', fontSize:12, background:'var(--primary-light)', padding:'2px 6px', borderRadius:4, color:'var(--primary)', fontWeight:600 }}>{p.id}</span>
                  </td>
                  <td style={td()}><span style={{ fontSize:13 }}>{p.age}y · {p.gender}</span></td>
                  <td style={td()}><span style={{ fontWeight:700, color:'var(--accent-red)', fontSize:13 }}>{p.bloodGroup}</span></td>
                  <td style={td()}><span style={{ fontSize:13 }}>{p.phone}</span></td>
                  <td style={td()}><span style={{ fontSize:12.5, color:'var(--text-muted)' }}>{p.registeredDate}</span></td>
                  <td style={td()}>
                    <span style={{
                      display:'inline-flex', alignItems:'center', gap:5,
                      padding:'4px 10px', borderRadius:20,
                      fontSize:12, fontWeight:600,
                      background: p.status==='Active' ? 'var(--accent-green-light)' : 'var(--bg-base)',
                      color: p.status==='Active' ? 'var(--accent-green)' : 'var(--text-muted)',
                    }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background: p.status==='Active'?'var(--accent-green)':'var(--text-muted)', flexShrink:0 }}/>
                      {p.status}
                    </span>
                  </td>
                  {isDoctor && (
                    <td style={td()} onClick={e=>e.stopPropagation()}>
                      {isAlreadyAssigned(p) ? (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:20, fontSize:12, fontWeight:600, background:'var(--accent-green-light)', color:'var(--accent-green)' }}>
                          ✓ Signed
                        </span>
                      ) : (
                        <button className="btn btn-secondary btn-sm" onClick={e=>handleSign(e,p.id)} style={{ fontSize:12, padding:'4px 10px' }}>
                          <UserPlus size={12}/> Sign
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th = (w) => ({
  padding:'10px 12px', textAlign:'left',
  fontSize:11.5, fontWeight:700,
  color:'var(--text-secondary)',
  textTransform:'uppercase', letterSpacing:'0.05em',
  borderBottom:'1px solid var(--border)',
  whiteSpace:'nowrap', overflow:'hidden',
  ...(w ? { width:w } : {}),
});

const td = () => ({
  padding:'11px 12px',
  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
});
