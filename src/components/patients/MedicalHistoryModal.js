import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList } from 'lucide-react';

const EMPTY = {
  // Auto-filled
  visitDate: new Date().toISOString().split('T')[0],
  // Presenting
  primaryComplaint: '',
  historyOfComplaint: '',
  // History
  pmh: '', psh: '', ah: '', dh: '', fh: '', sh: '',
  // Examination
  generalExamination: '',
  // CVS
  pulse: '', bp: '', apex: '', hs: '',
  // RS
  rr: '', spo2: '', lungFindings: '',
  // Other
  bm: '',
  // Assessment
  probableDiagnosis: '',
  dataCollected: '',
  investigationsOrdered: '',
  investigationResults: '',
  // Treatment
  treatments: [{ drug:'', dose:'', frequency:'' }],
  instructionsGiven: '',
  // Management plan
  managementPlan: { followUp: false, referral: false, advice: false },
  referralDetails: '',
};

export default function MedicalHistoryModal({ isOpen, onClose, patientId, existingHistory }) {
  const { updatePatient, getPatientById } = useData();
  const { user } = useAuth();
  const patient = getPatientById(patientId);
  const [form, setForm] = useState(existingHistory || { ...EMPTY });
  const [saved, setSaved] = useState(false);

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const setNested = (parent, f, v) => setForm(p => ({ ...p, [parent]: { ...p[parent], [f]: v } }));

  const addTreatment = () => setForm(p => ({ ...p, treatments: [...p.treatments, { drug:'', dose:'', frequency:'' }] }));
  const setTreatment = (i, f, v) => setForm(p => ({ ...p, treatments: p.treatments.map((t,idx) => idx===i ? {...t,[f]:v} : t) }));
  const removeTreatment = (i) => setForm(p => ({ ...p, treatments: p.treatments.filter((_,idx) => idx!==i) }));

  const handleSave = () => {
    updatePatient(patientId, { medicalHistory: { ...form, savedBy: user?.name, savedAt: new Date().toISOString() } });
    setSaved(true);
  };

  const F = ({ label, field, ph='', type='text', rows }) => (
    <div className="form-group" style={{margin:'0 0 12px'}}>
      <label className="form-label">{label}</label>
      {rows
        ? <textarea className="form-control" rows={rows} value={form[field]||''} onChange={e=>set(field,e.target.value)} placeholder={ph}/>
        : <input type={type} className="form-control" value={form[field]||''} onChange={e=>set(field,e.target.value)} placeholder={ph}/>
      }
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Medical History — Booking Visit" size="xl"
      footer={
        saved
          ? <button className="btn btn-primary" onClick={onClose}>Close</button>
          : <><button className="btn btn-ghost" onClick={onClose}>Cancel</button>
             <button className="btn btn-primary" onClick={handleSave}><ClipboardList size={14}/> Save Medical History</button></>
      }
    >
      {saved ? (
        <div style={{textAlign:'center',padding:'32px 0'}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'var(--accent-green-light)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <ClipboardList size={30} color="var(--accent-green)"/>
          </div>
          <h3 style={{fontSize:17,marginBottom:6}}>Medical History Saved</h3>
          <p style={{color:'var(--text-muted)',fontSize:13.5}}>Patient's medical history has been recorded successfully.</p>
        </div>
      ) : (
        <div>
          {/* Auto-filled header */}
          <div style={{background:'var(--primary-light)',borderRadius:'var(--radius-md)',padding:'12px 16px',marginBottom:20,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
            {[['ID No.', patient?.id],['Name', patient?.name],['Age', `${patient?.age} years`],['Address', patient?.address]].map(([l,v])=>(
              <div key={l}>
                <p style={{fontSize:11,color:'var(--text-muted)',fontWeight:600,marginBottom:2}}>{l}</p>
                <p style={{fontSize:13,fontWeight:600,color:'var(--primary)'}}>{v||'—'}</p>
              </div>
            ))}
          </div>

          {/* Visit date */}
          <div className="form-group" style={{marginBottom:20}}>
            <label className="form-label">Visit Date</label>
            <input type="date" className="form-control" style={{maxWidth:200}} value={form.visitDate} onChange={e=>set('visitDate',e.target.value)}/>
          </div>

          {/* Presenting Complaint */}
          <p className="section-label" style={{marginBottom:10}}>Presenting Complaint</p>
          <F label="Primary Complaint" field="primaryComplaint" ph="Chief presenting complaint..." rows={2}/>
          <F label="History of Presenting Complaint" field="historyOfComplaint" ph="Detailed history..." rows={3}/>

          {/* History */}
          <p className="section-label" style={{margin:'16px 0 10px'}}>History</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <F label="PMH — Past Medical History" field="pmh" ph="Previous illnesses, conditions..." rows={2}/>
            <F label="PSH — Past Surgical History" field="psh" ph="Previous surgeries..." rows={2}/>
            <F label="AH — Allergy History" field="ah" ph="Drug allergies, food allergies..." rows={2}/>
            <F label="DH — Drug History" field="dh" ph="Current and past medications..." rows={2}/>
            <F label="FH — Family History" field="fh" ph="Relevant family conditions..." rows={2}/>
            <F label="SH — Social History" field="sh" ph="Smoking, alcohol, occupation..." rows={2}/>
          </div>

          {/* Examination */}
          <p className="section-label" style={{margin:'16px 0 10px'}}>Examination</p>
          <F label="General Examination" field="generalExamination" ph="General appearance, orientation..." rows={2}/>

          {/* CVS */}
          <div style={{background:'var(--bg-base)',borderRadius:'var(--radius-md)',padding:14,marginBottom:12}}>
            <p style={{fontSize:12.5,fontWeight:700,color:'var(--primary)',marginBottom:10}}>CVS — Cardiovascular System</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
              {[['Pulse','pulse','bpm'],['BP','bp','mmHg'],['Apex','apex',''],['Heart Sounds','hs','']].map(([l,f,u])=>(
                <div key={f} className="form-group" style={{margin:0}}>
                  <label className="form-label">{l}{u&&<span style={{color:'var(--text-muted)',fontSize:10.5}}> ({u})</span>}</label>
                  <input className="form-control" value={form[f]||''} onChange={e=>set(f,e.target.value)} placeholder={l}/>
                </div>
              ))}
            </div>
          </div>

          {/* RS */}
          <div style={{background:'var(--bg-base)',borderRadius:'var(--radius-md)',padding:14,marginBottom:12}}>
            <p style={{fontSize:12.5,fontWeight:700,color:'var(--secondary)',marginBottom:10}}>RS — Respiratory System</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 2fr',gap:10}}>
              <div className="form-group" style={{margin:0}}>
                <label className="form-label">RR <span style={{color:'var(--text-muted)',fontSize:10.5}}>(breaths/min)</span></label>
                <input className="form-control" value={form.rr||''} onChange={e=>set('rr',e.target.value)} placeholder="RR"/>
              </div>
              <div className="form-group" style={{margin:0}}>
                <label className="form-label">SpO₂ <span style={{color:'var(--text-muted)',fontSize:10.5}}>(%)</span></label>
                <input className="form-control" value={form.spo2||''} onChange={e=>set('spo2',e.target.value)} placeholder="SpO₂"/>
              </div>
              <div className="form-group" style={{margin:0}}>
                <label className="form-label">Lung Auscultation Findings</label>
                <input className="form-control" value={form.lungFindings||''} onChange={e=>set('lungFindings',e.target.value)} placeholder="Clear / Crepitations / Wheeze..."/>
              </div>
            </div>
          </div>

          {/* BM */}
          <F label="BM / Other Systems" field="bm" ph="Abdominal, neurological findings..." rows={2}/>

          {/* Assessment */}
          <p className="section-label" style={{margin:'16px 0 10px'}}>Assessment & Investigations</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <F label="Probable Diagnosis" field="probableDiagnosis" ph="e.g. Hypertension, Diabetes..." rows={2}/>
            <F label="Data Collected / Notes" field="dataCollected" ph="Additional notes..." rows={2}/>
            <F label="Investigations Ordered" field="investigationsOrdered" ph="FBC, Lipid profile, ECG..." rows={2}/>
            <F label="Investigation Results" field="investigationResults" ph="Results summary..." rows={2}/>
          </div>

          {/* Treatment */}
          <p className="section-label" style={{margin:'16px 0 10px'}}>Treatment</p>
          <p style={{fontSize:12.5,color:'var(--text-muted)',marginBottom:10}}>Drug name · Dose · Frequency (e.g. Losartan 50mg BD)</p>
          {form.treatments.map((t,i)=>(
            <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:10,marginBottom:8,alignItems:'end'}}>
              <div className="form-group" style={{margin:0}}>
                {i===0&&<label className="form-label">Drug Name</label>}
                <input className="form-control" value={t.drug} onChange={e=>setTreatment(i,'drug',e.target.value)} placeholder="e.g. Losartan"/>
              </div>
              <div className="form-group" style={{margin:0}}>
                {i===0&&<label className="form-label">Dose</label>}
                <input className="form-control" value={t.dose} onChange={e=>setTreatment(i,'dose',e.target.value)} placeholder="e.g. 50mg"/>
              </div>
              <div className="form-group" style={{margin:0}}>
                {i===0&&<label className="form-label">Frequency</label>}
                <input className="form-control" value={t.frequency} onChange={e=>setTreatment(i,'frequency',e.target.value)} placeholder="e.g. BD"/>
              </div>
              {form.treatments.length>1&&(
                <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>removeTreatment(i)} style={{color:'var(--accent-red)',marginTop:i===0?20:0}}>✕</button>
              )}
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={addTreatment} style={{marginBottom:16}}>+ Add Drug</button>

          <F label="Instructions Given" field="instructionsGiven" ph="Dietary advice, lifestyle instructions..." rows={2}/>

          {/* Management Plan */}
          <p className="section-label" style={{margin:'16px 0 10px'}}>Management Plan</p>
          <div style={{display:'flex',gap:24,flexWrap:'wrap',padding:'12px 16px',background:'var(--bg-base)',borderRadius:'var(--radius-md)'}}>
            {[['followUp','Follow-up'],['referral','Referral'],['advice','Advice']].map(([k,l])=>(
              <label key={k} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13.5,fontWeight:500}}>
                <input type="checkbox" checked={form.managementPlan[k]||false} onChange={e=>setNested('managementPlan',k,e.target.checked)}
                  style={{width:16,height:16,accentColor:'var(--primary)',cursor:'pointer'}}/>
                {l}
              </label>
            ))}
          </div>
          {form.managementPlan?.referral && (
            <div className="form-group" style={{marginTop:10}}>
              <label className="form-label">Referral Details</label>
              <input className="form-control" value={form.referralDetails||''} onChange={e=>set('referralDetails',e.target.value)} placeholder="Refer to which department/hospital..."/>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
