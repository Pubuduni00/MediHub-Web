const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.urwvnktzzurseobjcmxn:Jjzu95Fy5026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const logsRes = await pool.query("SELECT id, date, drugs, examination FROM patient_logs WHERE patientid = 'PT011'");
    logsRes.rows.forEach(row => {
        if (String(row.drugs).includes('xyz') || String(row.examination).includes('xyz')) {
            console.log(`Found xyz in LOG: ${row.id} on ${row.date}`);
            console.log(`Drugs:`, row.drugs);
        }
    });

    const presRes = await pool.query("SELECT id, date, drugs FROM prescriptions WHERE patientid = 'PT011'");
    presRes.rows.forEach(row => {
        if (String(row.drugs).includes('xyz')) {
            console.log(`Found xyz in PRESCRIPTION: ${row.id} on ${row.date}`);
            console.log(`Drugs:`, row.drugs);
        }
    });
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
