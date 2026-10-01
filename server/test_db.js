const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.urwvnktzzurseobjcmxn:Jjzu95Fy5026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const res = await pool.query('SELECT id, date, "nextsessioninvestigations" FROM patient_logs ORDER BY id DESC LIMIT 10');
  console.log(res.rows);
  pool.end();
}
run();
