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

sqlDb.get('SELECT firebase_uid FROM patients WHERE id = ?', ['PT011'], async (err, row) => {
  if (err || !row || !row.firebase_uid) {
    console.error('Patient not found or no firebase uid');
    process.exit(1);
  }
  const uid = row.firebase_uid;
  const snapshot = await db.collection('users').doc(uid).collection('medications').get();
  let count = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.name === 'abc' || data.name === 'dfg') {
      await doc.ref.set({ endDate: Date.now() }, { merge: true });
      console.log('Fixed', data.name);
      count++;
    }
  }
  console.log('Fixed', count, 'drugs');
  process.exit(0);
});
