const fs = require('fs');
let content = fs.readFileSync('src/components/patients/LogViewPopup.js', 'utf8');

const replacement = `const nextInvestMap = new Map();
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
                   const key = (i.type || i.investigation || '').toLowerCase().trim();
                   if(key) nextInvestMap.set(key, i);
                });
              }
              if (log.nextSessionNotes) {
                mergedNextSessionNotes = log.nextSessionNotes;
              }
            });

            const mergedDrugs = Array.from(drugMap.values());
            const mergedInvestigations = Array.from(investMap.values());
            const mergedNextInvestigations = Array.from(nextInvestMap.values());
            const hasExamination = Object.keys(mergedExamination).length > 0;`;

content = content.replace(/logs\.forEach\(log => \{[\s\S]*?const hasExamination = Object\.keys\(mergedExamination\)\.length > 0;/, replacement);

const nextInvRender = `
                  {mergedNextInvestigations.length > 0 && (
                    <div style={{ marginTop: 8, padding: 12, background:'var(--primary-light)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}>
                      <p style={{ fontSize:13, fontWeight:700, color:'var(--primary)', marginBottom:6 }}>What to Bring Next Time</p>
                      <ul style={{ margin:0, paddingLeft:16, fontSize:12.5, color:'var(--text-secondary)' }}>
                        {mergedNextInvestigations.map((inv, idx) => (
                          <li key={idx}>{inv.type || inv.investigation}</li>
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
        </div>`;

content = content.replace(/<\/div>\s*<\/div>\s*\);\s*\}\)\(\)\}\s*<\/div>/, nextInvRender);

fs.writeFileSync('src/components/patients/LogViewPopup.js', content);
console.log('Popup updated');
