import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, Pill } from 'lucide-react';

const EMPTY_RX = { drug:'', dose:'', frequency:'Once daily', duration:'', mealInstruction:'After meals', notes:'' };
const FREQ = ['Once daily','Twice daily','Three times daily','Four times daily','Every 4 hours','Every 6 hours','Every 8 hours','As needed','Weekly'];
const MEAL = ['Before meals','After meals','With meals','On empty stomach','No restriction'];

export default function AddPrescriptionModal({ isOpen, onClose, patientId, prefillDrugs=[] }) {
  const { addPrescription, getLogsForPatient } = useData();
  const { user } = useAuth();
  const logs = getLogsForPatient(patientId);
  const [drugs, setDrugs] = useState(prefillDrugs.length ? prefillDrugs.map(d=>({...d})) : [{ ...EMPTY_RX }]);
  const [selectedLog, setSelectedLog] = useState('');
  const [saved, setSaved] = useState(false);

  // Load drugs from a selected log
  const loadFromLog = (logId) => {
    setSelectedLog(logId);
    const log = logs.find(l => l.id === logId);
    if (log && log.drugs?.length) {
      setDrugs(log.drugs.map(d => ({ ...d })));
    }
  };

  const updateDrug = (i, f, v) => setDrugs(d => d.map((x,idx) => idx===i ? { ...x,[f]:v } : x));
  const addDrug = () => setDrugs(d => [...d, { ...EMPTY_RX }]);
  const removeDrug = (i) => setDrugs(d => d.filter((_,idx) => idx!==i));

  const handleSave = async () => {
    await addPrescription({ patientId, drugs, addedBy: user?.id, logId: selectedLog });
    setSaved(true);
  };

  const handleClose = () => {
    setSaved(false);
    setDrugs([{ ...EMPTY_RX }]);
    setSelectedLog('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Prescription"
      size="lg"
      footer={
        saved ? (
          <button className="btn btn-primary" onClick={handleClose}>Done</button>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>
              <Pill size={14}/> Save Prescription
            </button>
          </>
        )
      }
    >
      {saved ? (
        <div style={{ textAlign:'center', padding:'32px 0' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--accent-green-light)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <Pill size={30} color="var(--accent-green)" />
          </div>
          <h3 style={{ fontSize:17, marginBottom:6 }}>Prescription Saved</h3>
          <p style={{ color:'var(--text-muted)', fontSize:13.5 }}>Prescription has been added and will be visible to the patient in the app.</p>
        </div>
      ) : (
        <div>
          {/* Load from log */}
          {logs.length > 0 && (
            <div className="form-group">
              <label className="form-label">Load drugs from a patient log (optional)</label>
              <select className="form-control" value={selectedLog} onChange={e=>loadFromLog(e.target.value)}>
                <option value="">— Select a log entry —</option>
                {logs.map(l=>(
                  <option key={l.id} value={l.id}>
                    {l.date} — {l.doctorName} — {l.examination?.diagnosis || 'Log entry'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <p style={{ fontSize:13.5, color:'var(--text-secondary)' }}>{drugs.length} medication{drugs.length!==1?'s':''} in this prescription</p>
            <button className="btn btn-secondary btn-sm" onClick={addDrug}><Plus size={13}/> Add Medication</button>
          </div>

          {drugs.map((d, i) => (
            <div key={i} style={{ background:'var(--bg-base)', borderRadius:'var(--radius-md)', padding:14, marginBottom:12, border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <Pill size={14} color="var(--primary)" />
                  <span style={{ fontSize:13, fontWeight:600, color:'var(--primary)' }}>Medication #{i+1}</span>
                </div>
                {drugs.length > 1 && (
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>removeDrug(i)} style={{ color:'var(--accent-red)' }}><Trash2 size={13}/></button>
                )}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
                <div className="form-group" style={{ margin:0 }}>
                  <label className="form-label">Drug Name</label>
                  <input className="form-control" value={d.drug} onChange={e=>updateDrug(i,'drug',e.target.value)} placeholder="e.g. Paracetamol" />
                </div>
                <div className="form-group" style={{ margin:0 }}>
                  <label className="form-label">Dose</label>
                  <input className="form-control" value={d.dose} onChange={e=>updateDrug(i,'dose',e.target.value)} placeholder="e.g. 500mg" />
                </div>
                <div className="form-group" style={{ margin:0 }}>
                  <label className="form-label">Frequency</label>
                  <select className="form-control" value={d.frequency} onChange={e=>updateDrug(i,'frequency',e.target.value)}>
                    {FREQ.map(f=><option key={f}>{f}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin:0 }}>
                  <label className="form-label">Duration</label>
                  <input className="form-control" value={d.duration} onChange={e=>updateDrug(i,'duration',e.target.value)} placeholder="e.g. 7 days" />
                </div>
                <div className="form-group" style={{ margin:0 }}>
                  <label className="form-label">Before / After Meals</label>
                  <select className="form-control" value={d.mealInstruction} onChange={e=>updateDrug(i,'mealInstruction',e.target.value)}>
                    {MEAL.map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin:0 }}>
                  <label className="form-label">Special Notes</label>
                  <input className="form-control" value={d.notes} onChange={e=>updateDrug(i,'notes',e.target.value)} placeholder="e.g. Do not crush" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
