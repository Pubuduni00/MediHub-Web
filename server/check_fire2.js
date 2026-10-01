const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function run() {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres.urwvnktzzurseobjcmxn:Jjzu95Fy5026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
      ssl: { rejectUnauthorized: false }
    });
    
    const ptRes = await pool.query("SELECT firebaseuid FROM patients WHERE id = 'PT011'");
    const uid = ptRes.rows[0]?.firebaseuid;
    pool.end();
    
    if (!uid) { console.log('no uid'); return; }

    const appts = await db.collection('users').doc(uid).collection('appointments').get();
    console.log(`\nFound ${appts.docs.length} appts:`);
    appts.docs.forEach(d => { if (d.data().date === '2026-09-29') console.log('DELETE APP:', d.id); });

    const meds = await db.collection('users').doc(uid).collection('medications').get();
    console.log(`\nFound ${meds.docs.length} meds:`);
    meds.docs.forEach(d => {
        const dObj = new Date(d.data().startDate);
        console.log(d.id, d.data().name, dObj.toISOString());
    });

  } catch (err) {
    console.error(err);
  }
}
run();
