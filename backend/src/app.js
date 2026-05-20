const express = require('express');
const cors = require('cors');

const { connectDB } = require('../config/mongodb');

const { ObjectId } = require('mongodb');

const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());

let db;

/*
========================================
CONECTAR A MONGODB
========================================
*/

connectDB()
  .then(database => {

    db = database;

    console.log('✅ Backend listo');

  })
  .catch(error => {

    console.error('❌ Error conectando MongoDB');
    process.exit(1);

  });

/*
========================================
HEALTH CHECK
========================================
*/

app.get('/health', async (req, res) => {

  try {

    await db.command({ ping: 1 });

    res.json({
      status: 'healthy',
      mongodb: 'connected',
      replicaSet: 'rs0'
    });

  } catch (error) {

    res.status(500).json({
      status: 'error',
      error: error.message
    });

  }

});

/*
========================================
GET REPORTES
========================================
*/

app.get('/api/reportes', async (req, res) => {

  try {

    const reportes = await db
      .collection('reportes')
      .find()
      .sort({ creadoEn: -1 })
      .toArray();

    res.json({
      success: true,
      total: reportes.length,
      data: reportes
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

/*
========================================
GET REPORTE POR ID
========================================
*/

app.get('/api/reportes/:id', async (req, res) => {

  try {

    const id = req.params.id;

    const reporte = await db
      .collection('reportes')
      .findOne({ _id: id });

    if (!reporte) {

      return res.status(404).json({
        success: false,
        error: 'Reporte no encontrado'
      });

    }

    res.json({
      success: true,
      data: reporte
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

/*
========================================
GET REPORTES POR USUARIO (para sincronización pull)
========================================
*/

app.get('/api/reportes/usuario/:userId', async (req, res) => {

  try {

    const { userId } = req.params;
    const { desde } = req.query;

    console.log(`🔍 PULL: Buscando reportes para usuario: ${userId}`);
    console.log(`   desde: ${desde || 'no especificado'}`);

    let query = { user_id: userId };

    if (desde) {
      const desdeDate = new Date(parseInt(desde));
      query.creadoEn = { $gt: desdeDate };
    }

    console.log(`   Query:`, JSON.stringify(query));

    const reportes = await db
      .collection('reportes')
      .find(query)
      .sort({ creadoEn: -1 })
      .toArray();

    console.log(`   Encontrados: ${reportes.length} reportes`);

    res.json({
      success: true,
      count: reportes.length,
      data: reportes
    });

  } catch (error) {

    console.error('Error en GET /api/reportes/usuario/:userId:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

/*
========================================
CREAR REPORTE
========================================
*/

/*
========================================
CREAR REPORTE (con timestamp original para offline)
========================================
*/

app.post('/api/reportes', async (req, res) => {

  try {

    const datos = req.body;

    // Usar timestamp_original si viene del cliente (offline)
    // Si no, usar la fecha actual
    const fechaCreacion = datos.timestamp_original 
      ? new Date(datos.timestamp_original)
      : new Date();

    const nuevoReporte = {
      titulo: datos.titulo,
      descripcion: datos.descripcion || '',
      ubicacion: datos.ubicacion ? {
        type: 'Point',
        coordinates: [datos.ubicacion.longitud, datos.ubicacion.latitud]
      } : null,
      foto_url: datos.foto_url || null,
      user_id: datos.user_id || datos.userId || 'anonymous',
      user_name: datos.user_name || 'Anónimo',
      likes_count: 0,
      estado: datos.estado || 'pendiente',
      creadoEn: fechaCreacion,        // ← CLAVE: usa el timestamp original
      sincronizado: true,
      creadoServidor: new Date()       // ← Para debug (saber cuándo llegó al servidor)
    };

    const result = await db
      .collection('reportes')
      .insertOne(nuevoReporte);

    res.status(201).json({
      success: true,
      insertedId: result.insertedId,
      data: nuevoReporte
    });

  } catch (error) {

    console.error('Error en POST /api/reportes:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

/*
========================================
GET USUARIOS
========================================
*/

app.get('/api/usuarios', async (req, res) => {

  try {

    const usuarios = await db
      .collection('usuarios')
      .find()
      .toArray();

    res.json({

      success: true,

      total: usuarios.length,

      data: usuarios

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error: error.message

    });

  }

});

/*
========================================
GET USUARIO POR ID
========================================
*/

app.get('/api/usuarios/:id', async (req, res) => {

  try {

    const usuario = await db
      .collection('usuarios')
      .findOne({ _id: req.params.id });

    if (!usuario) {

      return res.status(404).json({

        success: false,

        error: 'Usuario no encontrado'

      });

    }

    res.json({

      success: true,

      data: usuario

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error: error.message

    });

  }

});

/*
========================================
INICIAR SERVIDOR
========================================
*/

app.listen(PORT, () => {

  console.log(`
========================================
🚀 REPORTLY BACKEND INICIADO
========================================

📡 Puerto: ${PORT}

🌐 URL:
http://localhost:${PORT}

❤️ Health:
http://localhost:${PORT}/health

========================================
  `);

});