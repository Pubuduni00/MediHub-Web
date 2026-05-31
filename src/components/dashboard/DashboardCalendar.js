import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import CalendarDayPopup from './CalendarDayPopup';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DashboardCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const { appointments } = useData();
  const { user, isDoctor } = useAuth();
  const calendarRef = useRef(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getApptsForDay = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    let appts = appointments.filter(a => a.date === dateStr);
    if (isDoctor) appts = appts.filter(a => a.doctorId === user?.id);
    return appts;
  };

  const handleDayClick = (day, e) => {
    const appts = getApptsForDay(day);
    if (appts.length === 0) { setSelectedDate(null); return; }

    // Position popup relative to clicked cell
    const rect = e.currentTarget.getBoundingClientRect();
    const calRect = calendarRef.current.getBoundingClientRect();
    const top = rect.bottom - calRect.top + 4;
    let left = rect.left - calRect.left;
    // Prevent popup going off right edge
    if (left + 290 > calRect.width) left = calRect.width - 290;

    setPopupPos({ top, left });
    setSelectedDate(format(day, 'yyyy-MM-dd'));
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) setSelectedDate(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedAppts = selectedDate ? getApptsForDay(new Date(selectedDate + 'T00:00:00')) : [];

  return (
    <div className="card" ref={calendarRef} style={{ position: 'relative' }}>
      {/* Header */}
      <div className="card-header">
        <h3 className="card-title">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft size={15} />
          </button>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setCurrentMonth(new Date())}>
            Today
          </button>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0', letterSpacing: '0.05em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {days.map(day => {
          const appts = getApptsForDay(day);
          const isToday = isSameDay(day, new Date());
          const inMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate === format(day, 'yyyy-MM-dd');
          const hasAppts = appts.length > 0;

          return (
            <div
              key={day.toString()}
              onClick={(e) => inMonth && handleDayClick(day, e)}
              style={{
                aspectRatio: '1',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                borderRadius: 8,
                cursor: inMonth && hasAppts ? 'pointer' : 'default',
                background: isSelected
                  ? 'var(--primary)'
                  : isToday
                    ? 'var(--primary-light)'
                    : hasAppts && inMonth
                      ? 'var(--accent-green-light)'
                      : 'transparent',
                border: isToday && !isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'var(--transition)',
                opacity: inMonth ? 1 : 0.3,
                position: 'relative',
                minHeight: 36,
              }}
              onMouseEnter={e => { if (inMonth && hasAppts && !isSelected) e.currentTarget.style.background = 'var(--primary-light)'; }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.background = isToday ? 'var(--primary-light)' : hasAppts && inMonth ? 'var(--accent-green-light)' : 'transparent';
                }
              }}
            >
              <span style={{
                fontSize: 12, fontWeight: isToday || isSelected ? 700 : 400,
                color: isSelected ? '#fff' : isToday ? 'var(--primary)' : inMonth ? 'var(--text-primary)' : 'var(--text-muted)'
              }}>
                {format(day, 'd')}
              </span>
              {hasAppts && inMonth && (
                <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                  {appts.slice(0, 3).map((_, i) => (
                    <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? '#fff' : 'var(--accent-green)' }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Popup */}
      {selectedDate && (
        <div style={{ position: 'absolute', top: popupPos.top, left: popupPos.left, zIndex: 200 }}>
          <CalendarDayPopup
            date={selectedDate}
            appointments={selectedAppts}
            onClose={() => setSelectedDate(null)}
          />
        </div>
      )}
    </div>
  );
}
