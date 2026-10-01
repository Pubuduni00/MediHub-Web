const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

const firebaseApp = initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore(firebaseApp);

async function run() {
  const usersSnapshot = await db.collection('users').get();
  let count = 0;
  for (const userDoc of usersSnapshot.docs) {
    const medsSnapshot = await userDoc.ref.collection('medications').get();
    for (const medDoc of medsSnapshot.docs) {
      const data = medDoc.data();
      if (data.name === 'abc' || data.name === 'dfg') {
        await medDoc.ref.set({ endDate: Date.now() }, { merge: true });
        console.log('Fixed', data.name, 'for uid', userDoc.id);
        count++;
      }
    }
  }
  console.log('Fixed total', count, 'drugs');
  process.exit(0);
}
run();
