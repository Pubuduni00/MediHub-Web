const fs = require('fs');
let content = fs.readFileSync('server/server.js', 'utf8');

const target = \const medId = \\\\\\_\\\\\\;

          if (drug.status === 'Stop') {
            // Stop in Firestore
            if (patient && patient.firebaseUid) {
              await db_firebase.collection('users').doc(patient.firebaseUid)
                .collection('medications').doc(medId)
                .set({ endDate: Date.now() }, { merge: true });
            }\;

const replacement = \if (drug.status === 'Stop') {
            // Stop in Firestore
            if (patient && patient.firebaseUid) {
              const medsSnapshot = await db_firebase.collection('users').doc(patient.firebaseUid)
                .collection('medications').where('name', '==', drug.drug).get();
              if (!medsSnapshot.empty) {
                medsSnapshot.forEach(async (doc) => {
                  await doc.ref.set({ endDate: Date.now() }, { merge: true });
                });
              }
            }\;

content = content.replace(target, replacement);
fs.writeFileSync('server/server.js', content);
