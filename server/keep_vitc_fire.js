const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function run() {
  try {
    // Pabasara's UID
    const uid = 'gzf63HMG30OBpsqp1M1RTXHly433';
    
    const medsSnap = await db.collection('users').doc(uid).collection('medications').get();
    let deleted = 0;
    
    for (const medDoc of medsSnap.docs) {
        const data = medDoc.data();
        const name = (data.name || '').toLowerCase().trim();
        
        if (name !== 'vit c') {
            await medDoc.ref.delete();
            console.log(`Deleted med: ${name} from Firestore`);
            deleted++;
        }
    }
    console.log(`Deleted ${deleted} items from Firestore.`);
  } catch (err) {
    console.error(err);
  }
}
run();
