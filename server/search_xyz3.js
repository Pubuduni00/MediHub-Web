const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.urwvnktzzurseobjcmxn:Jjzu95Fy5026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const logsRes = await pool.query("SELECT id, date, patientid, drugs FROM patient_logs WHERE patientid = 'PT011' AND drugs ILIKE '%xyz%'");
    console.log('\nLogs with xyz for PT011:', logsRes.rows);

    const presRes = await pool.query("SELECT id, date, patientid, drugs FROM prescriptions WHERE patientid = 'PT011' AND drugs ILIKE '%xyz%'");
    console.log('\nPrescriptions with xyz for PT011:', presRes.rows);

  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
