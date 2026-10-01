const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.urwvnktzzurseobjcmxn:Jjzu95Fy5026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const ptRes = await pool.query("SELECT * FROM patients WHERE id = 'PT011'");
    console.log(ptRes.rows[0]);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
