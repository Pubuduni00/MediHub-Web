const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.urwvnktzzurseobjcmxn:Jjzu95Fy5026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    // Check what is currently there
    const res = await pool.query("SELECT drugs FROM patient_logs WHERE id = 'LOG012'");
    console.log('Before update:', res.rows[0]);
    
    // Set drugs to empty array
    await pool.query("UPDATE patient_logs SET drugs = '[]' WHERE id = 'LOG012'");
    console.log('Successfully removed xyz from LOG012 in PostgreSQL!');
    
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
