import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Phone, Mail, MapPin, User, Stethoscope, Calendar, Plus, History, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { format } from 'date-fns';
import PatientCalendar from '../components/patients/PatientCalendar';
import PatientLogModal from '../components/patients/PatientLogModal';
import MedicalReportGenerator from '../components/patients/MedicalReportGenerator';
import MedicalHistoryModal from '../components/patients/MedicalHistoryModal';
import AddAppointmentModal from '../components/appointments/AddAppointmentModal';
import EditPatientModal from '../components/patients/EditPatientModal';
import Badge from '../components/common/Badge';
import './PatientProfilePage.css';

export default function PatientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDoctor } = useAuth();
  const { getPatientById, getLogsForPatient, getPrescriptionsForPatient, doctors, syncPatientToMobile, symptomLogs } = useData();

  const patient = getPatientById(id);
  const [showLog,     setShowLog]     = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAppt,    setShowAppt]    = useState(false);
  const [showEditPatient, setShowEditPatient] = useState(false);
  const [syncing,     setSyncing]     = useState(false);
  const [syncStatus,  setSyncStatus]  = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus(null);
    const res = await syncPatientToMobile(id);
    if (res.success) {
      setSyncStatus({ type: 'success', text: 'Synced to mobile successfully!' });
      setTimeout(() => setSyncStatus(null), 5000);
    } else {
      setSyncStatus({ type: 'error', text: res.error || 'Failed to sync' });
    }
    setSyncing(false);
  };

  if (!patient) return (
    <div style={{ textAlign:'center', padding:60 }}>
      <p style={{ fontSize:16, color:'var(--text-muted)' }}>Patient not found.</p>
      <button className="btn btn-primary mt-4" onClick={()=>navigate('/patients')}>Back to Patients</button>
    </div>
  );

  const logs         = getLogsForPatient(id);
  const prescriptions = getPrescriptionsForPatient(id);
  const patientSymptomLogs = (symptomLogs || []).filter(sl => sl.patientId === id);
  const initials     = patient.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
  const assignedDoctorNames = (patient.assignedDoctors||[])
    .map(dId => doctors.find(d=>d.id===dId)?.name).filter(Boolean);
  const mh = patient.medicalHistory;

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={()=>navigate(-1)} style={{ marginBottom:16 }}>
        <ArrowLeft size={14}/> Back
      </button>

      <div className="profile-layout">
        {/* ── Sidebar ── */}
        <div className="profile-sidebar">

          {/* Header card */}
          <div className="profile-header-card">
            <div className="profile-avatar-xl">{initials}</div>
            <p className="profile-name">{patient.name}</p>
            <p className="profile-id">ID: {patient.id}</p>
            <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:10, flexWrap:'wrap' }}>
              <span style={{ background:'rgba(255,255,255,0.2)', padding:'3px 10px', borderRadius:20, fontSize:12 }}>{patient.gender}</span>
              <span style={{ background:'rgba(255,255,255,0.2)', padding:'3px 10px', borderRadius:20, fontSize:12 }}>{patient.age} years</span>
              <span style={{ background:'rgba(255,255,255,0.2)', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:700 }}>{patient.bloodGroup}</span>
            </div>

            <div style={{ display:'flex', justifyContent:'center', marginTop:12 }}>
              {patient.firebaseUid ? (
                <Badge label="Mobile Connected" variant="success" dot />
              ) : (
                <Badge label="Not linked to mobile" variant="muted" dot />
              )}
            </div>

            {/* Action buttons — only for doctors, no prescription button */}
            {isDoctor && (
              <div className="profile-actions">
                <button className="btn btn-sm" style={{ background:'rgba(255,255,255,0.2)', color:'#fff', border:'1px solid rgba(255,255,255,0.3)' }} onClick={()=>setShowLog(true)}>
                  <ClipboardList size={13}/> Patient Log
                </button>
                <button className="btn btn-sm" style={{ background:'rgba(255,255,255,0.2)', color:'#fff', border:'1px solid rgba(255,255,255,0.3)' }} onClick={()=>setShowAppt(true)}>
                  <Calendar size={13}/> Add Appointment
                </button>
              </div>
            )}
            {/* Staff: only add appointment */}
            {!isDoctor && (
              <div className="profile-actions">
                <button className="btn btn-sm" style={{ background:'rgba(255,255,255,0.2)', color:'#fff', border:'1px solid rgba(255,255,255,0.3)' }} onClick={()=>setShowAppt(true)}>
                  <Calendar size={13}/> Add Appointment
                </button>
              </div>
            )}

            {/* Sync to Mobile Button (if linked to firebase) */}
            {patient.firebaseUid && (
              <div style={{ padding: '0 12px 12px 12px', marginTop: 10 }}>
                <button 
                  className={`btn btn-sm ${syncing ? 'loading' : ''}`}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    background: 'var(--accent-green)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 12px',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  onClick={handleSync}
                  disabled={syncing}
                >
                  <Activity size={13}/> {syncing ? 'Syncing...' : 'Sync to Mobile'}
                </button>
                {syncStatus && (
                  <p style={{ 
                    fontSize: 11, 
                    textAlign: 'center', 
                    margin: '6px 0 0 0',
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: syncStatus.type === 'success' ? 'rgba(52, 168, 83, 0.15)' : 'rgba(234, 67, 53, 0.15)',
                    color: syncStatus.type === 'success' ? '#34a853' : '#ea4335'
                  }}>
                    {syncStatus.text}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Personal Info */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">Personal Details</h3>
              <button 
                className="btn btn-ghost btn-sm" 
                style={{ padding: '3px 8px', fontSize: 12, height: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => setShowEditPatient(true)}
              >
                <Plus size={12}/> Edit
              </button>
            </div>
            {[
              { icon:User,   label:'Date of Birth', val:patient.dob||'N/A' },
              { icon:Phone,  label:'Phone',         val:patient.phone },
              { icon:Mail,   label:'Email',         val:patient.email||'N/A' },
              { icon:MapPin, label:'Address',       val:patient.address||'N/A' },
              { icon:User,   label:'NIC',           val:patient.nic||'N/A' },
            ].map((item,i)=>(
              <div key={i} className="info-row">
                <div style={{ display:'flex', alignItems:'center', gap:6, minWidth:110 }}>
                  <item.icon size={13} color="var(--text-muted)"/>
                  <span className="info-label" style={{ minWidth:'unset' }}>{item.label}</span>
                </div>
                <span className="info-value">{item.val}</span>
              </div>
            ))}
          </div>

          {/* Assigned Doctors */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Stethoscope size={14} style={{ marginRight:6 }}/>Assigned Doctors</h3>
            </div>
            {assignedDoctorNames.length===0
              ? <p style={{ fontSize:13, color:'var(--text-muted)' }}>No doctors assigned yet.</p>
              : assignedDoctorNames.map((name,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:'1px solid var(--border)' }}>
                  <div className="avatar avatar-sm" style={{ fontSize:10 }}>
                    {name.split(' ').filter((_,idx)=>idx>0).map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <span style={{ fontSize:13.5, fontWeight:500 }}>{name}</span>
                </div>
              ))
            }
          </div>

          {/* Medical Report — doctor only active */}
          <div className="card" style={{ padding:16 }}>
            <MedicalReportGenerator patient={patient}/>
            {!isDoctor && <p style={{ fontSize:11.5, color:'var(--text-muted)', marginTop:7 }}>Only doctors can download medical reports.</p>}
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="profile-main">

          {/* Stats bar */}
          <div className="card" style={{ padding:'14px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
              <div style={{ display:'flex', gap:20 }}>
                {[
                  ['Visit Logs',     logs.length,                       'var(--primary)'],
                  ['Prescriptions',  prescriptions.length,              'var(--secondary)'],
                  ['Doctors',        patient.assignedDoctors?.length||0,'var(--accent-green)'],
                ].map(([l,v,c],i)=>(
                  <React.Fragment key={l}>
                    {i>0 && <div style={{ width:1, background:'var(--border)' }}/>}
                    <div style={{ textAlign:'center' }}>
                      <p style={{ fontSize:20, fontWeight:700, color:c }}>{v}</p>
                      <p style={{ fontSize:11.5, color:'var(--text-muted)' }}>{l}</p>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              <Badge label={patient.status} variant={patient.status==='Active'?'success':'muted'} dot/>
            </div>
          </div>

          {/* Medical History */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><History size={15} style={{ marginRight:6 }}/>Medical History</h3>
              {isDoctor && (
                <button className="btn btn-primary btn-sm" onClick={()=>setShowHistory(true)}>
                  <Plus size={13}/> {mh ? 'Update History' : 'Add Medical History'}
                </button>
              )}
            </div>
            {!mh ? (
              <div style={{ padding:'16px 0', color:'var(--text-muted)', fontSize:13.5 }}>
                No medical history recorded yet.
                {isDoctor && <span style={{ color:'var(--primary)', cursor:'pointer', marginLeft:6 }} onClick={()=>setShowHistory(true)}>Add now →</span>}
              </div>
            ) : (
              <div>
                <div style={{ background:'var(--primary-light)', borderRadius:'var(--radius-md)', padding:'10px 14px', marginBottom:14, display:'flex', gap:24, flexWrap:'wrap' }}>
                  <div><p style={{ fontSize:11, color:'var(--text-muted)' }}>Visit Date</p><p style={{ fontSize:13, fontWeight:600 }}>{mh.visitDate||'—'}</p></div>
                  <div><p style={{ fontSize:11, color:'var(--text-muted)' }}>Saved By</p><p style={{ fontSize:13, fontWeight:600 }}>{mh.savedBy||'—'}</p></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0 }}>
                  {[
                    ['Primary Complaint',    mh.primaryComplaint],
                    ['History of Complaint', mh.historyOfComplaint],
                    ['Past Medical History', mh.pmh],
                    ['Past Surgical History',mh.psh],
                    ['Allergy History',      mh.ah],
                    ['Drug History',         mh.dh],
                    ['Family History',       mh.fh],
                    ['Social History',       mh.sh],
                  ].map(([l,v])=>v?(
                    <div key={l} className="info-row">
                      <span className="info-label">{l}</span>
                      <span className="info-value">{v}</span>
                    </div>
                  ):null)}
                </div>
                {mh.probableDiagnosis && (
                  <div className="info-row" style={{ marginTop:8 }}>
                    <span className="info-label">Probable Diagnosis</span>
                    <span className="info-value" style={{ color:'var(--accent-red)', fontWeight:600 }}>{mh.probableDiagnosis}</span>
                  </div>
                )}
                {mh.treatments?.length>0 && mh.treatments[0].drug && (
                  <div style={{ marginTop:8 }}>
                    <p style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600, marginBottom:6 }}>TREATMENTS</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {mh.treatments.filter(t=>t.drug).map((t,i)=>(
                        <span key={i} style={{ background:'var(--secondary-light)', color:'var(--secondary)', padding:'4px 10px', borderRadius:20, fontSize:12.5, fontWeight:500 }}>
                          {t.drug} {t.dose} — {t.frequency}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Visit Calendar */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Visit Calendar</h3>
              <p style={{ fontSize:12, color:'var(--text-muted)' }}>Click a green day to view log</p>
            </div>
            <div style={{ maxWidth:360 }}>
              <PatientCalendar patientId={id}/>
            </div>
          </div>

          {/* Recent Logs */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Logs</h3>
              {isDoctor && (
                <button className="btn btn-primary btn-sm" onClick={()=>setShowLog(true)}>
                  <ClipboardList size={13}/> Add Log
                </button>
              )}
            </div>
            {logs.length===0 ? (
              <p style={{ color:'var(--text-muted)', fontSize:13.5, padding:'12px 0' }}>No logs recorded yet.</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {logs.slice().reverse().slice(0,5).map(log=>(
                  <div key={log.id} style={{ padding:'12px 14px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', background:'var(--bg-base)' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                      <p style={{ fontWeight:600, fontSize:13.5 }}>{log.examination?.diagnosis||'Log Entry'}</p>
                      <span style={{ fontSize:12, color:'var(--text-muted)' }}>{log.date}</span>
                    </div>
                    <p style={{ fontSize:12.5, color:'var(--text-muted)' }}>
                      {log.doctorName} · {log.drugs?.length||0} drug(s) · {log.investigations?.length||0} investigation(s)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Symptom Logs */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={15} color="var(--primary)" />
                Symptom Logs (from Mobile App)
              </h3>
              <span className="badge badge-muted">{patientSymptomLogs.length} reported</span>
            </div>
            {patientSymptomLogs.length === 0 ? (
              <p style={{ color:'var(--text-muted)', fontSize:13.5, padding:'12px 0' }}>No symptom logs submitted from mobile app yet.</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {patientSymptomLogs.slice().reverse().map(log => {
                  const dateStr = log.date ? format(new Date(log.date), 'yyyy-MM-dd HH:mm') : '—';
                  const severityVariant = log.severity === 'Severe' ? 'danger' : log.severity === 'Moderate' ? 'warning' : 'success';
                  return (
                    <div key={log.id} style={{ padding:'12px 14px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', background:'var(--bg-base)' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                          {(log.symptoms || []).map((s, i) => (
                            <span key={i} style={{ fontSize:11.5, background:'var(--bg-white)', border:'1px solid var(--border)', padding:'1px 6px', borderRadius:10 }}>
                              {s}
                            </span>
                          ))}
                        </div>
                        <span style={{ fontSize:11.5, color:'var(--text-muted)' }}>{dateStr}</span>
                      </div>
                      {log.notes && (
                        <p style={{ fontSize:12.5, fontStyle:'italic', color:'var(--text-secondary)', marginBottom:6 }}>"{log.notes}"</p>
                      )}
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:11.5, color:'var(--text-muted)' }}>via {log.reportedVia || 'Mobile App'}</span>
                        <Badge label={log.severity} variant={severityVariant} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Prescriptions — from drug chart, view only */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Prescriptions</h3>
            </div>
            {prescriptions.length===0 ? (
              <p style={{ color:'var(--text-muted)', fontSize:13.5, padding:'12px 0' }}>
                No prescriptions added yet. Prescriptions are added through the Drug Chart in Patient Log.
              </p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {prescriptions.slice().reverse().map(rx=>(
                  <div key={rx.id} style={{ padding:'12px 14px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <span style={{ fontWeight:600, fontSize:13 }}>Prescription {rx.id}</span>
                      <span style={{ fontSize:12, color:'var(--text-muted)' }}>{rx.date}</span>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                      {rx.drugs?.map((d,i)=>(
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                          <span style={{ fontWeight:600, fontSize:13 }}>{d.drug}</span>
                          <span className="badge badge-secondary">{d.dose}</span>
                          <span style={{ fontSize:12, color:'var(--text-muted)' }}>{d.frequency} · {d.duration}</span>
                          <span className="badge badge-muted">{d.mealInstruction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <PatientLogModal   isOpen={showLog}     onClose={()=>setShowLog(false)}     patientId={id}/>
      <MedicalHistoryModal isOpen={showHistory} onClose={()=>setShowHistory(false)} patientId={id} existingHistory={patient.medicalHistory}/>
      <AddAppointmentModal isOpen={showAppt}   onClose={()=>setShowAppt(false)}   prefillDate={format(new Date(),'yyyy-MM-dd')}/>
      <EditPatientModal    isOpen={showEditPatient} onClose={()=>setShowEditPatient(false)} patient={patient}/>
    </div>
  );
}
