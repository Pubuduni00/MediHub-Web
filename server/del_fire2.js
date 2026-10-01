const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

async function run() {
  try {
    const usersSnap = await db.collection('users').get();
    let deleted = 0;
    
    for (const userDoc of usersSnap.docs) {
        const medsSnap = await db.collection('users').doc(userDoc.id).collection('medications').get();
        for (const medDoc of medsSnap.docs) {
            const data = medDoc.data();
            if (data.name === 'xyz' || medDoc.id.includes('xyz')) {
                await medDoc.ref.delete();
                console.log(`Deleted med xyz from user ${userDoc.id}`);
                deleted++;
            }
        }
    }
    console.log(`Deleted ${deleted} items from Firestore.`);
  } catch (err) {
    console.error(err);
  }
}
run();
