const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// 1.
const s1 = `await dbHelpers.run(
      'INSERT INTO patient_logs (id, patientId, doctorId, doctorName, date, examination, drugs, investigations) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, patientId, doctorId, doctorName, date, examStr, drugsStr, invStr]
    );`;

const r1 = `const nextInvStr = nextSessionInvestigations ? JSON.stringify(nextSessionInvestigations) : null;
    await dbHelpers.run(
      'INSERT INTO patient_logs (id, patientId, doctorId, doctorName, date, examination, drugs, investigations, nextSessionInvestigations, nextSessionNotes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, patientId, doctorId, doctorName, date, examStr, drugsStr, invStr, nextInvStr, nextSessionNotes || null]
    );`;

// 2.
const s2 = `await dbHelpers.run(
          "UPDATE appointments SET investigations = ?, investigationNotes = ? WHERE id = ?",
          [invsJson, nextSessionNotes || null, nextAppt.id]
        );`;

const r2 = `await dbHelpers.run(
          "UPDATE appointments SET investigations = ?, investigationNotes = ? WHERE id = ?",
          [invsJson, nextSessionNotes || null, nextAppt.id]
        );
        await dbHelpers.run("UPDATE patient_logs SET investigationsAttached = 1 WHERE id = ?", [id]);`;

// 3.
const s3 = `await dbHelpers.run(
        \`INSERT INTO appointments (id, patientId, patientName, doctorId, doctorName, date, time, type, status, details, duration, investigations, investigationNotes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
        [id, patientId, patientName, doctorId, doctorName, date, time, type || 'Consultation', status || 'Pending', details || '', duration || 30, JSON.stringify(investigations || []), investigationNotes || null]
      );`;

const r3 = `let finalInvs = investigations || [];
      let finalInvNotes = investigationNotes || null;

      if (finalInvs.length === 0) {
        const lastLog = await dbHelpers.get('SELECT * FROM patient_logs WHERE patientId = ? ORDER BY id DESC LIMIT 1', [patientId]);
        if (lastLog && lastLog.investigationsAttached === 0 && lastLog.nextSessionInvestigations) {
          finalInvs = JSON.parse(lastLog.nextSessionInvestigations);
          finalInvNotes = lastLog.nextSessionNotes;
          await dbHelpers.run("UPDATE patient_logs SET investigationsAttached = 1 WHERE id = ?", [lastLog.id]);
        }
      }

      await dbHelpers.run(
        \`INSERT INTO appointments (id, patientId, patientName, doctorId, doctorName, date, time, type, status, details, duration, investigations, investigationNotes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
        [id, patientId, patientName, doctorId, doctorName, date, time, type || 'Consultation', status || 'Pending', details || '', duration || 30, JSON.stringify(finalInvs), finalInvNotes]
      );`;

// 4.
const s4 = `investigations: investigations || [],
          investigationNotes: investigationNotes || null,`;

const r4 = `investigations: typeof finalInvs !== 'undefined' ? finalInvs : (investigations || []),
          investigationNotes: typeof finalInvNotes !== 'undefined' ? finalInvNotes : (investigationNotes || null),`;


// 5.
const s5 = `investigations: JSON.parse(l.investigations)`;

const r5 = `investigations: JSON.parse(l.investigations),
        nextSessionInvestigations: l.nextSessionInvestigations ? JSON.parse(l.nextSessionInvestigations) : [],
        nextSessionNotes: l.nextSessionNotes`;


if (content.includes(s1)) {
  content = content.replace(s1, r1);
  console.log('1 replaced');
}
if (content.includes(s2)) {
  content = content.replace(s2, r2);
  console.log('2 replaced');
}
if (content.includes(s3)) {
  content = content.replace(s3, r3);
  console.log('3 replaced');
}
if (content.includes(s4)) {
  content = content.replace(s4, r4);
  console.log('4 replaced');
}
if (content.includes(s5)) {
  content = content.replace(new RegExp(s5.replace(/[.*+?^$\{}()|[\\]\\\\]/g, '\\\\$&'), 'g'), r5);
  console.log('5 replaced');
}

fs.writeFileSync('server.js', content);
console.log('Done!');
