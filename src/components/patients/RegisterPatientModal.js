import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { UserPlus } from 'lucide-react';

const EMPTY = {
  name:'', dob:'', gender:'Male', phone:'', email:'',
  address:'', bloodGroup:'A+', nic:'', emergencyName:'', emergencyContact:''
};

export default function RegisterPatientModal({ isOpen, onClose }) {
  const { addPatient } = useData();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);

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
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.dob) e.dob = 'Date of birth is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.nic.trim()) e.nic = 'NIC is required';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const age = calcAge(form.dob);
    const patient = await addPatient({ ...form, age });
    setSuccess(patient);
    setForm(EMPTY);
  };

  const handleClose = () => { setSuccess(null); setForm(EMPTY); setErrors({}); onClose(); };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Register New Patient"
      size="lg"
      footer={
        success ? (
          <button className="btn btn-primary" onClick={handleClose}>Done</button>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              <UserPlus size={15}/> Register Patient
            </button>
          </>
        )
      }
    >
      {success ? (
        <div style={{ textAlign:'center', padding:'24px 0' }}>
          <div style={{ width:60, height:60, borderRadius:'50%', background:'var(--accent-green-light)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <UserPlus size={28} color="var(--accent-green)" />
          </div>
          <h3 style={{ fontSize:17, marginBottom:6 }}>Patient Registered Successfully!</h3>
          <p style={{ color:'var(--text-muted)', fontSize:13.5 }}>
            <strong>{success.name}</strong> has been registered with ID{' '}
            <span style={{ color:'var(--primary)', fontWeight:700, fontFamily:'monospace' }}>{success.id}</span>
          </p>
        </div>
      ) : (
        <div>
          {/* Personal Info */}
          <p className="section-label" style={{ marginBottom:12 }}>Personal Information</p>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className={`form-control ${errors.name?'border-danger':''}`} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Rohan Fernando" />
              {errors.name && <p style={{ color:'var(--accent-red)', fontSize:11.5, marginTop:3 }}>{errors.name}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input type="date" className={`form-control ${errors.dob?'border-danger':''}`} value={form.dob} onChange={e=>set('dob',e.target.value)} />
              {form.dob && <p style={{ fontSize:11.5, color:'var(--text-muted)', marginTop:3 }}>Age: {calcAge(form.dob)} years</p>}
              {errors.dob && <p style={{ color:'var(--accent-red)', fontSize:11.5, marginTop:3 }}>{errors.dob}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-control" value={form.gender} onChange={e=>set('gender',e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select className="form-control" value={form.bloodGroup} onChange={e=>set('bloodGroup',e.target.value)}>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">NIC Number *</label>
              <input className={`form-control ${errors.nic?'border-danger':''}`} value={form.nic} onChange={e=>set('nic',e.target.value)} placeholder="e.g. 901234567V" />
              {errors.nic && <p style={{ color:'var(--accent-red)', fontSize:11.5, marginTop:3 }}>{errors.nic}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input className={`form-control ${errors.phone?'border-danger':''}`} value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="e.g. 0771234567" />
              {errors.phone && <p style={{ color:'var(--accent-red)', fontSize:11.5, marginTop:3 }}>{errors.phone}</p>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="patient@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Home Address</label>
            <textarea className="form-control" rows={2} value={form.address} onChange={e=>set('address',e.target.value)} placeholder="Street, City" />
          </div>
          <div className="divider" />
          <p className="section-label" style={{ marginBottom:12 }}>Emergency Contact</p>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Contact Name</label>
              <input className="form-control" value={form.emergencyName} onChange={e=>set('emergencyName',e.target.value)} placeholder="Full name" />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input className="form-control" value={form.emergencyContact} onChange={e=>set('emergencyContact',e.target.value)} placeholder="077XXXXXXX" />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
