const fs = require('fs');
let content = fs.readFileSync('server/server.js', 'utf8');

const search = `await db_firebase.collection('users').doc(patient.firebaseUid)
                  .collection('medications').doc(medId)
                  .set({ endDate: Date.now() }, { merge: true });`;

const repl = `const medsSnapshot = await db_firebase.collection('users').doc(patient.firebaseUid)
                  .collection('medications').where('name', '==', drug.drug).get();
                if (!medsSnapshot.empty) {
                  medsSnapshot.forEach(async (doc) => {
                    await doc.ref.set({ endDate: Date.now() }, { merge: true });
                  });
                }`;

content = content.replace(search, repl);
content = content.replace(search.replace(/\n/g, "\r\n"), repl);
fs.writeFileSync('server/server.js', content);
