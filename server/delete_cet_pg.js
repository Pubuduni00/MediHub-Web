const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.urwvnktzzurseobjcmxn:Jjzu95Fy5026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const ptId = 'PT011';
    
    // Clean patient_logs
    const logsRes = await pool.query('SELECT id, drugs FROM patient_logs WHERE patientid = $1', [ptId]);
    for (const row of logsRes.rows) {
        if (!row.drugs) continue;
        let drugsArr = [];
        try { drugsArr = JSON.parse(row.drugs); } catch(e) { continue; }
        
        const filtered = drugsArr.filter(d => d.drug && d.drug.toLowerCase().trim() !== 'cetirizine');
        if (filtered.length !== drugsArr.length) {
            await pool.query('UPDATE patient_logs SET drugs = $1 WHERE id = $2', [JSON.stringify(filtered), row.id]);
            console.log(`Removed Cetirizine from patient_logs: ${row.id}`);
        }
    }

    // Clean prescriptions
    const presRes = await pool.query('SELECT id, drugs FROM prescriptions WHERE patientid = $1', [ptId]);
    for (const row of presRes.rows) {
        if (!row.drugs) continue;
        let drugsArr = [];
        try { drugsArr = JSON.parse(row.drugs); } catch(e) { continue; }
        
        const filtered = drugsArr.filter(d => d.drug && d.drug.toLowerCase().trim() !== 'cetirizine');
        if (filtered.length !== drugsArr.length) {
            await pool.query('UPDATE prescriptions SET drugs = $1 WHERE id = $2', [JSON.stringify(filtered), row.id]);
            console.log(`Removed Cetirizine from prescriptions: ${row.id}`);
        }
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
