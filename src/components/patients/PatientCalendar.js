import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { useData } from '../../context/DataContext';
import LogViewPopup from './LogViewPopup';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function PatientCalendar({ patientId }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const { getLogsForDate, getLogsForPatient } = useData();

  const allLogs = getLogsForPatient(patientId);
  const logDates = new Set(allLogs.map(l => l.date));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });

  const handleDayClick = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    if (logDates.has(dateStr)) setSelectedDate(dateStr);
  };

  const selectedLogs = selectedDate ? getLogsForDate(patientId, selectedDate) : [];

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>{format(currentMonth,'MMMM yyyy')}</p>
        <div style={{ display:'flex', gap:4 }}>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>setCurrentMonth(subMonths(currentMonth,1))}><ChevronLeft size={14}/></button>
          <button className="btn btn-ghost btn-sm" onClick={()=>setCurrentMonth(new Date())}>Today</button>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>setCurrentMonth(addMonths(currentMonth,1))}><ChevronRight size={14}/></button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:12, height:12, borderRadius:3, background:'var(--accent-green)' }}/>
          <span style={{ fontSize:11.5, color:'var(--text-muted)' }}>Visit / Log entry</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:12, height:12, borderRadius:3, background:'var(--primary)' }}/>
          <span style={{ fontSize:11.5, color:'var(--text-muted)' }}>Today</span>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:4 }}>
        {DAYS.map(d=>(
          <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:'var(--text-muted)', padding:'3px 0', letterSpacing:'0.05em' }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {days.map(day => {
          const dateStr = format(day,'yyyy-MM-dd');
          const hasLog = logDates.has(dateStr);
          const isToday = isSameDay(day,new Date());
          const inMonth = isSameMonth(day,currentMonth);
          const isSelected = selectedDate === dateStr;

          return (
            <div
              key={day.toString()}
              onClick={()=>inMonth && handleDayClick(day)}
              style={{
                aspectRatio:'1', display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
                borderRadius:6,
                cursor: inMonth && hasLog ? 'pointer' : 'default',
                background: isSelected ? 'var(--primary)'
                  : hasLog && inMonth ? 'var(--accent-green)'
                  : isToday ? 'var(--primary-light)'
                  : 'transparent',
                border: isToday && !isSelected && !hasLog ? '1.5px solid var(--primary)' : '1.5px solid transparent',
                opacity: inMonth ? 1 : 0.25,
                transition:'var(--transition)',
                minHeight:32,
              }}
              onMouseEnter={e=>{ if(inMonth&&hasLog&&!isSelected) e.currentTarget.style.opacity='0.8'; }}
              onMouseLeave={e=>{ e.currentTarget.style.opacity = inMonth?'1':'0.25'; }}
            >
              <span style={{
                fontSize:12,
                fontWeight: isToday || hasLog ? 700 : 400,
                color: isSelected || (hasLog&&inMonth) ? '#fff' : isToday ? 'var(--primary)' : 'var(--text-primary)'
              }}>
                {format(day,'d')}
              </span>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize:11.5, color:'var(--text-muted)', marginTop:10, textAlign:'center' }}>
        Click a green square to view that day's log
      </p>

      {/* Log Popup */}
      {selectedDate && selectedLogs.length > 0 && (
        <LogViewPopup
          logs={selectedLogs}
          date={selectedDate}
          onClose={()=>setSelectedDate(null)}
        />
      )}
    </div>
  );
}
