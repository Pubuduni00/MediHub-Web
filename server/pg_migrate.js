const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: 'postgresql://postgres:pubuduni2023!@db.shkngqicysdsqmryxmds.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await pool.query('ALTER TABLE patient_logs ADD COLUMN nextSessionInvestigations TEXT;');
    console.log('Added nextSessionInvestigations');
  } catch(e) { console.log('col1:', e.message); }
  
  try {
    await pool.query('ALTER TABLE patient_logs ADD COLUMN nextSessionNotes TEXT;');
    console.log('Added nextSessionNotes');
  } catch(e) { console.log('col2:', e.message); }

  try {
    await pool.query('ALTER TABLE patient_logs ADD COLUMN investigationsAttached INTEGER DEFAULT 0;');
    console.log('Added investigationsAttached');
  } catch(e) { console.log('col3:', e.message); }
  
  pool.end();
}
run();
