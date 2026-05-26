import * as SQLite from 'expo-sqlite';

// Abrir base de datos (forma correcta para Expo SDK 49+)
const db = SQLite.openDatabaseSync('reportly_local.db');

/**
 * Ejecutar una consulta que no devuelve resultados (INSERT, UPDATE, DELETE)
 */
const ejecutarConsulta = (query, params = []) => {
  try {
    const statement = db.prepareSync(query);
    statement.executeSync(params);
    statement.finalizeSync();
    return true;
  } catch (error) {
    console.error('Error ejecutando consulta:', error);
    throw error;
  }
};

/**
 * Ejecutar una consulta SELECT y obtener todas las filas
 * VERSIÓN CORREGIDA - Usando getAllSync()
 */
const ejecutarSelect = (query, params = []) => {
  try {
    // Usar getAllSync directamente para SELECTs simples
    const result = db.getAllSync(query, params);

    // result ya es un array de objetos directamente
    const rows = result.map(row => ({
      ...row,
      latitud: row.latitud ? parseFloat(row.latitud) : 0,
      longitud: row.longitud ? parseFloat(row.longitud) : 0,
      timestamp_original: row.timestamp_original ? parseInt(row.timestamp_original) : 0,
      sincronizado: row.sincronizado ? parseInt(row.sincronizado) : 0
    }));

    return rows;
  } catch (error) {
    console.error('Error en select:', error);
    return [];
  }
};

/**
 * Inicializar la base de datos local
 */
export const initLocalDB = () => {
  try {
    // Tabla de reportes locales
    ejecutarConsulta(`
      CREATE TABLE IF NOT EXISTS reportes_locales (
       id TEXT PRIMARY KEY,
       servidor_id TEXT, 
       titulo TEXT NOT NULL,
       descripcion TEXT,
       latitud REAL,
       longitud REAL,
       foto_url TEXT,
       foto_local_uri TEXT,
       timestamp_original INTEGER NOT NULL,
       sincronizado INTEGER DEFAULT 0,
       user_id TEXT NOT NULL,
       user_name TEXT,
       direccion TEXT,
       colonia TEXT,
       etiquetas TEXT,
       estado TEXT,
       imagen_pendiente INTEGER DEFAULT 0
      );
    `);
    console.log('✅ Tabla reportes_locales lista');

    // Tabla de metadatos
    ejecutarConsulta(`
      CREATE TABLE IF NOT EXISTS sync_metadata (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
    console.log('✅ Tabla sync_metadata lista');

    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error inicializando:', error);
    return Promise.reject(error);
  }
};

/**
 * Guardar un reporte localmente
 */
export const guardarReporteLocal = (reporte) => {
  try {
    const etiquetasStr = reporte.etiquetas ? JSON.stringify(reporte.etiquetas) : '[]';

    ejecutarConsulta(
      `INSERT OR REPLACE INTO reportes_locales 
       (id, servidor_id, titulo, descripcion, latitud, longitud, foto_url, foto_local_uri, 
        timestamp_original, sincronizado, user_id, user_name, direccion, colonia, etiquetas, 
        estado, imagen_pendiente)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        reporte.id,
        reporte.servidor_id || null,
        reporte.titulo,
        reporte.descripcion || '',
        reporte.latitud || 0,
        reporte.longitud || 0,
        reporte.foto_url || null,
        reporte.foto_local_uri || null,
        reporte.timestamp_original,
        reporte.sincronizado ? 1 : 0,
        reporte.user_id,
        reporte.user_name || 'Usuario',
        reporte.direccion || '',
        reporte.colonia || '',
        etiquetasStr,
        reporte.estado || 'pendiente',
        reporte.imagen_pendiente ? 1 : 0
      ]
    );
    console.log('✅ Reporte guardado:', reporte.id);
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error guardando:', error);
    return Promise.reject(error);
  }
};

/**
 * Obtener todos los reportes locales
 */
export const getReportesLocales = () => {
  try {
    const rows = ejecutarSelect(
      `SELECT * FROM reportes_locales ORDER BY timestamp_original DESC;`
    );

    const reportes = rows.map(row => ({
      id: row.id,
      servidor_id: row.servidor_id,
      titulo: row.titulo,
      descripcion: row.descripcion,
      latitud: row.latitud,
      longitud: row.longitud,
      foto_url: row.foto_url,
      foto_local_uri: row.foto_local_uri,
      timestamp_original: row.timestamp_original,
      sincronizado: row.sincronizado,
      user_id: row.user_id,
      user_name: row.user_name,
      direccion: row.direccion,
      colonia: row.colonia,
      etiquetas: row.etiquetas ? JSON.parse(row.etiquetas) : [],
      estado: row.estado,
      imagen_pendiente: row.imagen_pendiente
    }));

    console.log(`📖 ${reportes.length} reportes locales`);
    return Promise.resolve(reportes);
  } catch (error) {
    console.error('❌ Error leyendo:', error);
    return Promise.resolve([]);
  }
};

/**
 * Obtener reportes pendientes
 */
export const getReportesPendientes = () => {
  try {
    const rows = ejecutarSelect(
      `SELECT * FROM reportes_locales WHERE sincronizado = 0 ORDER BY timestamp_original ASC;`
    );

    const reportes = rows.map(row => ({
      id: row.id,
      titulo: row.titulo,
      descripcion: row.descripcion,
      latitud: row.latitud,
      longitud: row.longitud,
      foto_url: row.foto_url,
      foto_local_uri: row.foto_local_uri,
      imagen_pendiente: Number(row.imagen_pendiente),
      timestamp_original: row.timestamp_original,
      sincronizado: row.sincronizado === 1,
      user_id: row.user_id,
      user_name: row.user_name,
      direccion: row.direccion,
      colonia: row.colonia,
      etiquetas: row.etiquetas ? JSON.parse(row.etiquetas) : [],
      estado: row.estado
    }));

    console.log(`📤 ${reportes.length} pendientes`);
    return Promise.resolve(reportes);
  } catch (error) {
    console.error('❌ Error obteniendo pendientes:', error);
    return Promise.resolve([]);
  }
};

/**
 * Marcar reporte como sincronizado
 */
export const marcarSincronizado = (id) => {
  try {
    ejecutarConsulta(`UPDATE reportes_locales SET sincronizado = 1 WHERE id = ?;`, [id]);
    console.log(`✅ Marcado sincronizado: ${id}`);
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error marcando sincronizado:', error);
    return Promise.reject(error);
  }
};

/**
 * Guardar última sincronización
 */
export const guardarUltimaSincronizacion = (timestamp) => {
  try {
    ejecutarConsulta(
      `INSERT OR REPLACE INTO sync_metadata (key, value) VALUES ('ultima_sincronizacion', ?);`,
      [timestamp.toString()]
    );
    console.log(`✅ Última sincronización guardada: ${timestamp}`);
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error guardando última sincronización:', error);
    return Promise.reject(error);
  }
};

/**
 * Obtener última sincronización
 */
export const getUltimaSincronizacion = () => {
  try {
    const rows = ejecutarSelect(`SELECT value FROM sync_metadata WHERE key = 'ultima_sincronizacion';`);
    if (rows.length > 0) {
      const timestamp = parseInt(rows[0].value);
      return Promise.resolve(timestamp);
    }
    return Promise.resolve(0);
  } catch (error) {
    console.error('❌ Error obteniendo última sincronización:', error);
    return Promise.resolve(0);
  }
};

/**
 * Limpiar datos locales
 */
export const limpiarDatosLocales = () => {
  try {
    ejecutarConsulta(`DELETE FROM reportes_locales;`);
    console.log('🗑️ Datos locales limpiados');
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error limpiando datos:', error);
    return Promise.reject(error);
  }
};

/**
 * Eliminar un reporte específico
 */
export const eliminarReporteLocal = (id) => {
  try {
    ejecutarConsulta(`DELETE FROM reportes_locales WHERE id = ?;`, [id]);
    console.log(`🗑️ Reporte eliminado: ${id}`);
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error eliminando reporte:', error);
    return Promise.reject(error);
  }
};

/**
 * Actualizar estado de un reporte
 */
export const actualizarEstadoReporte = (id, estado) => {
  try {
    ejecutarConsulta(
      `UPDATE reportes_locales SET estado = ? WHERE id = ?;`,
      [estado, id]
    );
    console.log(`✅ Estado actualizado: ${id} -> ${estado}`);
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error actualizando estado:', error);
    return Promise.reject(error);
  }
};

/**
 * Obtener conteo de reportes por estado
 */
export const getConteoReportes = () => {
  try {
    const rows = ejecutarSelect(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN sincronizado = 0 THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN sincronizado = 1 THEN 1 ELSE 0 END) as sincronizados
      FROM reportes_locales;
    `);

    if (rows.length > 0) {
      return Promise.resolve({
        total: rows[0].total || 0,
        pendientes: rows[0].pendientes || 0,
        sincronizados: rows[0].sincronizados || 0
      });
    }
    return Promise.resolve({ total: 0, pendientes: 0, sincronizados: 0 });
  } catch (error) {
    console.error('❌ Error obteniendo conteo:', error);
    return Promise.resolve({ total: 0, pendientes: 0, sincronizados: 0 });
  }
};

/**
 * Verificar si un reporte ya existe localmente por su ID
 */
export const verificarSiExisteReporte = (id) => {
  try {
    const rows = ejecutarSelect(
      `SELECT id FROM reportes_locales WHERE id = ?;`,
      [id]
    );
    const existe = rows.length > 0;
    return existe;
  } catch (error) {
    console.error('❌ Error verificando existencia:', error);
    return false;
  }
};

/**
 * Resetear completamente la base de datos local
 */
export const resetearBaseDatosLocal = async () => {
  try {
    // Borrar todos los reportes
    ejecutarConsulta(`DELETE FROM reportes_locales;`);
    console.log('🗑️ Todos los reportes eliminados');

    // Reiniciar la metadata de sincronización
    ejecutarConsulta(`DELETE FROM sync_metadata;`);
    console.log('🗑️ Metadata reiniciada');

    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error reseteando:', error);
    return Promise.reject(error);
  }
};

/**
 * Marcar reporte como sincronizado y guardar el ID del servidor
 */
export const marcarSincronizadoConServidorId = (localId, servidorId) => {
  try {
    ejecutarConsulta(
      `UPDATE reportes_locales 
       SET sincronizado = 1, servidor_id = ? 
       WHERE id = ?;`,
      [servidorId, localId]
    );
    console.log(`✅ Marcado sincronizado: ${localId} -> servidor_id: ${servidorId}`);
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error marcando sincronizado:', error);
    return Promise.reject(error);
  }
};
