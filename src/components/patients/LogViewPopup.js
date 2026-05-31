import React from 'react';
import { X, Stethoscope, Pill, FlaskConical, User, Calendar } from 'lucide-react';
import Badge from '../common/Badge';

export default function LogViewPopup({ logs, date, onClose }) {
  if (!logs || logs.length === 0) return null;

  return (
    <div style={{
      position:'fixed', inset:0,
      background:'rgba(10,33,55,0.45)', backdropFilter:'blur(4px)',
      zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20
    }}
      onClick={e => { if (e.target===e.currentTarget) onClose(); }}
    >
      <div style={{
        background:'var(--bg-white)', borderRadius:'var(--radius-xl)',
        boxShadow:'var(--shadow-xl)', width:'100%', maxWidth:700,
        maxHeight:'88vh', overflow:'hidden', display:'flex', flexDirection:'column',
        animation:'slideUp 0.2s ease'
      }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px 14px', borderBottom:'1px solid var(--border)', background:'var(--primary)', color:'#fff', borderRadius:'var(--radius-xl) var(--radius-xl) 0 0' }}>
          <div>
            <h3 style={{ fontSize:16, fontWeight:700 }}>Patient Log — {date}</h3>
            <p style={{ fontSize:12, opacity:0.85 }}>{logs.length} log entr{logs.length!==1?'ies':'y'} for this date</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:8, cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', padding:6 }}>
            <X size={16}/>
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:20 }}>
          {logs.map((log, idx) => (
            <div key={log.id} style={{ border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
              {/* Log Meta */}
              <div style={{ background:'var(--bg-base)', padding:'10px 16px', display:'flex', alignItems:'center', gap:12 }}>
                <User size={14} color="var(--primary)" />
                <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{log.doctorName}</span>
                <Calendar size={13} color="var(--text-muted)" />
                <span style={{ fontSize:12.5, color:'var(--text-muted)' }}>{log.date}</span>
                {logs.length > 1 && <span className="badge badge-primary">Entry {idx+1}</span>}
              </div>

              <div style={{ padding:16, display:'flex', flexDirection:'column', gap:16 }}>
                {/* Examination */}
                {log.examination && (
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
                      <Stethoscope size={15} color="var(--primary)" />
                      <p style={{ fontSize:13.5, fontWeight:700, color:'var(--primary)' }}>Examination</p>
                    </div>
                    {log.examination.chiefComplaint && (
                      <div className="info-row"><span className="info-label">Chief Complaint</span><span className="info-value">{log.examination.chiefComplaint}</span></div>
                    )}
                    {/* Vitals grid */}
                    {(log.examination.bp || log.examination.pulse || log.examination.temp || log.examination.spo2 || log.examination.weight || log.examination.height) && (
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, margin:'10px 0', background:'var(--primary-light)', padding:10, borderRadius:'var(--radius-md)' }}>
                        {[['BP','bp','mmHg'],['Pulse','pulse','bpm'],['Temp','temp','°C'],['SpO₂','spo2','%'],['Weight','weight','kg'],['Height','height','cm']].map(([label,field,unit])=>
                          log.examination[field] ? (
                            <div key={field} style={{ textAlign:'center' }}>
                              <p style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600 }}>{label}</p>
                              <p style={{ fontSize:14, fontWeight:700, color:'var(--primary)' }}>{log.examination[field]} <span style={{ fontSize:10 }}>{unit}</span></p>
                            </div>
                          ) : null
                        )}
                      </div>
                    )}
                    {log.examination.clinicalFindings && (
                      <div className="info-row"><span className="info-label">Clinical Findings</span><span className="info-value">{log.examination.clinicalFindings}</span></div>
                    )}
                    {log.examination.diagnosis && (
                      <div className="info-row">
                        <span className="info-label">Diagnosis</span>
                        <span className="info-value" style={{ color:'var(--accent-red)', fontWeight:600 }}>{log.examination.diagnosis}</span>
                      </div>
                    )}
                    {log.examination.plan && (
                      <div className="info-row"><span className="info-label">Plan</span><span className="info-value">{log.examination.plan}</span></div>
                    )}
                  </div>
                )}

                {/* Drugs */}
                {log.drugs && log.drugs.length > 0 && (
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
                      <Pill size={15} color="var(--secondary)" />
                      <p style={{ fontSize:13.5, fontWeight:700, color:'var(--secondary)' }}>Drug Chart ({log.drugs.length})</p>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {log.drugs.map((d, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 12px', background:'var(--secondary-light)', borderRadius:'var(--radius-md)', flexWrap:'wrap' }}>
                          <span style={{ fontWeight:700, fontSize:13, color:'var(--text-primary)', minWidth:100 }}>{d.drug}</span>
                          <span className="badge badge-secondary">{d.dose}</span>
                          <span style={{ fontSize:12, color:'var(--text-muted)' }}>{d.frequency}</span>
                          <span style={{ fontSize:12, color:'var(--text-muted)' }}>for {d.duration}</span>
                          <span className="badge badge-muted">{d.mealInstruction}</span>
                          {d.notes && <span style={{ fontSize:11.5, color:'var(--text-muted)', fontStyle:'italic' }}>{d.notes}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Investigations */}
                {log.investigations && log.investigations.length > 0 && (
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
                      <FlaskConical size={15} color="var(--accent-orange)" />
                      <p style={{ fontSize:13.5, fontWeight:700, color:'var(--accent-orange)' }}>Investigations ({log.investigations.length})</p>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {log.investigations.map((inv, i) => (
                        <div key={i} style={{ padding:'8px 12px', background:'var(--accent-orange-light)', borderRadius:'var(--radius-md)' }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                            <span style={{ fontWeight:700, fontSize:13 }}>{inv.type}</span>
                            <Badge label={inv.status} variant={inv.status==='Normal'?'success':inv.status==='Abnormal'?'danger':inv.status==='Critical'?'danger':'warning'} />
                          </div>
                          {inv.results && <p style={{ fontSize:12.5, color:'var(--text-secondary)' }}><strong>Result:</strong> {inv.results}</p>}
                          {inv.referenceRange && <p style={{ fontSize:12, color:'var(--text-muted)' }}>Ref: {inv.referenceRange}</p>}
                          {inv.notes && <p style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic' }}>{inv.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
