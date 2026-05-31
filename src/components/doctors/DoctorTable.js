import React, { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import EmptyState from '../common/EmptyState';

export default function DoctorTable({ doctors, onAdd }) {
  const [search, setSearch] = useState('');

  const filtered = doctors.filter(d => {
    const q = search.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.employeeId.toLowerCase().includes(q);
  });

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, gap:12, flexWrap:'wrap' }}>
        <div className="search-bar" style={{ width:280 }}>
          <Search size={14} color="var(--text-muted)"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, specialty, ID..." />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:12.5, color:'var(--text-muted)' }}>{filtered.length} doctor{filtered.length!==1?'s':''}</span>
          <button className="btn btn-primary btn-sm" onClick={onAdd}><UserPlus size={14}/> Add Doctor</button>
        </div>
      </div>

      <div className="table-wrapper">
        {filtered.length===0 ? (
          <EmptyState title="No doctors found" />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Employee ID</th>
                <th>Specialty</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Qualification</th>
                <th>Schedule</th>
                <th>Join Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d=>(
                <tr key={d.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <Avatar name={d.name} size="sm" color="linear-gradient(135deg,var(--primary),var(--secondary))" />
                      <div>
                        <p style={{ fontWeight:600, fontSize:13.5 }}>{d.name}</p>
                        <p style={{ fontSize:11.5, color:'var(--text-muted)' }}>{d.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ fontFamily:'monospace', fontSize:12.5, background:'var(--bg-base)', padding:'2px 7px', borderRadius:4, color:'var(--primary)', fontWeight:600 }}>{d.employeeId}</span></td>
                  <td style={{ fontSize:13 }}>{d.specialty}</td>
                  <td style={{ fontSize:13 }}>{d.department}</td>
                  <td style={{ fontSize:13 }}>{d.phone}</td>
                  <td style={{ fontSize:12.5, color:'var(--text-muted)' }}>{d.qualification}</td>
                  <td style={{ fontSize:12.5 }}>{d.schedule}</td>
                  <td style={{ fontSize:12.5, color:'var(--text-muted)' }}>{d.joinDate}</td>
                  <td><Badge label={d.status} variant={d.status==='Active'?'success':'muted'} dot /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
