import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Phone, Mail, MapPin, User, Stethoscope, Calendar, Plus, History, Square, Activity } from 'lucide-react';
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
import LogViewPopup from '../components/patients/LogViewPopup';
import './PatientProfilePage.css';

export default function PatientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDoctor } = useAuth();
  const { getPatientById, getLogsForPatient, getPrescriptionsForPatient, doctors, updateAppointment, symptomLogs, appointments, stopMedication, editMedication, refreshData } = useData();

  const patient = getPatientById(id);
  const [showLog,     setShowLog]     = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAppt,    setShowAppt]    = useState(false);
  const [showEditPatient, setShowEditPatient] = useState(false);
  const [selectedLogDate, setSelectedLogDate] = useState(null);
  const [selectedLogsForPopup, setSelectedLogsForPopup] = useState([]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      refreshData();
    }, 4000);
    return () => clearInterval(timer);
  }, [refreshData]);

  // Detect active session for this patient
  const activeApptId  = sessionStorage.getItem('activeAppointmentId');
  const activePatId   = sessionStorage.getItem('activePatientId');
  const activeAppt    = (appointments || []).find(a => a.id === activeApptId);
  const isApptToday   = activeAppt && activeAppt.date === format(new Date(), 'yyyy-MM-dd');
  const hasActiveSession = activeApptId && activePatId === id && isApptToday;

  React.useEffect(() => {
    if (activeApptId && activeAppt && activeAppt.date !== format(new Date(), 'yyyy-MM-dd')) {
      sessionStorage.removeItem('activeAppointmentId');
      sessionStorage.removeItem('activePatientId');
    }
  }, [activeApptId, activeAppt]);

  const stopSession = async () => {
    if (activeApptId) {
      await updateAppointment(activeApptId, { status: 'Completed' });
    }
    sessionStorage.removeItem('activeAppointmentId');
    sessionStorage.removeItem('activePatientId');
    navigate('/appointments');
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
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <button className="btn btn-ghost btn-sm" onClick={()=>navigate(-1)}>
          <ArrowLeft size={14}/> Back
        </button>
        {hasActiveSession && (
          <button
            onClick={stopSession}
            style={{
              display:'flex', alignItems:'center', gap:6,
              background:'#dc2626', color:'#fff',
              border:'none', borderRadius:8, padding:'7px 14px',
              fontSize:13, fontWeight:700, cursor:'pointer',
              boxShadow:'0 2px 8px rgba(220,38,38,0.3)'
            }}
            title="End this appointment session"
          >
            <Square size={13} fill="currentColor"/> Stop Session
          </button>
        )}
      </div>

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
              { icon:User,   label:'Emergency Name', val:patient.emergencyName||'N/A' },
              { icon:Phone,  label:'Emergency Contact', val:patient.emergencyContact||'N/A' },
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
            </div>
            {logs.length===0 ? (
              <p style={{ color:'var(--text-muted)', fontSize:13.5, padding:'12px 0' }}>No logs recorded yet.</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {logs.slice().reverse().slice(0,5).map(log=>(
                  <div key={log.id} 
                    className="clickable-log-item"
                    onClick={() => {
                      setSelectedLogDate(log.date);
                      setSelectedLogsForPopup([log]);
                    }}
                    style={{ padding:'6px 10px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', background:'var(--bg-base)' }}
                  >
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span style={{ fontWeight:600, fontSize:13, color:'var(--text-primary)' }}>{log.date}</span>
                      <span style={{ fontSize:12, color:'var(--text-muted)' }}>
                        {log.drugs?.length||0} drug(s) · {log.investigations?.length||0} investigation(s)
                      </span>
                    </div>
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
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {patientSymptomLogs.slice().reverse().map(log => {
                  const dateStr = log.date ? format(new Date(log.date), 'yyyy-MM-dd HH:mm') : '—';
                  const severityVariant = log.severity === 'Severe' ? 'danger' : log.severity === 'Moderate' ? 'warning' : 'success';
                  return (
                    <div key={log.id} style={{ padding:'6px 10px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', background:'var(--bg-base)' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:6 }}>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                          {(log.symptoms || []).map((s, i) => (
                            <span key={i} style={{ fontSize:11.5, background:'var(--bg-white)', border:'1px solid var(--border)', padding:'1px 6px', borderRadius:10 }}>
                              {s}
                            </span>
                          ))}
                          <Badge label={log.severity} variant={severityVariant} />
                        </div>
                        <span style={{ fontSize:11.5, color:'var(--text-muted)' }}>{dateStr}</span>
                      </div>
                      {log.notes && (
                        <p style={{ fontSize:12, fontStyle:'italic', color:'var(--text-secondary)', marginTop:4, marginBottom:0 }}>"{log.notes}"</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Prescriptions — compact changelog summary */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Prescriptions / Drug Changes</h3>
            </div>
            {prescriptions.length===0 ? (
              <p style={{ color:'var(--text-muted)', fontSize:13.5, padding:'12px 0' }}>
                No prescriptions added yet. Prescriptions are added through the Drug Chart in Patient Log.
              </p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {prescriptions.slice().reverse().map(rx=>(
                  <div key={rx.id} style={{ padding:'6px 10px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontWeight:700, fontSize:12.5, color:'var(--primary)' }}>{rx.date}</span>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                      {rx.drugs && rx.drugs.length > 0 ? (
                        rx.drugs.map((d,i)=>{
                          const isStopped = d.changeType === 'Stopped' || !!d.endDate;
                          const isModified = d.changeType === 'Modified';
                          
                          return (
                            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12.5 }}>
                              {isStopped ? (
                                <span style={{ color:'var(--accent-red)', fontWeight:500 }}>
                                  🛑 Stopped: <span style={{ textDecoration:'line-through', color:'var(--text-primary)' }}>{d.drug}</span>
                                </span>
                              ) : isModified ? (
                                <span style={{ color:'var(--accent-orange)', fontWeight:500 }}>
                                  🔄 Modified: <span style={{ color:'var(--text-primary)' }}>{d.drug}</span> ({d.dose} · {d.frequency})
                                </span>
                              ) : (
                                <span style={{ color:'var(--accent-green)', fontWeight:500 }}>
                                  ➕ Added: <span style={{ color:'var(--text-primary)' }}>{d.drug}</span> ({d.dose} · {d.frequency} · {d.duration})
                                </span>
                              )}
                              {d.notes && <span style={{ fontSize:11, color:'var(--text-muted)', fontStyle:'italic' }}>({d.notes})</span>}
                            </div>
                          );
                        })
                      ) : (
                        <span style={{ fontSize:12.5, color:'var(--text-muted)' }}>No drug changes in this appointment.</span>
                      )}
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
      {selectedLogDate && (
        <LogViewPopup
          logs={selectedLogsForPopup}
          date={selectedLogDate}
          onClose={() => { setSelectedLogDate(null); setSelectedLogsForPopup([]); }}
        />
      )}
    </div>
  );
}
