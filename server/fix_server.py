import re

with open('server.js', 'r', encoding='utf-8') as f:
    content = f.read()

s1_pattern = r"(await dbHelpers\.run\(\s*'INSERT INTO patient_logs \(id, patientId, doctorId, doctorName, date, examination, drugs, investigations\) VALUES \(\?, \?, \?, \?, \?, \?, \?, \?\)',\s*\[id, patientId, doctorId, doctorName, date, examStr, drugsStr, invStr\]\s*\);)"
s1_repl = r'''const nextInvStr = nextSessionInvestigations ? JSON.stringify(nextSessionInvestigations) : null;
    await dbHelpers.run(
      'INSERT INTO patient_logs (id, patientId, doctorId, doctorName, date, examination, drugs, investigations, nextSessionInvestigations, nextSessionNotes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, patientId, doctorId, doctorName, date, examStr, drugsStr, invStr, nextInvStr, nextSessionNotes || null]
    );'''
content = re.sub(s1_pattern, s1_repl, content)

s2_pattern = r"(await dbHelpers\.run\(\s*\"UPDATE appointments SET investigations = \?, investigationNotes = \? WHERE id = \?\",\s*\[invsJson, nextSessionNotes \|\| null, nextAppt\.id\]\s*\);)"
s2_repl = r'''await dbHelpers.run(
          "UPDATE appointments SET investigations = ?, investigationNotes = ? WHERE id = ?",
          [invsJson, nextSessionNotes || null, nextAppt.id]
        );
        await dbHelpers.run("UPDATE patient_logs SET investigationsAttached = 1 WHERE id = ?", [id]);'''
content = re.sub(s2_pattern, s2_repl, content)

s3_pattern = r"(await dbHelpers\.run\(\s*`INSERT INTO appointments \(id, patientId, patientName, doctorId, doctorName, date, time, type, status, details, duration, investigations, investigationNotes\)\s*VALUES \(\?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?\)`,\s*\[id, patientId, patientName, doctorId, doctorName, date, time, type \|\| 'Consultation', status \|\| 'Pending', details \|\| '', duration \|\| 30, JSON\.stringify\(investigations \|\| \[\]\), investigationNotes \|\| null\]\s*\);)"
s3_repl = r'''let finalInvs = investigations || [];
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
        `INSERT INTO appointments (id, patientId, patientName, doctorId, doctorName, date, time, type, status, details, duration, investigations, investigationNotes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, patientId, patientName, doctorId, doctorName, date, time, type || 'Consultation', status || 'Pending', details || '', duration || 30, JSON.stringify(finalInvs), finalInvNotes]
      );'''
content = re.sub(s3_pattern, s3_repl, content)

s4_pattern = r"(investigations:\s*investigations\s*\|\|\s*\[\],\s*investigationNotes:\s*investigationNotes\s*\|\|\s*null,)"
s4_repl = r'''investigations: typeof finalInvs !== 'undefined' ? finalInvs : (investigations || []),
          investigationNotes: typeof finalInvNotes !== 'undefined' ? finalInvNotes : (investigationNotes || null),'''
content = re.sub(s4_pattern, s4_repl, content)

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done python regex!')
