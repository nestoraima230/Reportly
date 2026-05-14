const { MongoClient } = require('mongodb');

const MONGO_URI =
  'mongodb://localhost:27017/?directConnection=true';

const DB_NAME = 'reportly';

let client = null;
let db = null;

async function connectDB() {

  if (db) {
    console.log('✅ Reutilizando conexión MongoDB');
    return db;
  }

  try {

    console.log('🟡 Conectando a MongoDB Replica Set...');

    client = new MongoClient(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });

    await client.connect();

    db = client.db(DB_NAME);

    console.log('✅ MongoDB conectado');
    console.log(`📦 Base de datos: ${DB_NAME}`);

    return db;

  } catch (error) {

    console.error('❌ Error MongoDB:', error.message);
    throw error;

  }

}

function getDB() {

  if (!db) {
    throw new Error('MongoDB no conectado');
  }

  return db;

}

module.exports = {
  connectDB,
  getDB
};