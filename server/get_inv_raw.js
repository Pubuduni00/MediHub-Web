const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.urwvnktzzurseobjcmxn:Jjzu95Fy5026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query("SELECT id, investigations FROM patient_logs WHERE patientid = 'PT011' AND date = '2026-09-28'");
    res.rows.forEach(row => {
        console.log(row.id, row.investigations);
    });
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
