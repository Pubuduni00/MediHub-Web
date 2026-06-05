import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, FlaskConical, Pill, Stethoscope } from 'lucide-react';

const EMPTY_DRUG = { drug:'', dose:'', frequency:'Once daily', duration:'', mealInstruction:'After meals', notes:'' };
const EMPTY_INVEST = { type:'', dateOrdered:'', results:'', referenceRange:'', status:'Normal', notes:'' };
const EMPTY_EXAM = { chiefComplaint:'', bp:'', pulse:'', temp:'', spo2:'', weight:'', height:'', clinicalFindings:'', diagnosis:'', plan:'' };
const FREQ = ['Once daily','Twice daily','Three times daily','Four times daily','Every 4 hours','Every 6 hours','Every 8 hours','As needed','Weekly'];
const MEAL = ['Before meals','After meals','With meals','On empty stomach','No restriction'];

export default function PatientLogModal({ isOpen, onClose, patientId }) {
  const { addPatientLog } = useData();
  const { user } = useAuth();
  const [drugs, setDrugs] = useState([{ ...EMPTY_DRUG }]);
  const [investigations, setInvestigations] = useState([{ ...EMPTY_INVEST }]);
  const [exam, setExam] = useState({ ...EMPTY_EXAM });
  const [activeTab, setActiveTab] = useState('exam');
  const [saved, setSaved] = useState(false);

  const setExamField = (f, v) => setExam(e => ({ ...e, [f]: v }));
  const updateDrug = (i, f, v) => setDrugs(d => d.map((x,idx) => idx===i ? { ...x,[f]:v } : x));
  const addDrug = () => setDrugs(d => [...d, { ...EMPTY_DRUG }]);
  const removeDrug = (i) => setDrugs(d => d.filter((_,idx) => idx!==i));
  const updateInvest = (i, f, v) => setInvestigations(d => d.map((x,idx) => idx===i ? { ...x,[f]:v } : x));
  const addInvest = () => setInvestigations(d => [...d, { ...EMPTY_INVEST }]);
  const removeInvest = (i) => setInvestigations(d => d.filter((_,idx) => idx!==i));

  const handleSave = () => {
    addPatientLog({ patientId, doctorId:user?.id, doctorName:user?.name, examination:exam, drugs, investigations });
    setSaved(true);
  };

  const handleClose = () => {
    setSaved(false); setDrugs([{...EMPTY_DRUG}]); setInvestigations([{...EMPTY_INVEST}]);
    setExam({...EMPTY_EXAM}); setActiveTab('exam'); onClose();
  };

  const tabs = [
    { id:'exam', label:'Examination', icon:Stethoscope },
    { id:'drugs', label:'Drug Chart', icon:Pill },
    { id:'invest', label:'Investigations', icon:FlaskConical },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Patient Log Entry" size="xl"
      footer={saved
        ? <button className="btn btn-primary" onClick={handleClose}>Close</button>
        : <><button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
           <button className="btn btn-primary" onClick={handleSave}>Save Log Entry</button></>
      }
    >
      {saved ? (
        <div style={{textAlign:'center',padding:'32px 0'}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'var(--accent-green-light)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <Stethoscope size={30} color="var(--accent-green)"/>
          </div>
          <h3 style={{fontSize:17,marginBottom:6}}>Log Saved Successfully</h3>
          <p style={{color:'var(--text-muted)',fontSize:13.5}}>Patient log has been recorded for today.</p>
        </div>
      ) : (
        <div>
          {/* Tabs */}
          <div style={{display:'flex',gap:4,marginBottom:20,borderBottom:'2px solid var(--border)'}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
                display:'flex',alignItems:'center',gap:7,padding:'9px 16px',
                borderRadius:'var(--radius-md) var(--radius-md) 0 0',
                border:'none',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:13.5,fontWeight:500,
                background:activeTab===t.id?'var(--primary)':'var(--bg-base)',
                color:activeTab===t.id?'#fff':'var(--text-secondary)',
                marginBottom:-2,transition:'var(--transition)',
              }}>
                <t.icon size={14}/> {t.label}
              </button>
            ))}
          </div>

          {/* Examination */}
          {activeTab==='exam' && (
            <div>
              <div className="form-group">
                <label className="form-label">Chief Complaint</label>
                <textarea className="form-control" rows={2} value={exam.chiefComplaint} onChange={e=>setExamField('chiefComplaint',e.target.value)} placeholder="Patient's main complaint..."/>
              </div>
              <p className="section-label" style={{margin:'14px 0 10px'}}>Vitals</p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
                {[{label:'Blood Pressure (mmHg)',field:'bp',ph:'120/80'},{label:'Pulse Rate (bpm)',field:'pulse',ph:'72'},{label:'Temperature (°C)',field:'temp',ph:'37.0'},{label:'SpO₂ (%)',field:'spo2',ph:'98'},{label:'Weight (kg)',field:'weight',ph:'70'},{label:'Height (cm)',field:'height',ph:'170'}].map(v=>(
                  <div key={v.field} className="form-group" style={{margin:0}}>
                    <label className="form-label">{v.label}</label>
                    <input className="form-control" value={exam[v.field]} onChange={e=>setExamField(v.field,e.target.value)} placeholder={v.ph}/>
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Clinical Findings</label>
                <textarea className="form-control" rows={3} value={exam.clinicalFindings} onChange={e=>setExamField('clinicalFindings',e.target.value)} placeholder="Physical examination findings..."/>
              </div>
              <div className="form-group">
                <label className="form-label">Diagnosis</label>
                <input className="form-control" value={exam.diagnosis} onChange={e=>setExamField('diagnosis',e.target.value)} placeholder="e.g. Hypertension Grade 1"/>
              </div>
              <div className="form-group">
                <label className="form-label">Management Plan / Notes</label>
                <textarea className="form-control" rows={2} value={exam.plan} onChange={e=>setExamField('plan',e.target.value)} placeholder="Follow-up, advice..."/>
              </div>
            </div>
          )}

          {/* Drug Chart — TABLE format */}
          {activeTab==='drugs' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <p style={{fontSize:13.5,color:'var(--text-secondary)'}}>Add all prescribed medications</p>
                <button className="btn btn-primary btn-sm" onClick={addDrug}><Plus size={13}/> Add Drug</button>
              </div>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{background:'var(--bg-base)'}}>
                      {['#','Drug name','Dose','Frequency','Duration','Meal instruction','Notes',''].map((h,i)=>(
                        <th key={i} style={{padding:'9px 10px',textAlign:'left',fontSize:12,fontWeight:700,color:'var(--text-secondary)',borderBottom:'1px solid var(--border)',whiteSpace:'nowrap'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {drugs.map((d,i)=>(
                      <tr key={i} style={{borderBottom:'1px solid var(--border)'}}>
                        <td style={{padding:'8px 10px',fontSize:13,color:'var(--text-muted)',width:28}}>{i+1}</td>
                        <td style={{padding:'6px 6px',minWidth:130}}>
                          <input className="form-control" style={{padding:'5px 8px',fontSize:13}} value={d.drug} onChange={e=>updateDrug(i,'drug',e.target.value)} placeholder="e.g. Amlodipine"/>
                        </td>
                        <td style={{padding:'6px 6px',minWidth:80}}>
                          <input className="form-control" style={{padding:'5px 8px',fontSize:13}} value={d.dose} onChange={e=>updateDrug(i,'dose',e.target.value)} placeholder="e.g. 5mg"/>
                        </td>
                        <td style={{padding:'6px 6px',minWidth:130}}>
                          <select className="form-control" style={{padding:'5px 8px',fontSize:13}} value={d.frequency} onChange={e=>updateDrug(i,'frequency',e.target.value)}>
                            {FREQ.map(f=><option key={f}>{f}</option>)}
                          </select>
                        </td>
                        <td style={{padding:'6px 6px',minWidth:90}}>
                          <input className="form-control" style={{padding:'5px 8px',fontSize:13}} value={d.duration} onChange={e=>updateDrug(i,'duration',e.target.value)} placeholder="e.g. 30 days"/>
                        </td>
                        <td style={{padding:'6px 6px',minWidth:130}}>
                          <select className="form-control" style={{padding:'5px 8px',fontSize:13}} value={d.mealInstruction} onChange={e=>updateDrug(i,'mealInstruction',e.target.value)}>
                            {MEAL.map(m=><option key={m}>{m}</option>)}
                          </select>
                        </td>
                        <td style={{padding:'6px 6px',minWidth:120}}>
                          <input className="form-control" style={{padding:'5px 8px',fontSize:13}} value={d.notes} onChange={e=>updateDrug(i,'notes',e.target.value)} placeholder="Special instructions..."/>
                        </td>
                        <td style={{padding:'6px 8px',width:32}}>
                          {drugs.length>1 && (
                            <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>removeDrug(i)} style={{color:'var(--accent-red)',padding:4}}>
                              <Trash2 size={14}/>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Investigations */}
          {activeTab==='invest' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <p style={{fontSize:13.5,color:'var(--text-secondary)'}}>Add investigation requests and results</p>
                <button className="btn btn-secondary btn-sm" onClick={addInvest}><Plus size={13}/> Add Investigation</button>
              </div>
              {investigations.map((inv,i)=>(
                <div key={i} style={{background:'var(--bg-base)',borderRadius:'var(--radius-md)',padding:14,marginBottom:12,border:'1px solid var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    <span style={{fontSize:12.5,fontWeight:700,color:'var(--secondary)'}}>Investigation #{i+1}</span>
                    {investigations.length>1 && (
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>removeInvest(i)} style={{color:'var(--accent-red)'}}><Trash2 size={13}/></button>
                    )}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
                    <div className="form-group" style={{margin:0}}>
                      <label className="form-label">Investigation Type</label>
                      <input className="form-control" value={inv.type} onChange={e=>updateInvest(i,'type',e.target.value)} placeholder="e.g. Full Blood Count, ECG"/>
                    </div>
                    <div className="form-group" style={{margin:0}}>
                      <label className="form-label">Date Ordered</label>
                      <input type="date" className="form-control" value={inv.dateOrdered} onChange={e=>updateInvest(i,'dateOrdered',e.target.value)}/>
                    </div>
                    <div className="form-group" style={{margin:0,gridColumn:'1/-1'}}>
                      <label className="form-label">Results</label>
                      <textarea className="form-control" rows={2} value={inv.results} onChange={e=>updateInvest(i,'results',e.target.value)} placeholder="Describe results..."/>
                    </div>
                    <div className="form-group" style={{margin:0}}>
                      <label className="form-label">Reference Range</label>
                      <input className="form-control" value={inv.referenceRange} onChange={e=>updateInvest(i,'referenceRange',e.target.value)} placeholder="e.g. 4.0–11.0"/>
                    </div>
                    <div className="form-group" style={{margin:0}}>
                      <label className="form-label">Status</label>
                      <select className="form-control" value={inv.status} onChange={e=>updateInvest(i,'status',e.target.value)}>
                        <option>Normal</option><option>Abnormal</option><option>Pending</option><option>Critical</option>
                      </select>
                    </div>
                    <div className="form-group" style={{margin:0,gridColumn:'1/-1'}}>
                      <label className="form-label">Notes</label>
                      <input className="form-control" value={inv.notes} onChange={e=>updateInvest(i,'notes',e.target.value)} placeholder="Additional notes..."/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
