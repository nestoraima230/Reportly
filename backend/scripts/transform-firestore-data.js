// backend/scripts/transform-firestore-data.js

const fs = require('fs');
const path = require('path');

// ================================
// CONFIGURACIÓN
// ================================

const DATA_DIR = path.join(__dirname, '../../data');

const INPUT_FILES = {
  usuarios: path.join(DATA_DIR, 'usuarios.json'),
  reportes: path.join(DATA_DIR, 'reportes.json')
};

const OUTPUT_FILES = {
  usuarios: path.join(DATA_DIR, 'usuarios-transformados.json'),
  reportes: path.join(DATA_DIR, 'reportes-transformados.json')
};

// ================================
// FUNCIONES AUXILIARES
// ================================

/**
 * Convierte timestamp de Firestore a Date ISO
 */
function convertirTimestamp(timestamp) {
  try {
    if (!timestamp || typeof timestamp !== 'object') {
      return null;
    }

    if (
      timestamp._seconds === undefined ||
      timestamp._nanoseconds === undefined
    ) {
      return null;
    }

    const fecha = new Date(
      timestamp._seconds * 1000 +
      timestamp._nanoseconds / 1000000
    );

    return fecha.toISOString();

  } catch (error) {
    console.error('❌ Error convirtiendo timestamp:', error.message);
    return null;
  }
}

/**
 * Convierte ubicación Firestore → GeoJSON MongoDB
 */
function convertirUbicacion(ubicacion) {
  try {
    if (!ubicacion) return null;

    if (
      ubicacion.longitude === undefined ||
      ubicacion.latitude === undefined
    ) {
      return null;
    }

    return {
      type: 'Point',
      coordinates: [
        ubicacion.longitude,
        ubicacion.latitude
      ]
    };

  } catch (error) {
    console.error('❌ Error convirtiendo ubicación:', error.message);
    return null;
  }
}

/**
 * Verifica si una URL es local
 */
function esRutaLocal(url) {
  if (!url || typeof url !== 'string') return false;

  return (
    url.startsWith('file://') ||
    url.includes('/data/user/') ||
    url.includes('/cache/')
  );
}

/**
 * Limpia texto
 */
function limpiarTexto(valor) {
  if (valor === null || valor === undefined) {
    return '';
  }

  return String(valor).trim();
}

// ================================
// TRANSFORMACIÓN DE USUARIOS
// ================================

function transformarUsuarios(usuarios) {
  console.log('\n👤 Transformando usuarios...\n');

  const usuariosTransformados = usuarios.map((usuario, index) => {

    console.log(`   Procesando usuario ${index + 1}/${usuarios.length}`);

    const nuevoUsuario = {
      _id: usuario._id,

      username: limpiarTexto(usuario.username),

      address: limpiarTexto(usuario.address),

      profileImage: esRutaLocal(usuario.profileImage)
        ? null
        : usuario.profileImage || null,

      posts: Array.isArray(usuario.posts)
        ? usuario.posts
        : [],

      creadoEn: convertirTimestamp(usuario.creadoEn),

      migratedAt: new Date().toISOString()
    };

    return nuevoUsuario;
  });

  console.log(`\n✅ ${usuariosTransformados.length} usuarios transformados`);

  return usuariosTransformados;
}

// ================================
// TRANSFORMACIÓN DE REPORTES
// ================================

function transformarReportes(reportes) {
  console.log('\n📍 Transformando reportes...\n');

  const reportesTransformados = reportes.map((reporte, index) => {

    console.log(`   Procesando reporte ${index + 1}/${reportes.length}`);

    const nuevoReporte = {
      _id: reporte._id,

      titulo: limpiarTexto(reporte.titulo),

      descripcion: limpiarTexto(reporte.descripcion),

      direccion: limpiarTexto(reporte.direccion),

      colonia: limpiarTexto(reporte.colonia),

      nombreUsuario: limpiarTexto(reporte.nombreUsuario),

      userId: limpiarTexto(reporte.userId),

      estado: limpiarTexto(reporte.estado || 'pendiente'),

      imagenURL: limpiarTexto(reporte.imagenURL),

      etiquetas: Array.isArray(reporte.etiquetas)
        ? reporte.etiquetas
        : [],

      ubicacion: convertirUbicacion(reporte.ubicacion),

      creadoEn: convertirTimestamp(reporte.creadoEn),

      likes: 0,

      comentarios: [],

      migratedAt: new Date().toISOString()
    };

    return nuevoReporte;
  });

  console.log(`\n✅ ${reportesTransformados.length} reportes transformados`);

  return reportesTransformados;
}

// ================================
// GUARDAR JSON
// ================================

function guardarJSON(ruta, datos) {
  fs.writeFileSync(
    ruta,
    JSON.stringify(datos, null, 2),
    'utf8'
  );
}

// ================================
// ESTADÍSTICAS
// ================================

function mostrarEstadisticas(usuarios, reportes) {

  const usuariosSinImagen = usuarios.filter(
    u => !u.profileImage
  ).length;

  const reportesConUbicacion = reportes.filter(
    r => r.ubicacion !== null
  ).length;

  console.log('\n📊 ESTADÍSTICAS');
  console.log('====================================');

  console.log(`👤 Usuarios totales: ${usuarios.length}`);
  console.log(`🖼️ Usuarios sin imagen válida: ${usuariosSinImagen}`);

  console.log('');

  console.log(`📍 Reportes totales: ${reportes.length}`);
  console.log(`🌎 Reportes con geolocalización: ${reportesConUbicacion}`);

  console.log('====================================\n');
}

// ================================
// MAIN
// ================================

async function main() {

  console.log('\n🚀 INICIANDO TRANSFORMACIÓN DE DATOS\n');

  try {

    // ================================
    // VERIFICAR ARCHIVOS
    // ================================

    if (!fs.existsSync(INPUT_FILES.usuarios)) {
      throw new Error(
        `No existe: ${INPUT_FILES.usuarios}`
      );
    }

    if (!fs.existsSync(INPUT_FILES.reportes)) {
      throw new Error(
        `No existe: ${INPUT_FILES.reportes}`
      );
    }

    // ================================
    // LEER JSON
    // ================================

    console.log('📂 Leyendo archivos JSON...\n');

    const usuariosOriginales = JSON.parse(
      fs.readFileSync(INPUT_FILES.usuarios, 'utf8')
    );

    const reportesOriginales = JSON.parse(
      fs.readFileSync(INPUT_FILES.reportes, 'utf8')
    );

    console.log(
      `✅ Usuarios cargados: ${usuariosOriginales.length}`
    );

    console.log(
      `✅ Reportes cargados: ${reportesOriginales.length}`
    );

    // ================================
    // TRANSFORMAR
    // ================================

    const usuariosTransformados =
      transformarUsuarios(usuariosOriginales);

    const reportesTransformados =
      transformarReportes(reportesOriginales);

    // ================================
    // GUARDAR
    // ================================

    console.log('\n💾 Guardando archivos transformados...\n');

    guardarJSON(
      OUTPUT_FILES.usuarios,
      usuariosTransformados
    );

    guardarJSON(
      OUTPUT_FILES.reportes,
      reportesTransformados
    );

    console.log('✅ usuarios-transformados.json creado');
    console.log('✅ reportes-transformados.json creado');

    // ================================
    // ESTADÍSTICAS
    // ================================

    mostrarEstadisticas(
      usuariosTransformados,
      reportesTransformados
    );

    console.log('🎉 TRANSFORMACIÓN COMPLETADA\n');

  } catch (error) {

    console.error('\n❌ ERROR GENERAL\n');

    console.error(error.message);

    process.exit(1);
  }
}

// ================================
// EJECUTAR
// ================================

main();