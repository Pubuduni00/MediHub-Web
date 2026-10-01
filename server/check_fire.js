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
    
    const ptRes = await pool.query("SELECT \"firebaseUid\" FROM patients WHERE id = 'PT011'");
    const uid = ptRes.rows[0]?.firebaseUid;
    pool.end();
    
    if (!uid) return;

    // List Appointments
    const appts = await db.collection('users').doc(uid).collection('appointments').get();
    console.log(`\nFound ${appts.docs.length} appointments in Firestore for PT011:`);
    appts.docs.forEach(d => console.log(d.id, d.data().date));

    // List Medications
    const meds = await db.collection('users').doc(uid).collection('medications').get();
    console.log(`\nFound ${meds.docs.length} meds in Firestore for PT011:`);
    meds.docs.forEach(d => console.log(d.id, d.data().name, new Date(d.data().startDate).toISOString()));

  } catch (err) {
    console.error(err);
  }
}
run();
