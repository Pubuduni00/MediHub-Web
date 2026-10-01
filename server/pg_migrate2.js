const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.urwvnktzzurseobjcmxn:Jjzu95Fy5026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try { await pool.query('ALTER TABLE patient_logs ADD COLUMN nextSessionInvestigations TEXT;'); console.log('Added col1'); } catch(e) {}
  try { await pool.query('ALTER TABLE patient_logs ADD COLUMN nextSessionNotes TEXT;'); console.log('Added col2'); } catch(e) {}
  try { await pool.query('ALTER TABLE patient_logs ADD COLUMN investigationsAttached INTEGER DEFAULT 0;'); console.log('Added col3'); } catch(e) {}
  pool.end();
}
run();
