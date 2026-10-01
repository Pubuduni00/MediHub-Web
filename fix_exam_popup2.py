# -*- coding: utf-8 -*-
import re

with open('src/components/patients/LogViewPopup.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the extraction logic
search1 = r"""              logs.forEach(log => {
                if (log.doctorName) latestDoctorName = log.doctorName;
                if (log.examination) {
                  if (log.examination.chiefComplaint) mergedExamination.chiefComplaint = log.examination.chiefComplaint;
                  if (log.examination.clinicalFindings) mergedExamination.clinicalFindings = log.examination.clinicalFindings;
                  if (log.examination.diagnosis) mergedExamination.diagnosis = log.examination.diagnosis;
                  if (log.examination.plan) mergedExamination.plan = log.examination.plan;
                  ['bp','pulse','temp','spo2','weight','height'].forEach(f => {
                     if (log.examination[f]) mergedExamination[f] = log.examination[f];
                  });
                }"""

repl1 = r"""              logs.forEach(log => {
                if (log.doctorName) latestDoctorName = log.doctorName;
                if (log.examination) {
                  ['generalExamination', 'cardiovascular', 'respiratory', 'nervous', 'locomotor', 'gastrointestinal', 'additional', 'diagnosis', 'plan', 'chiefComplaint', 'clinicalFindings'].forEach(k => {
                     if (log.examination[k]) mergedExamination[k] = log.examination[k];
                  });
                  ['bp','pulse','temp','spo2','weight','height'].forEach(f => {
                     if (log.examination[f]) mergedExamination[f] = log.examination[f];
                  });
                }"""

if search1 in content:
    content = content.replace(search1, repl1)
else:
    print("search1 not found")


# 2. Update the rendering logic
search2 = r"""                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
                          <Stethoscope size={15} color="var(--primary)" />
                          <p style={{ fontSize:13.5, fontWeight:700, color:'var(--primary)' }}>Examination</p>
                        </div>
                        {mergedExamination.chiefComplaint && (
                          <div className="info-row"><span className="info-label">Chief Complaint</span><span className="info-value">{mergedExamination.chiefComplaint}</span></div>
                        )}
                        {(mergedExamination.bp || mergedExamination.pulse || mergedExamination.temp || mergedExamination.spo2 || mergedExamination.weight || mergedExamination.height) && (
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, margin:'10px 0', background:'var(--primary-light)', padding:10, borderRadius:'var(--radius-md)' }}>
                            {[['BP','bp','mmHg'],['Pulse','pulse','bpm'],['Temp','temp','°C'],['SpO2','spo2','%'],['Weight','weight','kg'],['Height','height','cm']].map(([label,field,unit])=>
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
                      </div>"""

repl2 = r"""                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
                          <Stethoscope size={15} color="var(--primary)" />
                          <p style={{ fontSize:13.5, fontWeight:700, color:'var(--primary)' }}>Examination</p>
                        </div>
                        {mergedExamination.chiefComplaint && (
                          <div className="info-row"><span className="info-label">Chief Complaint</span><span className="info-value">{mergedExamination.chiefComplaint}</span></div>
                        )}
                        {mergedExamination.generalExamination && (
                          <div className="info-row"><span className="info-label">General</span><span className="info-value">{mergedExamination.generalExamination}</span></div>
                        )}
                        {(mergedExamination.bp || mergedExamination.pulse || mergedExamination.temp || mergedExamination.spo2 || mergedExamination.weight || mergedExamination.height) && (
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, margin:'10px 0', background:'var(--primary-light)', padding:10, borderRadius:'var(--radius-md)' }}>
                            {[['BP','bp','mmHg'],['Pulse','pulse','bpm'],['Temp','temp','°C'],['SpO2','spo2','%'],['Weight','weight','kg'],['Height','height','cm']].map(([label,field,unit])=>
                              mergedExamination[field] ? (
                                <div key={field} style={{ textAlign:'center' }}>
                                  <p style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600 }}>{label}</p>
                                  <p style={{ fontSize:14, fontWeight:700, color:'var(--primary)' }}>{mergedExamination[field]} <span style={{ fontSize:10 }}>{unit}</span></p>
                                </div>
                              ) : null
                            )}
                          </div>
                        )}
                        {mergedExamination.cardiovascular && <div className="info-row"><span className="info-label">Cardio</span><span className="info-value">{mergedExamination.cardiovascular}</span></div>}
                        {mergedExamination.respiratory && <div className="info-row"><span className="info-label">Resp</span><span className="info-value">{mergedExamination.respiratory}</span></div>}
                        {mergedExamination.nervous && <div className="info-row"><span className="info-label">Nervous</span><span className="info-value">{mergedExamination.nervous}</span></div>}
                        {mergedExamination.locomotor && <div className="info-row"><span className="info-label">Locomotor</span><span className="info-value">{mergedExamination.locomotor}</span></div>}
                        {mergedExamination.gastrointestinal && <div className="info-row"><span className="info-label">Gastro</span><span className="info-value">{mergedExamination.gastrointestinal}</span></div>}
                        {mergedExamination.additional && <div className="info-row"><span className="info-label">Additional</span><span className="info-value">{mergedExamination.additional}</span></div>}
                        {mergedExamination.clinicalFindings && <div className="info-row"><span className="info-label">Clinical</span><span className="info-value">{mergedExamination.clinicalFindings}</span></div>}
                        {mergedExamination.diagnosis && (
                          <div className="info-row">
                            <span className="info-label">Diagnosis</span>
                            <span className="info-value" style={{ color:'var(--accent-red)', fontWeight:600 }}>{mergedExamination.diagnosis}</span>
                          </div>
                        )}
                        {mergedExamination.plan && (
                          <div className="info-row"><span className="info-label">Plan</span><span className="info-value">{mergedExamination.plan}</span></div>
                        )}
                      </div>"""

# Replace manually due to special chars potentially failing literal match
content = content.replace("mergedExamination.diagnosis = log.examination.diagnosis;", "mergedExamination.diagnosis = log.examination.diagnosis;\n                  ['generalExamination', 'cardiovascular', 'respiratory', 'nervous', 'locomotor', 'gastrointestinal', 'additional'].forEach(k => { if (log.examination[k]) mergedExamination[k] = log.examination[k]; });")

idx_start = content.find("{mergedExamination.chiefComplaint")
idx_end = content.find("{mergedExamination.clinicalFindings")

if idx_start != -1 and idx_end != -1:
    before = content[:idx_end]
    after = content[idx_end:]
    middle = """{mergedExamination.generalExamination && <div className="info-row"><span className="info-label">General</span><span className="info-value">{mergedExamination.generalExamination}</span></div>}
                        {mergedExamination.cardiovascular && <div className="info-row"><span className="info-label">Cardio</span><span className="info-value">{mergedExamination.cardiovascular}</span></div>}
                        {mergedExamination.respiratory && <div className="info-row"><span className="info-label">Resp</span><span className="info-value">{mergedExamination.respiratory}</span></div>}
                        {mergedExamination.nervous && <div className="info-row"><span className="info-label">Nervous</span><span className="info-value">{mergedExamination.nervous}</span></div>}
                        {mergedExamination.locomotor && <div className="info-row"><span className="info-label">Locomotor</span><span className="info-value">{mergedExamination.locomotor}</span></div>}
                        {mergedExamination.gastrointestinal && <div className="info-row"><span className="info-label">Gastro</span><span className="info-value">{mergedExamination.gastrointestinal}</span></div>}
                        {mergedExamination.additional && <div className="info-row"><span className="info-label">Additional</span><span className="info-value">{mergedExamination.additional}</span></div>}
                        """
    content = before + middle + after

with open('src/components/patients/LogViewPopup.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated examination rendering!")
