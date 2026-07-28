import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { Download, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, Calendar, Clock, Play, Check, CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import AddAppointmentModal from '../components/appointments/AddAppointmentModal';
import EditAppointmentModal from '../components/appointments/EditAppointmentModal';
import DoctorAvailabilityCalendar from '../components/doctors/DoctorAvailabilityCalendar';
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
  const { appointments, deleteAppointment } = useData();
  const { isDoctor, user } = useAuth();
  const navigate = useNavigate();

  const handleStartAppointment = (appt) => {
    sessionStorage.setItem('active_appt_id', appt.id);
    sessionStorage.setItem('activeAppointmentId', appt.id);
    sessionStorage.setItem('activePatientId', appt.patientId);
    navigate(`/patients/${appt.patientId}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      await deleteAppointment(id);
    }
  };
  const [showAdd, setShowAdd]           = useState(false);
  const [editAppt, setEditAppt]         = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(),'yyyy-MM-dd'));
  const [calMonth, setCalMonth]         = useState(new Date());
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAvailability, setShowAvailability] = useState(false);

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

  // Get all appointments for selected day (before filterStatus and search filter)
  let todayAllAppts = appointments.filter(a => a.date===selectedDate);
  if (isDoctor) todayAllAppts = todayAllAppts.filter(a => a.doctorId===user?.id);

  const stats = {
    total: todayAllAppts.length,
    confirmed: todayAllAppts.filter(a => a.status === 'Confirmed').length,
    pending: todayAllAppts.filter(a => a.status === 'Pending').length,
    completed: todayAllAppts.filter(a => a.status === 'Completed').length,
  };

  let dayAppts = todayAllAppts
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
    const cls = status.toLowerCase();
    return (
      <span className={`appt-status-pill ${cls}`}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
        {status}
      </span>
    );
  };

  return (
    <div className="appts-layout">

      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Appointments</h1>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>Schedule management & calendar</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {isDoctor && (
            <button className="btn btn-primary btn-sm" style={{ backgroundColor: '#2563eb', borderColor: '#2563eb', color: '#fff' }} onClick={() => setShowAvailability(true)}>
              <Calendar size={14}/> My Availability
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={()=>exportAppointmentsPDF(dayAppts,selectedDate)}>
            <Download size={14}/> Download PDF
          </button>
          <button className="btn btn-primary btn-sm" onClick={()=>setShowAdd(true)}>
            <Plus size={14}/> Add Appointment
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="appts-stats-grid">
        <div className="appt-stat-card">
          <div className="appt-stat-icon total">
            <Calendar size={18} />
          </div>
          <div className="appt-stat-info">
            <span className="appt-stat-label">Total Scheduled</span>
            <span className="appt-stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="appt-stat-card">
          <div className="appt-stat-icon confirmed">
            <Check size={18} />
          </div>
          <div className="appt-stat-info">
            <span className="appt-stat-label">Confirmed</span>
            <span className="appt-stat-value">{stats.confirmed}</span>
          </div>
        </div>
        <div className="appt-stat-card">
          <div className="appt-stat-icon pending">
            <Clock size={18} />
          </div>
          <div className="appt-stat-info">
            <span className="appt-stat-label">Pending</span>
            <span className="appt-stat-value">{stats.pending}</span>
          </div>
        </div>
        <div className="appt-stat-card">
          <div className="appt-stat-icon completed">
            <CheckCircle size={18} />
          </div>
          <div className="appt-stat-info">
            <span className="appt-stat-label">Completed</span>
            <span className="appt-stat-value">{stats.completed}</span>
          </div>
        </div>
      </div>

      <div className="appts-main-grid">

        {/* LEFT — appointments */}
        <div className="card" style={{ minWidth:0, padding: '24px 20px' }}>
          <div className="appts-day-header">
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{displayDate}</h3>
              <p style={{ fontSize:12.5, color:'var(--text-muted)', marginTop:2 }}>
                {dayAppts.length} filtered appointment{dayAppts.length!==1?'s':''}
              </p>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <div className="search-bar" style={{ width:160, padding: '5px 12px' }}>
                <Search size={12} color="var(--text-muted)"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."/>
              </div>
              <div className="appts-filter-tabs">
                {['All','Confirmed','Pending','Completed'].map(f=>(
                  <button key={f} onClick={()=>setFilterStatus(f)}
                    className={`appts-filter-btn ${filterStatus===f ? 'active' : ''}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isPastDate(selectedDate) && (
            <div style={{ background:'var(--accent-orange-light)', border:'1px solid #FED7AA', borderRadius:'var(--radius-md)', padding:'9px 14px', fontSize:13, color:'var(--accent-orange)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <Calendar size={14}/> Past date — view only mode. Editing and actions are disabled.
            </div>
          )}

          {dayAppts.length===0 ? (
            <EmptyState title="No appointments" message={`Nothing scheduled for ${displayDate}`}
              action={<button className="btn btn-primary btn-sm" onClick={()=>setShowAdd(true)}><Plus size={13}/> Add</button>}
            />
          ) : (
            <div className="appt-cards-stack">
              {dayAppts.map((a) => {
                // Get initials for avatar
                const initials = a.patientName ? a.patientName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'PT';
                const docInitials = a.doctorName ? a.doctorName.replace('Dr. ', '').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'DR';
                
                return (
                  <div className="appt-row-card" key={a.id}>
                    {/* Color indicator bar */}
                    <div className={`appt-status-indicator ${a.status.toLowerCase()}`} />
                    
                    {/* Time Block */}
                    <div className="appt-time-block">
                      <span className="appt-time-value">{a.time}</span>
                      <span className="appt-time-duration">{a.duration||30} min</span>
                    </div>

                    {/* Patient block */}
                    <div className="appt-info-block patient">
                      <div className="appt-avatar">{initials}</div>
                      <div className="appt-text-details">
                        <span className="appt-name" title={a.patientName}>{a.patientName}</span>
                        <span className="appt-subtext">{a.patientId}</span>
                      </div>
                    </div>

                    {/* Doctor block (only show if current user is not a doctor) */}
                    {!isDoctor && (
                      <div className="appt-info-block doctor">
                        <div className="appt-avatar doctor">{docInitials}</div>
                        <div className="appt-text-details">
                          <span className="appt-name" title={a.doctorName}>{a.doctorName}</span>
                          <span className="appt-subtext" style={{ fontFamily: 'var(--font-body)', letterSpacing: 0 }}>Doctor</span>
                        </div>
                      </div>
                    )}

                    {/* Type badge */}
                    <div className="appt-type-badge-container">
                      <span className="appt-type-badge">{a.type}</span>
                    </div>

                    {/* Status badge */}
                    <div className="appt-status-pill-container">
                      <StatusPill status={a.status} />
                    </div>

                    {/* Action buttons cell */}
                    <div className="appt-actions-cell">
                      {isDoctor && a.status !== 'Completed' && a.status !== 'Cancelled' && a.status !== 'Missed' && !isPastDate(a.date) && (
                        <button
                          className="appt-btn success-start"
                          onClick={() => handleStartAppointment(a)}
                          title="Start appointment session"
                        >
                          <Play size={11} fill="currentColor" style={{ marginRight: 4 }}/> Start
                        </button>
                      )}
                      
                      <button
                        className="appt-btn"
                        onClick={() => !isPastDate(selectedDate) && setEditAppt(a)}
                        disabled={isPastDate(selectedDate)}
                        title={isPastDate(selectedDate) ? 'Cannot edit past appointments' : 'Edit'}
                      >
                        <Edit2 size={12}/>
                      </button>
                      
                      <button
                        className="appt-btn danger"
                        onClick={() => handleDelete(a.id)}
                        title="Delete Appointment"
                      >
                        <Trash2 size={12}/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — mini calendar */}
        <div className="appts-mini-calendar">
          <div className="card" style={{ padding:'16px 14px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <p style={{ fontSize:14, fontWeight:700, color: 'var(--text-primary)' }}>{format(calMonth,'MMMM yyyy')}</p>
              <div style={{ display:'flex', gap:2 }}>
                <button className="btn btn-ghost btn-sm btn-icon" style={{ padding:4, borderRadius: 4 }}
                  onClick={()=>setCalMonth(subMonths(calMonth,1))}><ChevronLeft size={13}/></button>
                <button className="btn btn-ghost btn-sm" style={{ padding:'3px 8px', fontSize:11, borderRadius: 4 }}
                  onClick={()=>{ setCalMonth(new Date()); setSelectedDate(format(new Date(),'yyyy-MM-dd')); }}>
                  Today
                </button>
                <button className="btn btn-ghost btn-sm btn-icon" style={{ padding:4, borderRadius: 4 }}
                  onClick={()=>setCalMonth(addMonths(calMonth,1))}><ChevronRight size={13}/></button>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6 }}>
              {DAYS.map(d=>(
                <div key={d} style={{ textAlign:'center', fontSize:10, fontWeight:700, color:'var(--text-muted)' }}>{d}</div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
              {calDays.map(day => {
                const str      = format(day,'yyyy-MM-dd');
                const count    = getCountForDay(day);
                const isSel    = selectedDate===str;
                const isToday2 = isSameDay(day,new Date());
                const inMonth  = isSameMonth(day,calMonth);
                return (
                  <div key={day.toString()}
                    onClick={() => inMonth && setSelectedDate(str)}
                    className={`cal-day-cell ${isSel ? 'selected' : ''} ${!inMonth ? 'other-month' : ''}`}
                    style={{
                      border: isToday2&&!isSel?'1.5px solid var(--primary)':'1.5px solid transparent',
                    }}
                  >
                    <span style={{ fontSize:11.5, fontWeight:isSel||isToday2?700:500, color:isSel?'#fff':isToday2?'var(--primary)':'var(--text-primary)', lineHeight: 1 }}>
                      {format(day,'d')}
                    </span>
                    {count>0&&inMonth && (
                      <div className="cal-day-dot" />
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:6 }}>
              {[{c:'var(--accent-green)',l:'Has appointments'},{c:'var(--primary)',l:'Selected / Today'}].map(x=>(
                <div key={x.l} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:x.c }}/>
                  <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight: 500 }}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <AddAppointmentModal isOpen={showAdd} onClose={()=>setShowAdd(false)} prefillDate={selectedDate}/>
      {editAppt && <EditAppointmentModal appointment={editAppt} onClose={()=>setEditAppt(null)}/>}
      {showAvailability && <DoctorAvailabilityCalendar doctorId={user?.id} doctorName={user?.name} onClose={() => setShowAvailability(false)} />}
    </div>
  );
}
