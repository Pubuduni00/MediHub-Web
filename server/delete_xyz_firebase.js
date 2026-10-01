const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db_firebase = admin.firestore();

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

    if (!uid) {
      console.log('No Firebase UID for Pabasara');
      return;
    }

    const medsRef = db_firebase.collection('users').doc(uid).collection('medications');
    const snapshot = await medsRef.get();
    
    let deleted = 0;
    snapshot.forEach(doc => {
      if (doc.data().name === 'xyz' || doc.id.includes('xyz')) {
        doc.ref.delete();
        console.log(`Deleted ${doc.id} from Firestore`);
        deleted++;
      }
    });
    console.log(`Finished checking Firestore. Deleted ${deleted} meds.`);
  } catch (err) {
    console.error(err);
  }
}
run();
