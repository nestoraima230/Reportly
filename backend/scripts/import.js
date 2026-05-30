const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// ======================================
// CONFIGURACIÓN
// ======================================

// URI DEL REPLICA SET
const MONGODB_URI =
  'mongodb://mongo1:27017,mongo2:27017,mongo3:27017/reportly?replicaSet=rs0';

// Nombre de la BD
const DATABASE_NAME = 'reportly';

// Archivos transformados
const DATA_DIR = path.join(__dirname, '../../data');

const FILES = {
  usuarios: path.join(DATA_DIR, 'usuarios-transformados.json'),
  reportes: path.join(DATA_DIR, 'reportes-transformados.json')
};

// ======================================
// IMPORTAR COLECCIÓN
// ======================================

async function importarColeccion(db, nombreColeccion, rutaArchivo) {

  console.log(`\n📥 Importando colección: ${nombreColeccion}`);

  // Verificar archivo
  if (!fs.existsSync(rutaArchivo)) {
    throw new Error(`No existe el archivo: ${rutaArchivo}`);
  }

  // Leer JSON
  const datos = JSON.parse(
    fs.readFileSync(rutaArchivo, 'utf8')
  );

  console.log(`📄 Documentos encontrados: ${datos.length}`);

  // Obtener colección
  const collection = db.collection(nombreColeccion);

  // Limpiar colección antes de importar
  await collection.deleteMany({});

  console.log(`🗑️ Colección limpiada`);

  // Insertar documentos
  if (datos.length > 0) {

    const resultado = await collection.insertMany(datos);

    console.log(
      `✅ ${resultado.insertedCount} documentos insertados`
    );
  }

  return true;
}

// ======================================
// CREAR ÍNDICES
// ======================================

async function crearIndices(db) {

  console.log('\n📌 Creando índices...\n');

  // ==========================
  // REPORTES
  // ==========================

  const reportes = db.collection('reportes');

  // Índice geoespacial
  await reportes.createIndex({
    ubicacion: '2dsphere'
  });

  console.log('🌎 Índice geoespacial creado');

  // Índice por usuario
  await reportes.createIndex({
    userId: 1
  });

  console.log('👤 Índice userId creado');

  // Índice por fecha
  await reportes.createIndex({
    creadoEn: -1
  });

  console.log('📅 Índice creadoEn creado');

  // Índice por estado
  await reportes.createIndex({
    estado: 1
  });

  console.log('🚦 Índice estado creado');

  // ==========================
  // USUARIOS
  // ==========================

  const usuarios = db.collection('usuarios');

  // Username único
  await usuarios.createIndex(
    { username: 1 },
    { unique: false }
  );

  console.log('🧑 Índice username creado');

}

// ======================================
// VERIFICACIÓN
// ======================================

async function verificarDatos(db) {

  console.log('\n🔎 Verificando datos...\n');

  const usuarios =
    await db.collection('usuarios').countDocuments();

  const reportes =
    await db.collection('reportes').countDocuments();

  console.log(`👤 Usuarios: ${usuarios}`);
  console.log(`📍 Reportes: ${reportes}`);

  // Mostrar un ejemplo
  const ejemploReporte =
    await db.collection('reportes').findOne();

  console.log('\n📄 Ejemplo de reporte:\n');

  console.log(
    JSON.stringify(ejemploReporte, null, 2)
  );
}

// ======================================
// MAIN
// ======================================

async function main() {

  console.log("🔥 IMPORT SCRIPT EJECUTÁNDOSE");
  console.log("URI:", MONGODB_URI);

  console.log('\n🚀 INICIANDO IMPORTACIÓN A MONGODB\n');

  const client = new MongoClient(MONGODB_URI);

  try {

    // ==================================
    // CONECTAR
    // ==================================

    console.log('🔌 Conectando a MongoDB...\n');

    await client.connect();

    console.log('✅ Conexión exitosa');

    // ==================================
    // DATABASE
    // ==================================

    const db = client.db(DATABASE_NAME);

    console.log(`📦 Base de datos: ${DATABASE_NAME}`);

    // ==================================
    // IMPORTAR
    // ==================================

    await importarColeccion(
      db,
      'usuarios',
      FILES.usuarios
    );

    await importarColeccion(
      db,
      'reportes',
      FILES.reportes
    );

    // ==================================
    // ÍNDICES
    // ==================================

    await crearIndices(db);

    // ==================================
    // VERIFICAR
    // ==================================

    await verificarDatos(db);

    console.log('\n🎉 IMPORTACIÓN COMPLETADA\n');

  } catch (error) {

    console.error('\n❌ ERROR\n');

    console.error(error.message);

  } finally {

    await client.close();

    console.log('🔒 Conexión cerrada\n');
  }
}

// ======================================
// EJECUTAR
// ======================================

main();