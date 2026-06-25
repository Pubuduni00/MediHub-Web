import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { Edit2 } from 'lucide-react';

const TYPES = ['Consultation','Follow-up','Review','Emergency','Procedure','Lab Visit'];

export default function EditAppointmentModal({ appointment, onClose }) {
  const { setAppointments, appointments } = useData();
  const [form, setForm] = useState({ ...appointment });
  const [saved, setSaved] = useState(false);

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSave = () => {
    // Update appointment in context
    const updated = appointments.map(a => a.id === appointment.id ? { ...a, ...form } : a);
    setAppointments(updated);
    setSaved(true);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Edit Appointment"
      size="md"
      footer={
        saved ? (
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}><Edit2 size={14}/> Save Changes</button>
          </>
        )
      }
    >
      {saved ? (
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
              <label className="form-label">Time</label>
              <input type="time" className="form-control" value={form.time} onChange={e=>set('time',e.target.value)}/>
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
                <option>Confirmed</option><option>Pending</option><option>Cancelled</option>
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
