import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Pill, FileText, Phone, Mail, MapPin, User, Droplets, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { format } from 'date-fns';
import PatientCalendar from '../components/patients/PatientCalendar';
import PatientLogModal from '../components/patients/PatientLogModal';
import AddPrescriptionModal from '../components/patients/AddPrescriptionModal';
import MedicalReportGenerator from '../components/patients/MedicalReportGenerator';
import Badge from '../components/common/Badge';
import './PatientProfilePage.css';

export default function PatientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDoctor } = useAuth();
  const { getPatientById, getLogsForPatient, getPrescriptionsForPatient, doctors } = useData();

  const patient = getPatientById(id);
  const [showLog, setShowLog] = useState(false);
  const [showRx, setShowRx] = useState(false);

  if (!patient) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>Patient not found.</p>
      <button className="btn btn-primary mt-4" onClick={() => navigate('/patients')}>Back to Patients</button>
    </div>
  );

  const logs = getLogsForPatient(id);
  const prescriptions = getPrescriptionsForPatient(id);
  const initials = patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const assignedDoctorNames = (patient.assignedDoctors || []).map(dId => doctors.find(d => d.id === dId)?.name).filter(Boolean);

  return (
    <div>
      {/* Back */}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        <ArrowLeft size={14} /> Back
      </button>

      <div className="profile-layout">
        {/* Sidebar */}
        <div className="profile-sidebar">
          {/* Header Card */}
          <div className="profile-header-card">
            <div className="profile-avatar-xl">{initials}</div>
            <p className="profile-name">{patient.name}</p>
            <p className="profile-id">ID: {patient.id}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>{patient.gender}</span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>{patient.age} years</span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{patient.bloodGroup}</span>
            </div>
            <div className="profile-actions">
              {isDoctor && (
                <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} onClick={() => setShowLog(true)}>
                  <ClipboardList size={13} /> Patient Log
                </button>
              )}
              <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} onClick={() => setShowRx(true)}>
                <Pill size={13} /> Add Prescription
              </button>
            </div>
          </div>

          {/* Personal Info */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">Personal Details</h3></div>
            <div>
              {[
                { icon: User, label: 'Date of Birth', val: patient.dob || 'N/A' },
                { icon: Droplets, label: 'Blood Group', val: patient.bloodGroup, red: true },
                { icon: Phone, label: 'Phone', val: patient.phone },
                { icon: Mail, label: 'Email', val: patient.email || 'N/A' },
                { icon: MapPin, label: 'Address', val: patient.address || 'N/A' },
                { icon: User, label: 'NIC', val: patient.nic || 'N/A' },
              ].map((item, i) => (
                <div key={i} className="info-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 130 }}>
                    <item.icon size={13} color="var(--text-muted)" />
                    <span className="info-label" style={{ minWidth: 'unset' }}>{item.label}</span>
                  </div>
                  <span className="info-value" style={item.red ? { color: 'var(--accent-red)', fontWeight: 700 } : {}}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency */}
          {patient.emergencyName && (
            <div className="card">
              <div className="card-header"><h3 className="card-title">Emergency Contact</h3></div>
              <div className="info-row"><span className="info-label">Name</span><span className="info-value">{patient.emergencyName}</span></div>
              <div className="info-row"><span className="info-label">Phone</span><span className="info-value">{patient.emergencyContact}</span></div>
            </div>
          )}

          {/* Assigned Doctors */}
          <div className="card">
            <div className="card-header"><h3 className="card-title"><Stethoscope size={14} style={{ marginRight: 6 }} />Assigned Doctors</h3></div>
            {assignedDoctorNames.length === 0
              ? <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No doctors assigned yet.</p>
              : assignedDoctorNames.map((name, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="avatar avatar-sm" style={{ fontSize: 10 }}>{name.split(' ').filter((_,idx)=>idx>0).map(n=>n[0]).join('').slice(0,2)}</div>
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>{name}</span>
                </div>
              ))
            }
          </div>

          {/* Medical Report */}
          <div className="card" style={{ padding: 16 }}>
            <MedicalReportGenerator patient={patient} />
            {!isDoctor && <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 7 }}>Only doctors can download medical reports.</p>}
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-main">
          {/* Status Bar */}
          <div className="card" style={{ padding: '14px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{logs.length}</p>
                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Visit Logs</p>
                </div>
                <div style={{ width: 1, background: 'var(--border)' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>{prescriptions.length}</p>
                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Prescriptions</p>
                </div>
                <div style={{ width: 1, background: 'var(--border)' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-green)' }}>{patient.assignedDoctors?.length || 0}</p>
                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Doctors</p>
                </div>
              </div>
              <Badge label={patient.status} variant={patient.status === 'Active' ? 'success' : 'muted'} dot />
            </div>
          </div>

          {/* Visit Calendar */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Visit Calendar</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Green = visit day · Click to view log</p>
            </div>
            <PatientCalendar patientId={id} />
          </div>

          {/* Recent Logs */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Logs</h3>
              {isDoctor && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowLog(true)}>
                  <ClipboardList size={13} /> Add Log
                </button>
              )}
            </div>
            {logs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13.5, padding: '12px 0' }}>No logs recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {logs.slice().reverse().slice(0, 5).map(log => (
                  <div key={log.id} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-base)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <p style={{ fontWeight: 600, fontSize: 13.5 }}>{log.examination?.diagnosis || 'Log Entry'}</p>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{log.date}</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{log.doctorName} · {log.drugs?.length || 0} drug(s) · {log.investigations?.length || 0} investigation(s)</p>
                    {log.examination?.chiefComplaint && <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>{log.examination.chiefComplaint}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prescriptions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Prescriptions</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowRx(true)}>
                <Pill size={13} /> Add Prescription
              </button>
            </div>
            {prescriptions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13.5, padding: '12px 0' }}>No prescriptions added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {prescriptions.slice().reverse().map(rx => (
                  <div key={rx.id} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>Prescription {rx.id}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{rx.date}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {rx.drugs?.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{d.drug}</span>
                          <span className="badge badge-secondary">{d.dose}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.frequency} · {d.duration}</span>
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

      {/* Modals */}
      <PatientLogModal isOpen={showLog} onClose={() => setShowLog(false)} patientId={id} />
      <AddPrescriptionModal isOpen={showRx} onClose={() => setShowRx(false)} patientId={id} />
    </div>
  );
}
