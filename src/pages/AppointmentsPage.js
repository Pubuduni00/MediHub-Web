import React, { useState } from 'react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { Download, Plus, Edit2, Search, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import AddAppointmentModal from '../components/appointments/AddAppointmentModal';
import EditAppointmentModal from '../components/appointments/EditAppointmentModal';
import { exportAppointmentsPDF } from '../components/appointments/AppointmentPDFExport';
import EmptyState from '../components/common/EmptyState';
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, startOfWeek, endOfWeek,
  addMonths, subMonths
} from 'date-fns';
import './AppointmentsPage.css';

const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export default function AppointmentsPage() {
  const { appointments } = useData();
  const { isDoctor, user } = useAuth();
  const [showAdd, setShowAdd]           = useState(false);
  const [editAppt, setEditAppt]         = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(),'yyyy-MM-dd'));
  const [calMonth, setCalMonth]         = useState(new Date());
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const calDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(calMonth)),
    end:   endOfWeek(endOfMonth(calMonth)),
  });

  const getCountForDay = (day) => {
    const str = format(day,'yyyy-MM-dd');
    let list = appointments.filter(a => a.date===str);
    if (isDoctor) list = list.filter(a => a.doctorId===user?.id);
    return list.length;
  };

  let dayAppts = appointments.filter(a => a.date===selectedDate);
  if (isDoctor) dayAppts = dayAppts.filter(a => a.doctorId===user?.id);
  dayAppts = dayAppts
    .filter(a => {
      const q = search.toLowerCase();
      return (
        a.patientName.toLowerCase().includes(q) ||
        a.patientId.toLowerCase().includes(q) ||
        (a.doctorName||'').toLowerCase().includes(q)
      ) && (filterStatus==='All' || a.status===filterStatus);
    })
    .sort((a,b) => a.time.localeCompare(b.time));

  const isPastDate = (d) => { const dt=parseISO(d); return isPast(dt)&&!isToday(dt); };
  const displayDate = selectedDate ? format(parseISO(selectedDate),'EEEE, dd MMMM yyyy') : '';

  const StatusPill = ({ status }) => {
    const cls = status==='Confirmed' ? 'confirmed' : status==='Pending' ? 'pending' : 'cancelled';
    return (
      <span className={`appts-status-pill ${cls}`}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:'currentColor', flexShrink:0 }}/>
        {status}
      </span>
    );
  };

  return (
    <div className="appts-layout">

      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <p style={{ fontSize:13.5, color:'var(--text-muted)' }}>Schedule management & calendar</p>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost btn-sm" onClick={()=>exportAppointmentsPDF(dayAppts,selectedDate)}>
            <Download size={14}/> Download PDF
          </button>
          <button className="btn btn-primary btn-sm" onClick={()=>setShowAdd(true)}>
            <Plus size={14}/> Add Appointment
          </button>
        </div>
      </div>

      <div className="appts-main-grid">

        {/* LEFT — appointments */}
        <div className="card" style={{ minWidth:0, overflow:'hidden' }}>
          <div className="appts-day-header">
            <div>
              <h3 style={{ fontSize:15, fontWeight:700 }}>{displayDate}</h3>
              <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                {dayAppts.length} appointment{dayAppts.length!==1?'s':''}
              </p>
            </div>
            <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
              <div className="search-bar" style={{ width:160 }}>
                <Search size={12} color="var(--text-muted)"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."/>
              </div>
              {['All','Confirmed','Pending'].map(f=>(
                <button key={f} onClick={()=>setFilterStatus(f)}
                  className={`btn btn-sm ${filterStatus===f?'btn-primary':'btn-ghost'}`}
                  style={{ padding:'5px 10px', fontSize:12 }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {isPastDate(selectedDate) && (
            <div style={{ background:'var(--accent-orange-light)', border:'1px solid #FED7AA', borderRadius:'var(--radius-md)', padding:'7px 12px', fontSize:12.5, color:'var(--accent-orange)', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
              <Calendar size={13}/> Past date — view only, editing disabled.
            </div>
          )}

          {dayAppts.length===0 ? (
            <EmptyState title="No appointments" message={`Nothing scheduled for ${displayDate}`}
              action={<button className="btn btn-primary btn-sm" onClick={()=>setShowAdd(true)}><Plus size={13}/> Add</button>}
            />
          ) : (
            <div className="appts-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>ID</th>
                    {!isDoctor && <th>Doctor</th>}
                    <th>Type</th>
                    <th>Dur.</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {dayAppts.map((a,i) => (
                    <tr key={a.id}>
                      <td style={{ color:'var(--text-muted)', fontSize:12, width:28 }}>{i+1}</td>
                      <td style={{ width:58 }}>
                        <span style={{ fontWeight:700, color:'var(--primary)', fontSize:13 }}>{a.time}</span>
                      </td>
                      <td className="col-patient" style={{ fontWeight:600 }}>{a.patientName}</td>
                      <td style={{ width:62 }}>
                        <span style={{ fontFamily:'monospace', fontSize:11.5, color:'var(--primary)', background:'var(--primary-light)', padding:'2px 6px', borderRadius:3 }}>
                          {a.patientId}
                        </span>
                      </td>
                      {!isDoctor && (
                        <td style={{ fontSize:12.5, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis' }}>
                          {a.doctorName}
                        </td>
                      )}
                      <td style={{ width:82 }}>
                        <span style={{ background:'var(--primary-light)', color:'var(--primary)', padding:'3px 8px', borderRadius:12, fontSize:11.5, fontWeight:600, whiteSpace:'nowrap' }}>
                          {a.type}
                        </span>
                      </td>
                      <td style={{ width:40, color:'var(--text-muted)', fontSize:12 }}>{a.duration||30}m</td>
                      <td style={{ width:108 }}><StatusPill status={a.status}/></td>
                      <td style={{ width:44 }}>
                        <button
                          className="appts-edit-btn"
                          onClick={() => !isPastDate(selectedDate) && setEditAppt(a)}
                          disabled={isPastDate(selectedDate)}
                          title={isPastDate(selectedDate) ? 'Cannot edit past appointments' : 'Edit'}
                        >
                          <Edit2 size={12}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT — mini calendar */}
        <div className="appts-mini-calendar">
          <div className="card" style={{ padding:'14px 12px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <p style={{ fontSize:13, fontWeight:700 }}>{format(calMonth,'MMM yyyy')}</p>
              <div style={{ display:'flex', gap:2 }}>
                <button className="btn btn-ghost btn-sm btn-icon" style={{ padding:4 }}
                  onClick={()=>setCalMonth(subMonths(calMonth,1))}><ChevronLeft size={13}/></button>
                <button className="btn btn-ghost btn-sm" style={{ padding:'3px 7px', fontSize:11 }}
                  onClick={()=>{ setCalMonth(new Date()); setSelectedDate(format(new Date(),'yyyy-MM-dd')); }}>
                  Today
                </button>
                <button className="btn btn-ghost btn-sm btn-icon" style={{ padding:4 }}
                  onClick={()=>setCalMonth(addMonths(calMonth,1))}><ChevronRight size={13}/></button>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:4 }}>
              {DAYS.map(d=>(
                <div key={d} style={{ textAlign:'center', fontSize:9.5, fontWeight:700, color:'var(--text-muted)' }}>{d}</div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1 }}>
              {calDays.map(day => {
                const str      = format(day,'yyyy-MM-dd');
                const count    = getCountForDay(day);
                const isSel    = selectedDate===str;
                const isToday2 = isSameDay(day,new Date());
                const inMonth  = isSameMonth(day,calMonth);
                return (
                  <div key={day.toString()}
                    onClick={() => inMonth && setSelectedDate(str)}
                    style={{
                      aspectRatio:'1', display:'flex', flexDirection:'column',
                      alignItems:'center', justifyContent:'center', borderRadius:5,
                      cursor: inMonth?'pointer':'default',
                      background: isSel?'var(--primary)':isToday2?'var(--primary-light)':'transparent',
                      border: isToday2&&!isSel?'1.5px solid var(--primary)':'1.5px solid transparent',
                      opacity: inMonth?1:0.2, transition:'var(--transition)', minHeight:26,
                    }}
                    onMouseEnter={e=>{ if(inMonth&&!isSel) e.currentTarget.style.background='var(--primary-light)'; }}
                    onMouseLeave={e=>{ if(!isSel) e.currentTarget.style.background=isToday2?'var(--primary-light)':'transparent'; }}
                  >
                    <span style={{ fontSize:11, fontWeight:isSel||isToday2?700:400, color:isSel?'#fff':isToday2?'var(--primary)':'var(--text-primary)', lineHeight:1 }}>
                      {format(day,'d')}
                    </span>
                    {count>0&&inMonth && (
                      <div style={{ width:4, height:4, borderRadius:'50%', background:isSel?'rgba(255,255,255,0.8)':'var(--accent-green)', marginTop:1 }}/>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:5 }}>
              {[{c:'var(--accent-green)',l:'Has appointments'},{c:'var(--primary)',l:'Selected / Today'}].map(x=>(
                <div key={x.l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:x.c }}/>
                  <span style={{ fontSize:10.5, color:'var(--text-muted)' }}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <AddAppointmentModal isOpen={showAdd} onClose={()=>setShowAdd(false)} prefillDate={selectedDate}/>
      {editAppt && <EditAppointmentModal appointment={editAppt} onClose={()=>setEditAppt(null)}/>}
    </div>
  );
}
