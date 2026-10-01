const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

const firebaseApp = initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore(firebaseApp);

const dbPath = path.resolve(__dirname, 'database.sqlite');
const sqlDb = new sqlite3.Database(dbPath);

sqlDb.all('SELECT firebase_uid FROM patients WHERE firebase_uid IS NOT NULL', async (err, rows) => {
  if (err || !rows) {
    process.exit(1);
  }
  let count = 0;
  for (const row of rows) {
    const uid = row.firebase_uid;
    const snapshot = await db.collection('users').doc(uid).collection('medications').get();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.name === 'abc' || data.name === 'dfg') {
        await doc.ref.set({ endDate: Date.now() }, { merge: true });
        console.log('Fixed', data.name, 'for uid', uid);
        count++;
      }
    }
  }
  console.log('Fixed', count, 'drugs');
  process.exit(0);
});
