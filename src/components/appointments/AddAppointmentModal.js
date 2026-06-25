import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Calendar } from 'lucide-react';

const EMPTY = { patientId:'', doctorId:'', date:'', time:'', type:'Consultation', details:'', duration:30 };
const TYPES = ['Consultation','Follow-up','Review','Emergency','Procedure','Lab Visit'];

export default function AddAppointmentModal({ isOpen, onClose, prefillDate='' }) {
  const { patients, doctors, addAppointment } = useData();
  const { user, isDoctor } = useAuth();
  const [form, setForm] = useState({ ...EMPTY, date: prefillDate, doctorId: isDoctor ? user?.id : '' });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const set = (f,v) => { setForm(p=>({...p,[f]:v})); setErrors(e=>({...e,[f]:''})); };

  const validate = () => {
    const e = {};
    if (!form.patientId) e.patientId = 'Select a patient';
    if (!form.doctorId) e.doctorId = 'Select a doctor';
    if (!form.date) e.date = 'Select a date';
    if (!form.time) e.time = 'Select a time';
    return e;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const patient = patients.find(p=>p.id===form.patientId);
    const doctor = doctors.find(d=>d.id===form.doctorId) || { name: user?.name };
    await addAppointment({ ...form, patientName: patient?.name||'', doctorName: doctor?.name||'', status:'Confirmed' });
    setSaved(true);
  };

  const handleClose = () => { setSaved(false); setForm({...EMPTY, date:prefillDate, doctorId: isDoctor ? user?.id : ''}); setErrors({}); onClose(); };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Appointment"
      size="md"
      footer={
        saved
          ? <button className="btn btn-primary" onClick={handleClose}>Done</button>
          : <><button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
             <button className="btn btn-primary" onClick={handleSave}><Calendar size={14}/> Confirm Appointment</button></>
      }
    >
      {saved ? (
        <div style={{textAlign:'center',padding:'28px 0'}}>
          <div style={{width:60,height:60,borderRadius:'50%',background:'var(--accent-green-light)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
            <Calendar size={28} color="var(--accent-green)"/>
          </div>
          <h3 style={{fontSize:17,marginBottom:6}}>Appointment Confirmed!</h3>
          <p style={{color:'var(--text-muted)',fontSize:13.5}}>The appointment has been scheduled.</p>
        </div>
      ) : (
        <div>
          <div className="form-group">
            <label className="form-label">Patient *</label>
            <select className={`form-control ${errors.patientId?'border-danger':''}`} value={form.patientId} onChange={e=>set('patientId',e.target.value)}>
              <option value="">— Select patient —</option>
              {patients.filter(p=>p.status==='Active').map(p=><option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
            </select>
            {errors.patientId&&<p style={{color:'var(--accent-red)',fontSize:11.5,marginTop:3}}>{errors.patientId}</p>}
          </div>

          {/* Only show doctor dropdown for staff */}
          {!isDoctor && (
            <div className="form-group">
              <label className="form-label">Doctor *</label>
              <select className={`form-control ${errors.doctorId?'border-danger':''}`} value={form.doctorId} onChange={e=>set('doctorId',e.target.value)}>
                <option value="">— Select doctor —</option>
                {doctors.map(d=><option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
              </select>
              {errors.doctorId&&<p style={{color:'var(--accent-red)',fontSize:11.5,marginTop:3}}>{errors.doctorId}</p>}
            </div>
          )}
          {isDoctor && (
            <div className="form-group">
              <label className="form-label">Doctor</label>
              <input className="form-control" value={user?.name||''} disabled style={{background:'var(--bg-base)',cursor:'not-allowed'}}/>
            </div>
          )}

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className={`form-control ${errors.date?'border-danger':''}`} value={form.date} onChange={e=>set('date',e.target.value)}/>
              {errors.date&&<p style={{color:'var(--accent-red)',fontSize:11.5,marginTop:3}}>{errors.date}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Time *</label>
              <input type="time" className={`form-control ${errors.time?'border-danger':''}`} value={form.time} onChange={e=>set('time',e.target.value)}/>
              {errors.time&&<p style={{color:'var(--accent-red)',fontSize:11.5,marginTop:3}}>{errors.time}</p>}
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
              <label className="form-label">Duration (minutes)</label>
              <select className="form-control" value={form.duration} onChange={e=>set('duration',Number(e.target.value))}>
                {[15,20,30,45,60,90].map(d=><option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Details / Notes</label>
            <textarea className="form-control" rows={2} value={form.details} onChange={e=>set('details',e.target.value)} placeholder="Reason for visit..."/>
          </div>
        </div>
      )}
    </Modal>
  );
}
