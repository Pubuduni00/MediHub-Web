const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

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
