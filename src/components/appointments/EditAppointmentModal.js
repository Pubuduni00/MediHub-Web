import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const TYPES = ['Consultation','Follow-up','Review','Emergency','Procedure','Lab Visit'];

export default function EditAppointmentModal({ appointment, onClose }) {
  const { updateAppointment, deleteAppointment } = useData();
  const { isDoctor } = useAuth();
  const [form, setForm] = useState({ ...appointment });
  const [saved, setSaved] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (form.doctorId && form.date) {
      fetchSlots(form.doctorId, form.date);
    } else {
      setAvailableSlots([]);
    }
  }, [form.doctorId, form.date]);

  const fetchSlots = async (docId, dateStr) => {
    try {
      setLoadingSlots(true);
      const res = await fetch(`http://localhost:5000/api/doctors/${docId}/availability?date=${dateStr}`);
      const data = await res.json();
      
      // Filter out slots that are booked, EXCEPT the currently booked slot of this appointment (if the date is the same)
      let slots = data.filter(s => !s.isBooked || (dateStr === appointment.date && s.time === appointment.time));
      
      // Filter out past slots if the selected date is today, EXCEPT if the slot is the current slot time
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      if (dateStr === todayStr) {
        const now = new Date();
        const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        slots = slots.filter(s => s.time > currentTimeStr || (dateStr === appointment.date && s.time === appointment.time));
      }
      
      // Ensure the current slot itself is in the list, even if it is not in the database availability slots at all!
      if (dateStr === appointment.date && !slots.some(s => s.time === appointment.time)) {
        slots.push({ id: 'current', time: appointment.time, isBooked: true });
      }
      
      // Sort slots chronologically
      slots.sort((a, b) => a.time.localeCompare(b.time));
      
      setAvailableSlots(slots);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSlots(false);
    }
  };

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSave = async () => {
    // Update appointment in context and DB
    await updateAppointment(appointment.id, form);
    setSaved(true);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      const success = await deleteAppointment(appointment.id);
      if (success) {
        setDeleted(true);
      } else {
        alert("Failed to delete appointment");
      }
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Edit Appointment"
      size="md"
      footer={
        saved || deleted ? (
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div>
              {isDoctor && (
                <button 
                  className="btn" 
                  style={{ 
                    background: '#fee2e2', 
                    color: '#ef4444', 
                    border: '1px solid #fca5a5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }} 
                  onClick={handleDelete}
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}><Edit2 size={14}/> Save Changes</button>
            </div>
          </div>
        )
      }
    >
      {deleted ? (
        <div style={{textAlign:'center',padding:'28px 0'}}>
          <div style={{width:56,height:56,borderRadius:'50%',background:'#fee2e2',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
            <Trash2 size={24} color="#ef4444"/>
          </div>
          <h3 style={{fontSize:16,marginBottom:6}}>Appointment Deleted</h3>
          <p style={{color:'var(--text-muted)',fontSize:13.5}}>The appointment has been successfully deleted.</p>
        </div>
      ) : saved ? (
        <div style={{textAlign:'center',padding:'28px 0'}}>
          <div style={{width:56,height:56,borderRadius:'50%',background:'var(--accent-green-light)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
            <Edit2 size={24} color="var(--accent-green)"/>
          </div>
          <h3 style={{fontSize:16,marginBottom:6}}>Appointment Updated</h3>
          <p style={{color:'var(--text-muted)',fontSize:13.5}}>Changes saved successfully.</p>
        </div>
      ) : (
        <div>
          <div style={{background:'var(--bg-base)',borderRadius:'var(--radius-md)',padding:'10px 14px',marginBottom:16,fontSize:13,color:'var(--text-secondary)'}}>
            Editing: <strong>{appointment.patientName}</strong> · {appointment.date}
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-control" value={form.date} onChange={e=>set('date',e.target.value)}/>
            </div>
             <div className="form-group">
              <label className="form-label">Time {loadingSlots && <span style={{fontSize:11}}>(Loading...)</span>}</label>
              <select className="form-control" value={form.time} onChange={e=>set('time',e.target.value)} disabled={loadingSlots}>
                <option value="">— Select slot —</option>
                {availableSlots.map(s => <option key={s.id || s.time} value={s.time}>{s.time}</option>)}
              </select>
              {(!loadingSlots && availableSlots.length === 0) && <p style={{color:'var(--accent-red)',fontSize:11,marginTop:3}}>No free slots available</p>}
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-control" value={form.type} onChange={e=>set('type',e.target.value)}>
                {TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e=>set('status',e.target.value)}>
                <option>Pending</option><option>Cancelled</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Duration (minutes)</label>
            <select className="form-control" value={form.duration} onChange={e=>set('duration',Number(e.target.value))}>
              {[15,20,30,45,60,90].map(d=><option key={d} value={d}>{d} min</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Details / Notes</label>
            <textarea className="form-control" rows={2} value={form.details||''} onChange={e=>set('details',e.target.value)}/>
          </div>
        </div>
      )}
    </Modal>
  );
}
