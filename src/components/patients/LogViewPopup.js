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
        <div style={{ flex: 1, minHeight: 0, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:20 }}>
          {(() => {
            const mergedExamination = {};
            const drugMap = new Map();
            const investMap = new Map();
            let latestDoctorName = '';

            const nextInvestMap = new Map();
            let mergedNextSessionNotes = '';

            logs.forEach(log => {
              if (log.doctorName) latestDoctorName = log.doctorName;
              if (log.examination) {
                if (log.examination.chiefComplaint) mergedExamination.chiefComplaint = log.examination.chiefComplaint;
                if (log.examination.clinicalFindings) mergedExamination.clinicalFindings = log.examination.clinicalFindings;
                if (log.examination.diagnosis) mergedExamination.diagnosis = log.examination.diagnosis;
                if (log.examination.plan) mergedExamination.plan = log.examination.plan;
                ['bp','pulse','temp','spo2','weight','height'].forEach(f => {
                   if (log.examination[f]) mergedExamination[f] = log.examination[f];
                });
              }
              if (log.drugs) {
                log.drugs.forEach(d => {
                   if(d.drug) drugMap.set(d.drug.toLowerCase().trim(), d);
                });
              }
              if (log.investigations) {
                log.investigations.forEach(i => {
                   const key = (i.type || i.investigation || '').toLowerCase().trim();
                   if(key) investMap.set(key, i);
                });
              }
              if (log.nextSessionInvestigations) {
                log.nextSessionInvestigations.forEach(i => {
                   // It might be a string or an object depending on legacy code
                   const invStr = typeof i === 'string' ? i : (i.type || i.investigation || '');
                   const key = invStr.toLowerCase().trim();
                   if(key) nextInvestMap.set(key, invStr);
                });
              }
              if (log.nextSessionNotes) {
                mergedNextSessionNotes = log.nextSessionNotes;
              }
            });

            const mergedDrugs = Array.from(drugMap.values());
            const mergedInvestigations = Array.from(investMap.values());
            const mergedNextInvestigations = Array.from(nextInvestMap.values());
            const hasExamination = Object.keys(mergedExamination).length > 0;

            return (
              <div style={{ border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
                <div style={{ background:'var(--bg-base)', padding:'10px 16px', display:'flex', alignItems:'center', gap:12 }}>
                  <User size={14} color="var(--primary)" />
                  <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{latestDoctorName}</span>
                  <Calendar size={13} color="var(--text-muted)" />
                  <span style={{ fontSize:12.5, color:'var(--text-muted)' }}>{date}</span>
                </div>

                <div style={{ padding:16, display:'flex', flexDirection:'column', gap:16 }}>
                  {hasExamination && (
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
                        <Stethoscope size={15} color="var(--primary)" />
                        <p style={{ fontSize:13.5, fontWeight:700, color:'var(--primary)' }}>Examination</p>
                      </div>
                      {mergedExamination.chiefComplaint && (
                        <div className="info-row"><span className="info-label">Chief Complaint</span><span className="info-value">{mergedExamination.chiefComplaint}</span></div>
                      )}
                      {(mergedExamination.bp || mergedExamination.pulse || mergedExamination.temp || mergedExamination.spo2 || mergedExamination.weight || mergedExamination.height) && (
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, margin:'10px 0', background:'var(--primary-light)', padding:10, borderRadius:'var(--radius-md)' }}>
                          {[['BP','bp','mmHg'],['Pulse','pulse','bpm'],['Temp','temp','°C'],['SpO₂','spo2','%'],['Weight','weight','kg'],['Height','height','cm']].map(([label,field,unit])=>
                            mergedExamination[field] ? (
                              <div key={field} style={{ textAlign:'center' }}>
                                <p style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600 }}>{label}</p>
                                <p style={{ fontSize:14, fontWeight:700, color:'var(--primary)' }}>{mergedExamination[field]} <span style={{ fontSize:10 }}>{unit}</span></p>
                              </div>
                            ) : null
                          )}
                        </div>
                      )}
                      {mergedExamination.clinicalFindings && (
                        <div className="info-row"><span className="info-label">Clinical Findings</span><span className="info-value">{mergedExamination.clinicalFindings}</span></div>
                      )}
                      {mergedExamination.diagnosis && (
                        <div className="info-row">
                          <span className="info-label">Diagnosis</span>
                          <span className="info-value" style={{ color:'var(--accent-red)', fontWeight:600 }}>{mergedExamination.diagnosis}</span>
                        </div>
                      )}
                      {mergedExamination.plan && (
                        <div className="info-row"><span className="info-label">Plan</span><span className="info-value">{mergedExamination.plan}</span></div>
                      )}
                    </div>
                  )}

                  {mergedDrugs.length > 0 && (
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
                        <Pill size={15} color="var(--secondary)" />
                        <p style={{ fontSize:13.5, fontWeight:700, color:'var(--secondary)' }}>Drug Chart ({mergedDrugs.length})</p>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        {mergedDrugs.map((d, i) => (
                          <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 12px', background:'var(--secondary-light)', borderRadius:'var(--radius-md)', flexWrap:'wrap' }}>
                            <span style={{ fontWeight:700, fontSize:13, color:'var(--text-primary)', minWidth:100 }}>{d.drug}</span>
                            {d.dose && <span className="badge badge-secondary">{d.dose}</span>}
                            {d.frequency && <span style={{ fontSize:12, color:'var(--text-muted)' }}>{d.frequency}</span>}
                            {d.duration && <span style={{ fontSize:12, color:'var(--text-muted)' }}>for {d.duration}</span>}
                            {d.mealInstruction && <span className="badge badge-muted">{d.mealInstruction}</span>}
                            {d.notes && <span style={{ fontSize:11.5, color:'var(--text-muted)', fontStyle:'italic' }}>{d.notes}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mergedInvestigations.length > 0 && (
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
                        <FlaskConical size={15} color="var(--accent-orange)" />
                        <p style={{ fontSize:13.5, fontWeight:700, color:'var(--accent-orange)' }}>Investigations ({mergedInvestigations.length})</p>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        {mergedInvestigations.map((inv, i) => (
                          <div key={i} style={{ padding:'8px 12px', background:'var(--accent-orange-light)', borderRadius:'var(--radius-md)' }}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                              <span style={{ fontWeight:700, fontSize:13 }}>{inv.type || inv.investigation}</span>
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
                
                  {mergedNextInvestigations.length > 0 && (
                    <div style={{ marginTop: 8, padding: 12, background:'var(--primary-light)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}>
                      <p style={{ fontSize:13, fontWeight:700, color:'var(--primary)', marginBottom:6 }}>What to Bring Next Time</p>
                      <ul style={{ margin:0, paddingLeft:16, fontSize:12.5, color:'var(--text-secondary)' }}>
                        {mergedNextInvestigations.map((inv, idx) => (
                          <li key={idx}>{typeof inv === 'string' ? inv : (inv.type || inv.investigation)}</li>
                        ))}
                      </ul>
                      {mergedNextSessionNotes && (
                        <p style={{ fontSize:12, marginTop:6, color:'var(--text-muted)', fontStyle:'italic' }}>Note: {mergedNextSessionNotes}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
