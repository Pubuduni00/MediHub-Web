const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./medihub.db');

db.serialize(() => {
  db.run('ALTER TABLE patient_logs ADD COLUMN nextSessionInvestigations TEXT;', (err) => {
    if(err) console.log('col 1 err', err.message);
    else console.log('Added nextSessionInvestigations');
  });
  db.run('ALTER TABLE patient_logs ADD COLUMN nextSessionNotes TEXT;', (err) => {
    if(err) console.log('col 2 err', err.message);
    else console.log('Added nextSessionNotes');
  });
  db.run('ALTER TABLE patient_logs ADD COLUMN investigationsAttached INTEGER DEFAULT 0;', (err) => {
    if(err) console.log('col 3 err', err.message);
    else console.log('Added investigationsAttached');
  });
});
