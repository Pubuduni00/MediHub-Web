import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpDown, UserX, UserCheck, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { format } from 'date-fns';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';
import ChangeStatusModal from '../components/patients/ChangeStatusModal';
import './MyPatientsPage.css';

const SORT_OPTIONS = [
  { value:'name',     label:'Patient Name' },
  { value:'id',       label:'Patient ID' },
  { value:'date',     label:'Registered Date' },
  { value:'nextAppt', label:'Next Appointment' },
];

export default function MyPatientsPage() {
  const { user } = useAuth();
  const { getPatientsForDoctor, appointments, updatePatient } = useData();
  const navigate = useNavigate();

  const [search, setSearch]       = useState('');
  const [sortBy, setSortBy]       = useState('name');
  const [showSort, setShowSort]   = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [statusModal, setStatusModal]   = useState(null); // patient object

  const myPatients = getPatientsForDoctor(user?.id);
  const activePatients   = myPatients.filter(p => p.status === 'Active');
  const inactivePatients = myPatients.filter(p => p.status === 'Inactive');

  const getNextAppt = (patientId) => {
    const today = format(new Date(),'yyyy-MM-dd');
    return appointments
      .filter(a => a.patientId===patientId && a.doctorId===user?.id && a.date>=today)
      .sort((a,b) => a.date.localeCompare(b.date))[0] || null;
  };

  const sortFn = (a, b) => {
    if (sortBy==='id')   return a.id.localeCompare(b.id);
    if (sortBy==='date') return (b.registeredDate||'').localeCompare(a.registeredDate||'');
    if (sortBy==='nextAppt') {
      const aA=getNextAppt(a.id), bA=getNextAppt(b.id);
      if (!aA&&!bA) return 0;
      if (!aA) return 1; if (!bA) return -1;
      return aA.date.localeCompare(bA.date);
    }
    return a.name.localeCompare(b.name);
  };

  const filterSort = (list) => list
    .filter(p => {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    })
    .sort(sortFn);

  const handleStatusChange = (patientId, newStatus, reason, notes) => {
    updatePatient(patientId, {
      status: newStatus,
      statusHistory: [
        ...(myPatients.find(p=>p.id===patientId)?.statusHistory || []),
        { status: newStatus, reason, notes, changedBy: user?.name, date: new Date().toISOString() }
      ]
    });
  };

  const PatientRow = ({ p, dimmed = false }) => {
    const nextAppt = getNextAppt(p.id);
    const isInactive = p.status === 'Inactive';
    return (
      <tr
        onClick={() => navigate(`/patients/${p.id}`)}
        style={{ borderBottom:'1px solid var(--border)', cursor:'pointer', transition:'var(--transition)', opacity: dimmed ? 0.7 : 1 }}
        onMouseEnter={e => e.currentTarget.style.background='var(--primary-light)'}
        onMouseLeave={e => e.currentTarget.style.background='transparent'}
      >
        <td style={td()}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Avatar name={p.name} size="sm"/>
            <div style={{ minWidth:0 }}>
              <p style={{ fontWeight:600, fontSize:13.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
              <p style={{ fontSize:11.5, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.email}</p>
            </div>
          </div>
        </td>
        <td style={td()}>
          <span style={{ fontFamily:'monospace', fontSize:12, background:'var(--primary-light)', padding:'2px 6px', borderRadius:4, color:'var(--primary)', fontWeight:600 }}>{p.id}</span>
        </td>
        <td style={td()}><span style={{ fontSize:13 }}>{p.age}y · {p.gender}</span></td>
        <td style={td()}><span style={{ fontWeight:700, color:'var(--accent-red)', fontSize:13 }}>{p.bloodGroup}</span></td>
        <td style={td()}>
          {nextAppt ? (
            <div>
              <p style={{ fontSize:12.5, fontWeight:600, color:'var(--primary)' }}>{nextAppt.date}</p>
              <p style={{ fontSize:11.5, color:'var(--text-muted)' }}>{nextAppt.time} · {nextAppt.type}</p>
            </div>
          ) : (
            <span style={{ fontSize:12.5, color:'var(--text-muted)' }}>—</span>
          )}
        </td>
        {/* Status pill */}
        <td style={td()}>
          <span style={{
            display:'inline-flex', alignItems:'center', gap:5,
            padding:'4px 10px', borderRadius:20,
            fontSize:12, fontWeight:600,
            background: isInactive ? 'var(--bg-base)' : 'var(--accent-green-light)',
            color: isInactive ? 'var(--text-muted)' : 'var(--accent-green)',
          }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background: isInactive?'var(--text-muted)':'var(--accent-green)', flexShrink:0 }}/>
            {p.status}
          </span>
        </td>
        {/* Status action button */}
        <td style={td()} onClick={e => e.stopPropagation()}>
          <button
            className={`btn btn-sm ${isInactive ? 'btn-outline' : 'btn-ghost'}`}
            style={{
              fontSize:12, padding:'4px 10px',
              color: isInactive ? 'var(--accent-green)' : 'var(--accent-red)',
              borderColor: isInactive ? 'var(--accent-green)' : 'var(--border)',
            }}
            onClick={() => setStatusModal(p)}
            title={isInactive ? 'Reactivate patient' : 'Mark as inactive'}
          >
            {isInactive
              ? <><UserCheck size={12}/> Reactivate</>
              : <><UserX size={12}/> Inactivate</>
            }
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div>
      <p style={{ fontSize:13.5, color:'var(--text-muted)', marginBottom:16 }}>
        {activePatients.length} active · {inactivePatients.length} inactive
      </p>

      <div className="card">
        {/* Toolbar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, gap:12, flexWrap:'wrap' }}>
          <div className="search-bar" style={{ width:280 }}>
            <Search size={14} color="var(--text-muted)"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search your patients..."/>
          </div>
          <div style={{ position:'relative' }}>
            <button className="btn btn-ghost btn-sm" onClick={()=>setShowSort(s=>!s)}>
              <ArrowUpDown size={13}/> Sort: {SORT_OPTIONS.find(s=>s.value===sortBy)?.label}
            </button>
            {showSort && (
              <div style={{ position:'absolute', top:'calc(100% + 4px)', right:0, background:'var(--bg-white)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', boxShadow:'var(--shadow-lg)', zIndex:100, minWidth:200, overflow:'hidden' }}>
                {SORT_OPTIONS.map(opt=>(
                  <button key={opt.value} onClick={()=>{setSortBy(opt.value);setShowSort(false);}}
                    style={{ display:'block', width:'100%', padding:'9px 16px', textAlign:'left', background:sortBy===opt.value?'var(--primary-light)':'transparent', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:13.5, color:sortBy===opt.value?'var(--primary)':'var(--text-primary)', fontWeight:sortBy===opt.value?600:400 }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Active patients table ── */}
        {filterSort(activePatients).length === 0 && search === '' ? (
          <EmptyState title="No active patients" message="Go to Patient History and click Sign to add patients under your care."/>
        ) : (
          <div style={{ overflowX:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'auto' }}>
              <thead>
                <tr style={{ background:'var(--bg-base)' }}>
                  <th style={th()}>Patient</th>
                  <th style={th(68)}>ID</th>
                  <th style={th(95)}>Age / Gender</th>
                  <th style={th(60)}>Blood</th>
                  <th style={th(160)}>Next Appointment</th>
                  <th style={th(88)}>Status</th>
                  <th style={th(110)}></th>
                </tr>
              </thead>
              <tbody>
                {filterSort(activePatients).map(p => <PatientRow key={p.id} p={p}/>)}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Inactive patients — collapsible section ── */}
        {inactivePatients.length > 0 && (
          <div style={{ marginTop:20 }}>
            {/* Toggle header */}
            <button
              onClick={() => setShowInactive(s=>!s)}
              style={{
                display:'flex', alignItems:'center', gap:8, width:'100%',
                padding:'10px 14px', borderRadius:'var(--radius-md)',
                background:'var(--bg-base)', border:'1px solid var(--border)',
                cursor:'pointer', fontFamily:'var(--font-body)',
                fontSize:13.5, fontWeight:600, color:'var(--text-secondary)',
                transition:'var(--transition)',
              }}
              onMouseEnter={e=>e.currentTarget.style.background='#F1F5F9'}
              onMouseLeave={e=>e.currentTarget.style.background='var(--bg-base)'}
            >
              {showInactive ? <ChevronDown size={15}/> : <ChevronRight size={15}/>}
              <UserX size={14} color="var(--text-muted)"/>
              Inactive Patients
              <span style={{ marginLeft:6, background:'var(--bg-base)', border:'1px solid var(--border)', borderRadius:20, padding:'1px 9px', fontSize:12, color:'var(--text-muted)', fontWeight:600 }}>
                {inactivePatients.length}
              </span>
            </button>

            {/* Collapsed table */}
            {showInactive && (
              <div style={{ marginTop:10, border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
                <div style={{ background:'#FEF9EE', padding:'8px 14px', borderBottom:'1px solid var(--border)', fontSize:12.5, color:'var(--accent-orange)', display:'flex', alignItems:'center', gap:7 }}>
                  <UserX size={13}/> These patients are no longer active. Records are fully preserved. You can reactivate anytime.
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'auto' }}>
                  <thead>
                    <tr style={{ background:'var(--bg-base)' }}>
                      <th style={th()}>Patient</th>
                      <th style={th(68)}>ID</th>
                      <th style={th(95)}>Age / Gender</th>
                      <th style={th(60)}>Blood</th>
                      <th style={th(160)}>Next Appointment</th>
                      <th style={th(88)}>Status</th>
                      <th style={th(110)}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterSort(inactivePatients).map(p => <PatientRow key={p.id} p={p} dimmed/>)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status change modal */}
      <ChangeStatusModal
        isOpen={!!statusModal}
        onClose={() => setStatusModal(null)}
        patient={statusModal}
        onConfirm={handleStatusChange}
      />
    </div>
  );
}

const th = (w) => ({
  padding:'10px 12px', textAlign:'left',
  fontSize:11.5, fontWeight:700,
  color:'var(--text-secondary)',
  textTransform:'uppercase', letterSpacing:'0.05em',
  borderBottom:'1px solid var(--border)',
  whiteSpace:'nowrap',
  ...(w ? { width:w } : {}),
});
const td = () => ({
  padding:'11px 12px',
  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
});
