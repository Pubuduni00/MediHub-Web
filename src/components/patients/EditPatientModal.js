import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { Edit3 } from 'lucide-react';

export default function EditPatientModal({ isOpen, onClose, patient }) {
  const { updatePatient } = useData();
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (patient) {
      setForm({ ...patient });
    }
  }, [patient]);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const calcAge = (dob) => {
    if (!dob) return '';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000*60*60*24*365.25));
  };

  const validate = () => {
    const e = {};
    if (!form.name || !form.name.trim()) e.name = 'Full name is required';
    if (!form.dob) e.dob = 'Date of birth is required';
    if (!form.phone || !form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.nic || !form.nic.trim()) e.nic = 'NIC is required';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const age = calcAge(form.dob);
    await updatePatient(patient.id, { ...form, age });
    setSuccess(true);
  };

  const handleClose = () => { setSuccess(false); setErrors({}); onClose(); };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Patient Details"
      size="lg"
      footer={
        success ? (
          <button className="btn btn-primary" onClick={handleClose}>Done</button>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              <Edit3 size={15}/> Save Changes
            </button>
          </>
        )
      }
    >
      {success ? (
        <div style={{ textAlign:'center', padding:'24px 0' }}>
          <div style={{ width:60, height:60, borderRadius:'50%', background:'var(--accent-green-light)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <Edit3 size={28} color="var(--accent-green)" />
          </div>
          <h3 style={{ fontSize:17, marginBottom:6 }}>Patient Details Updated Successfully!</h3>
          <p style={{ color:'var(--text-muted)', fontSize:13.5 }}>
            Changes for <strong>{patient.name}</strong> have been saved in the system.
          </p>
        </div>
      ) : (
        <div>
          {/* Personal Info */}
          <p className="section-label" style={{ marginBottom:12 }}>Personal Information</p>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className={`form-control ${errors.name?'border-danger':''}`} value={form.name || ''} onChange={e=>set('name',e.target.value)} placeholder="e.g. Rohan Fernando" />
              {errors.name && <p style={{ color:'var(--accent-red)', fontSize:11.5, marginTop:3 }}>{errors.name}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input type="date" className={`form-control ${errors.dob?'border-danger':''}`} value={form.dob || ''} onChange={e=>set('dob',e.target.value)} />
              {form.dob && <p style={{ fontSize:11.5, color: 'var(--text-muted)', marginTop:3 }}>Age: {calcAge(form.dob)} years</p>}
              {errors.dob && <p style={{ color:'var(--accent-red)', fontSize:11.5, marginTop:3 }}>{errors.dob}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-control" value={form.gender || 'Male'} onChange={e=>set('gender',e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select className="form-control" value={form.bloodGroup || 'A+'} onChange={e=>set('bloodGroup',e.target.value)}>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">NIC Number *</label>
              <input className={`form-control ${errors.nic?'border-danger':''}`} value={form.nic || ''} onChange={e=>set('nic',e.target.value)} placeholder="e.g. 901234567V" />
              {errors.nic && <p style={{ color:'var(--accent-red)', fontSize:11.5, marginTop:3 }}>{errors.nic}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input className={`form-control ${errors.phone?'border-danger':''}`} value={form.phone || ''} onChange={e=>set('phone',e.target.value)} placeholder="e.g. 0771234567" />
              {errors.phone && <p style={{ color:'var(--accent-red)', fontSize:11.5, marginTop:3 }}>{errors.phone}</p>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" value={form.email || ''} onChange={e=>set('email',e.target.value)} placeholder="patient@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Home Address</label>
            <textarea className="form-control" rows={2} value={form.address || ''} onChange={e=>set('address',e.target.value)} placeholder="Street, City" />
          </div>
          <div className="divider" />
          <p className="section-label" style={{ marginBottom:12 }}>Emergency Contact</p>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Contact Name</label>
              <input className="form-control" value={form.emergencyName || ''} onChange={e=>set('emergencyName',e.target.value)} placeholder="Full name" />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input className="form-control" value={form.emergencyContact || ''} onChange={e=>set('emergencyContact',e.target.value)} placeholder="077XXXXXXX" />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
