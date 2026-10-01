const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.urwvnktzzurseobjcmxn:Jjzu95Fy5026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const patientsRes = await pool.query(SELECT id, name FROM patients WHERE name ILIKE '%pabasara%');
    console.log('Patients:', patientsRes.rows);

    const logsRes = await pool.query(SELECT id, date, "patientId", drugs FROM patient_logs WHERE drugs ILIKE '%xyz%');
    console.log('\nLogs with xyz:', logsRes.rows);

    const presRes = await pool.query(SELECT id, date, "patientId", drugs FROM prescriptions WHERE drugs ILIKE '%xyz%');
    console.log('\nPrescriptions with xyz:', presRes.rows);

  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
