const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// 1. Replace INSERT
content = content.replace(
  /await dbHelpers\.run\([\s\S]*?'INSERT INTO patient_logs \(id, patientId, doctorId, doctorName, date, examination, drugs, investigations\) VALUES \(\?, \?, \?, \?, \?, \?, \?, \?\)',[\s\S]*?\[id, patientId, doctorId, doctorName, date, examStr, drugsStr, invStr\][\s\S]*?\);/,
  `const nextInvStr = nextSessionInvestigations ? JSON.stringify(nextSessionInvestigations) : null;
      await dbHelpers.run(
        'INSERT INTO patient_logs (id, patientId, doctorId, doctorName, date, examination, drugs, investigations, nextSessionInvestigations, nextSessionNotes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, patientId, doctorId, doctorName, date, examStr, drugsStr, invStr, nextInvStr, nextSessionNotes || null]
      );`
);

// 2. Replace attach inside POST /api/patient-logs
content = content.replace(
  /await dbHelpers\.run\([\s\S]*?"UPDATE appointments SET investigations = \?, investigationNotes = \? WHERE id = \?",[\s\S]*?\[invsJson, nextSessionNotes \|\| null, nextAppt\.id\][\s\S]*?\);/,
  `await dbHelpers.run(
            "UPDATE appointments SET investigations = ?, investigationNotes = ? WHERE id = ?",
            [invsJson, nextSessionNotes || null, nextAppt.id]
          );
          await dbHelpers.run("UPDATE patient_logs SET investigationsAttached = 1 WHERE id = ?", [id]);`
);

// 3. Replace POST /api/appointments insert
content = content.replace(
  /await dbHelpers\.run\([\s\S]*?`INSERT INTO appointments \(id, patientId, patientName, doctorId, doctorName, date, time, type, status, details, duration, investigations, investigationNotes\)[\s\S]*?VALUES \(\?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?\)`,[\s\S]*?\[id, patientId, patientName, doctorId, doctorName, date, time, type \|\| 'Consultation', status \|\| 'Pending', details \|\| '', duration \|\| 30, JSON\.stringify\(investigations \|\| \[\]\), investigationNotes \|\| null\][\s\S]*?\);/,
  `let finalInvs = investigations || [];
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
      );`
);

// 4. Update the sync payload inside POST /api/appointments
content = content.replace(
  /investigations: investigations \|\| \[\],\s*investigationNotes: investigationNotes \|\| null,/g,
  `investigations: typeof finalInvs !== 'undefined' ? finalInvs : (investigations || []),
          investigationNotes: typeof finalInvNotes !== 'undefined' ? finalInvNotes : (investigationNotes || null),`
);

fs.writeFileSync('server.js', content);
console.log('Done!');
