const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function run() {
  try {
    const uid = 'gzf63HMG30OBpsqp1M1RTXHly433'; // From query

    const appts = await db.collection('users').doc(uid).collection('appointments').get();
    let dAppt = 0;
    for (const d of appts.docs) {
        if (d.data().date === '2026-09-29') {
            await d.ref.delete();
            dAppt++;
        }
    }
    console.log(`Deleted ${dAppt} appointments for 29th.`);

    const meds = await db.collection('users').doc(uid).collection('medications').get();
    let dMed = 0;
    for (const d of meds.docs) {
        const dObj = new Date(d.data().startDate);
        // Sept 29th or later
        if (dObj.getTime() >= new Date('2026-09-29T00:00:00.000Z').getTime()) {
            await d.ref.delete();
            dMed++;
        }
    }
    console.log(`Deleted ${dMed} meds that started on or after 29th.`);

  } catch (err) {
    console.error(err);
  }
}
run();
