const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.urwvnktzzurseobjcmxn:Jjzu95Fy5026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query("SELECT * FROM patient_logs WHERE CAST(examination AS TEXT) ILIKE '%xyz%' OR CAST(drugs AS TEXT) ILIKE '%xyz%' OR CAST(investigations AS TEXT) ILIKE '%xyz%'");
    console.log("Rows:", res.rows.length);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
