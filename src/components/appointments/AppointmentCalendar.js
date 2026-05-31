import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import CalendarDayPopup from '../dashboard/CalendarDayPopup';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function AppointmentCalendar({ onAddAppointment }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [popupCell, setPopupCell] = useState(null);
  const { appointments } = useData();
  const { user, isDoctor } = useAuth();

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const getAppts = (day) => {
    const str = format(day, 'yyyy-MM-dd');
    let list = appointments.filter(a => a.date === str);
    if (isDoctor) list = list.filter(a => a.doctorId === user?.id);
    return list;
  };

  const handleDayClick = (day, e) => {
    const str = format(day, 'yyyy-MM-dd');
    const appts = getAppts(day);
    if (appts.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      setPopupCell({ date: str, appts, top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    } else {
      setPopupCell(null);
      onAddAppointment && onAddAppointment(str);
    }
    setSelectedDate(str);
  };

  return (
    <div className="card" style={{ position:'relative' }}>
      {/* Header */}
      <div className="card-header">
        <h3 className="card-title">{format(currentMonth,'MMMM yyyy')}</h3>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>setCurrentMonth(subMonths(currentMonth,1))}><ChevronLeft size={15}/></button>
          <button className="btn btn-ghost btn-sm" onClick={()=>setCurrentMonth(new Date())}>Today</button>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>setCurrentMonth(addMonths(currentMonth,1))}><ChevronRight size={15}/></button>
          <div style={{ width:1, height:24, background:'var(--border)' }}/>
          <button className="btn btn-primary btn-sm" onClick={()=>onAddAppointment&&onAddAppointment(format(new Date(),'yyyy-MM-dd'))}>
            <Plus size={13}/> Add Appointment
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6 }}>
        {DAYS.map(d=>(
          <div key={d} style={{ textAlign:'center', fontSize:11.5, fontWeight:700, color:'var(--text-muted)', padding:'4px 0', letterSpacing:'0.05em' }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
        {days.map(day => {
          const appts = getAppts(day);
          const isToday = isSameDay(day, new Date());
          const inMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate === format(day,'yyyy-MM-dd');
          const hasAppts = appts.length > 0;

          return (
            <div
              key={day.toString()}
              onClick={(e)=>inMonth && handleDayClick(day,e)}
              style={{
                minHeight:70, padding:'6px 6px',
                borderRadius:'var(--radius-md)',
                border: isToday ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: isSelected ? 'var(--primary-light)' : isToday ? '#F0F7FF' : 'var(--bg-white)',
                cursor: inMonth ? 'pointer' : 'default',
                opacity: inMonth ? 1 : 0.35,
                transition:'var(--transition)',
                display:'flex', flexDirection:'column',
              }}
              onMouseEnter={e=>{ if(inMonth) e.currentTarget.style.background='var(--primary-light)'; }}
              onMouseLeave={e=>{ if(!isSelected&&!isToday) e.currentTarget.style.background='var(--bg-white)'; else if(isToday&&!isSelected) e.currentTarget.style.background='#F0F7FF'; }}
            >
              <span style={{
                fontSize:12.5, fontWeight: isToday ? 700 : 400,
                color: isToday ? 'var(--primary)' : 'var(--text-primary)',
                marginBottom:3
              }}>{format(day,'d')}</span>
              <div style={{ display:'flex', flexDirection:'column', gap:2, flex:1, overflow:'hidden' }}>
                {appts.slice(0,3).map(a=>(
                  <div key={a.id} style={{
                    fontSize:10, padding:'1px 5px',
                    borderRadius:4,
                    background: a.status==='Confirmed' ? 'var(--accent-green)' : 'var(--accent-orange)',
                    color:'#fff', fontWeight:600,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
                  }}>
                    {a.time} {a.patientName.split(' ')[0]}
                  </div>
                ))}
                {appts.length > 3 && (
                  <span style={{ fontSize:10, color:'var(--text-muted)', paddingLeft:4 }}>+{appts.length-3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Popup */}
      {popupCell && (
        <div style={{ position:'fixed', top: popupCell.top, left: popupCell.left, zIndex:300 }}>
          <CalendarDayPopup
            date={popupCell.date}
            appointments={popupCell.appts}
            onClose={()=>{ setPopupCell(null); setSelectedDate(null); }}
          />
        </div>
      )}
    </div>
  );
}
