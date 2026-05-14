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
CREAR REPORTE
========================================
*/

app.post('/api/reportes', async (req, res) => {

  try {

    const nuevoReporte = {

      ...req.body,

      creadoServidor: new Date(),

      sincronizado: true

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

    console.error(error);

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