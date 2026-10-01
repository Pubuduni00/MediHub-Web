const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.urwvnktzzurseobjcmxn:Jjzu95Fy5026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query("SELECT id, drugs, investigations FROM patient_logs WHERE patientid = 'PT011' AND date = '2026-09-28'");
    console.log(`Found ${res.rows.length} log entries for PT011 on 2026-09-28.\n`);
    
    let allDrugs = [];
    let allInvs = [];

    res.rows.forEach(row => {
      try {
        const d = JSON.parse(row.drugs || '[]');
        const i = JSON.parse(row.investigations || '[]');
        allDrugs.push(...d);
        allInvs.push(...i);
      } catch(e) {}
    });

    console.log('--- DRUGS ---');
    allDrugs.forEach(d => console.log(`- ${d.drug} (${d.type || 'Added/Modified'})`));
    
    console.log('\n--- INVESTIGATIONS ---');
    allInvs.forEach(i => console.log(`- ${i.type || i.investigation} (Status: ${i.status})`));

  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
