const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const outputDir = path.join(__dirname, '../../data');

async function exportCollection(name) {
  const snapshot = await db.collection(name).get();
  const data = [];

  snapshot.forEach(doc => {
    data.push({
      _id: doc.id,
      ...doc.data()
    });
  });

  fs.writeFileSync(
    `${outputDir}/${name}.json`,
    JSON.stringify(data, null, 2)
  );

  console.log(`Exportado: ${name}`);
}

async function run() {
  await exportCollection('usuarios');
  await exportCollection('reportes');
}

run();