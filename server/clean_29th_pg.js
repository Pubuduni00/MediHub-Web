const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.urwvnktzzurseobjcmxn:Jjzu95Fy5026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const ptId = 'PT011';
    const targetDate = '2026-09-29';
    
    // Delete Appointments
    const appts = await pool.query('DELETE FROM appointments WHERE patientId = $1 AND date = $2 RETURNING id', [ptId, targetDate]);
    console.log(`Deleted ${appts.rowCount} appointments from ${targetDate}`);

    // Delete Prescriptions
    const rx = await pool.query('DELETE FROM prescriptions WHERE patientId = $1 AND date = $2 RETURNING id', [ptId, targetDate]);
    console.log(`Deleted ${rx.rowCount} prescriptions from ${targetDate}`);

    // Delete Patient Logs
    const logs = await pool.query('DELETE FROM patient_logs WHERE patientId = $1 AND date = $2 RETURNING id', [ptId, targetDate]);
    console.log(`Deleted ${logs.rowCount} patient logs from ${targetDate}`);
    
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
