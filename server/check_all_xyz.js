const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.urwvnktzzurseobjcmxn:Jjzu95Fy5026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const logsRes = await pool.query("SELECT id, patientid, drugs FROM patient_logs WHERE drugs ILIKE '%xyz%'");
    console.log("Logs with xyz:", logsRes.rows);
    const presRes = await pool.query("SELECT id, patientid, drugs FROM prescriptions WHERE drugs ILIKE '%xyz%'");
    console.log("Prescriptions with xyz:", presRes.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
