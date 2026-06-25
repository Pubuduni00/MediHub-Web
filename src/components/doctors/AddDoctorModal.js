import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { Stethoscope } from 'lucide-react';

const EMPTY = { name:'', email:'', specialty:'General Medicine', department:'', phone:'', qualification:'', schedule:'Mon-Fri, 8AM-4PM', status:'Active' };
const SPECIALTIES = ['General Medicine','Cardiology','Neurology','Orthopedics','Pediatrics','Gynecology','Dermatology','Psychiatry','Oncology','Radiology','ENT','Ophthalmology','Urology','Endocrinology','Gastroenterology'];

export default function AddDoctorModal({ isOpen, onClose }) {
  const { addDoctor } = useData();
  const [form, setForm] = useState({ ...EMPTY });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(null);

  const set = (f,v) => { setForm(p=>({...p,[f]:v})); setErrors(e=>({...e,[f]:''})); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.department.trim()) e.department = 'Department is required';
    return e;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const doc = await addDoctor({ ...form, joinDate: new Date().toISOString().split('T')[0] });
    setSaved(doc);
    setForm({ ...EMPTY });
  };

  const handleClose = () => { setSaved(null); setForm({...EMPTY}); setErrors({}); onClose(); };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Doctor"
      size="lg"
      footer={
        saved ? (
          <button className="btn btn-primary" onClick={handleClose}>Done</button>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}><Stethoscope size={14}/> Add Doctor</button>
          </>
        )
      }
    >
      {saved ? (
        <div style={{ textAlign:'center', padding:'28px 0' }}>
          <div style={{ width:60, height:60, borderRadius:'50%', background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
            <Stethoscope size={28} color="var(--primary)"/>
          </div>
          <h3 style={{ fontSize:17, marginBottom:6 }}>Doctor Added Successfully!</h3>
          <p style={{ color:'var(--text-muted)', fontSize:13.5 }}>
            <strong>{saved.name}</strong> has been registered with Employee ID{' '}
            <span style={{ color:'var(--primary)', fontWeight:700, fontFamily:'monospace' }}>{saved.id}</span>
          </p>
          <p style={{ color:'var(--text-muted)', fontSize:12.5, marginTop:8 }}>An invitation email will be sent to {saved.email} once the backend is configured.</p>
        </div>
      ) : (
        <div>
          <p className="section-label" style={{ marginBottom:12 }}>Professional Information</p>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className={`form-control ${errors.name?'border-danger':''}`} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Dr. Amara Patel" />
              {errors.name&&<p style={{ color:'var(--accent-red)',fontSize:11.5,marginTop:3 }}>{errors.name}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" className={`form-control ${errors.email?'border-danger':''}`} value={form.email} onChange={e=>set('email',e.target.value)} placeholder="doctor@medihub.com" />
              {errors.email&&<p style={{ color:'var(--accent-red)',fontSize:11.5,marginTop:3 }}>{errors.email}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Specialty</label>
              <select className="form-control" value={form.specialty} onChange={e=>set('specialty',e.target.value)}>
                {SPECIALTIES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <input className={`form-control ${errors.department?'border-danger':''}`} value={form.department} onChange={e=>set('department',e.target.value)} placeholder="e.g. Cardiology" />
              {errors.department&&<p style={{ color:'var(--accent-red)',fontSize:11.5,marginTop:3 }}>{errors.department}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="011XXXXXXX" />
            </div>
            <div className="form-group">
              <label className="form-label">Qualification</label>
              <input className="form-control" value={form.qualification} onChange={e=>set('qualification',e.target.value)} placeholder="e.g. MBBS, MD" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Working Schedule</label>
            <input className="form-control" value={form.schedule} onChange={e=>set('schedule',e.target.value)} placeholder="e.g. Mon-Fri, 8AM-4PM" />
          </div>
        </div>
      )}
    </Modal>
  );
}
