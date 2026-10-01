const fs = require('fs');

let content = fs.readFileSync('src/components/patients/LogViewPopup.js', 'utf-8');

// 1. Update extraction logic
content = content.replace(
  "mergedExamination.diagnosis = log.examination.diagnosis;",
  "mergedExamination.diagnosis = log.examination.diagnosis;\n                  ['generalExamination', 'cardiovascular', 'respiratory', 'nervous', 'locomotor', 'gastrointestinal', 'additional'].forEach(k => { if (log.examination[k]) mergedExamination[k] = log.examination[k]; });"
);

// 2. Update rendering logic
const target = "{mergedExamination.clinicalFindings && (";
const middle = `{mergedExamination.generalExamination && <div className="info-row"><span className="info-label">General</span><span className="info-value">{mergedExamination.generalExamination}</span></div>}
                        {mergedExamination.cardiovascular && <div className="info-row"><span className="info-label">Cardio</span><span className="info-value">{mergedExamination.cardiovascular}</span></div>}
                        {mergedExamination.respiratory && <div className="info-row"><span className="info-label">Resp</span><span className="info-value">{mergedExamination.respiratory}</span></div>}
                        {mergedExamination.nervous && <div className="info-row"><span className="info-label">Nervous</span><span className="info-value">{mergedExamination.nervous}</span></div>}
                        {mergedExamination.locomotor && <div className="info-row"><span className="info-label">Locomotor</span><span className="info-value">{mergedExamination.locomotor}</span></div>}
                        {mergedExamination.gastrointestinal && <div className="info-row"><span className="info-label">Gastro</span><span className="info-value">{mergedExamination.gastrointestinal}</span></div>}
                        {mergedExamination.additional && <div className="info-row"><span className="info-label">Additional</span><span className="info-value">{mergedExamination.additional}</span></div>}
                        `;

content = content.replace(target, middle + target);

fs.writeFileSync('src/components/patients/LogViewPopup.js', content, 'utf-8');
console.log("Updated via Node.js!");
