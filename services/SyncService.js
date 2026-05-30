import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {
  getReportesPendientes,
  marcarSincronizado,
  guardarUltimaSincronizacion,
  getUltimaSincronizacion,
  guardarReporteLocal,
  verificarSiExisteReporte,
  marcarSincronizadoConServidorId,
  getReportesLocales
} from './LocalDB';

// IMPORTANTE: Cambiar esta IP por la IP de tu computadora en la red local
// Para desarrollo con Expo: usa la IP de tu máquina (no localhost)
// Ejemplo: 'http://192.168.1.100:3000'

const API_URL = 'http://192.168.1.79:3000'
console.log("API URL:", process.env.EXPO_PUBLIC_API_URL2);
console.log(
  "ENV REAL:",
  process.env.EXPO_PUBLIC_API_URL
);
let sincronizando = false;

/**
 * Subir reportes pendientes al servidor (PUSH)
 */
export const pushReportesPendientes = async (userId) => {
  try {
    console.log('🟡 PUSH: Buscando reportes pendientes...');

    const pendientes = await getReportesPendientes();

    // Filtrar solo los reportes del usuario actual
    const misPendientes = pendientes.filter(
      (r) => r.user_id === userId
    );

    if (misPendientes.length === 0) {
      console.log('✅ No hay reportes pendientes');

      return {
        success: true,
        subidos: 0,
      };
    }

    console.log(
      `📤 Subiendo ${misPendientes.length} reportes pendientes...`
    );

    let subidos = 0;
    let errores = 0;

    for (const reporte of misPendientes) {

      console.log(
        '🧪 DEBUG IMAGEN:',
        {
          titulo: reporte.titulo,
          imagen_pendiente: reporte.imagen_pendiente,
          tipo_imagen_pendiente: typeof reporte.imagen_pendiente,
          foto_local_uri: reporte.foto_local_uri,
          foto_url: reporte.foto_url
        }
      );


      try {
        // Construir el objeto para enviar al servidor
        const reporteParaServidor = {
          titulo: reporte.titulo,
          descripcion: reporte.descripcion,
          ubicacion: {
            latitud: reporte.latitud,
            longitud: reporte.longitud,
          },
          foto_url: reporte.foto_url,
          user_id: reporte.user_id,
          user_name: reporte.user_name,
          timestamp_original: reporte.timestamp_original,
        };

        // 📸 Subir imagen pendiente antes de enviar el reporte
        if (
          Number(reporte.imagen_pendiente) === 1 &&
          reporte.foto_local_uri
        ) {
          try {
            console.log(
              `   📸 Subiendo imagen pendiente para: ${reporte.titulo}`
            );

            const imagenURL = await subirImagenPendiente(
              reporte.foto_local_uri
            );

            // Actualizar URL de imagen para enviar al servidor
            reporteParaServidor.foto_url = imagenURL;

            console.log(`   ✅ Imagen subida: ${imagenURL}`);
          } catch (error) {
            console.log(
              `   ⚠️ No se pudo subir la imagen ahora, se reintentará después`
            );

            // No marcar como sincronizado si la imagen falla
            continue;
          }
        }

        // 🚀 Enviar reporte al servidor
        const response = await fetch(`${API_URL}/api/reportes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reporteParaServidor),
        });

        if (response.ok) {
          const data = await response.json();

          // 🔥 ID generado por MongoDB
          const servidorId = data.insertedId;

          // ✅ Marcar sincronizado y guardar servidor_id
          await marcarSincronizadoConServidorId(
            reporte.id,
            servidorId
          );

          subidos++;

          console.log(
            `   ✅ ${reporte.titulo} sincronizado (servidor_id: ${servidorId})`
          );
        } else {
          errores++;

          console.log(
            `   ❌ Error al sincronizar ${reporte.titulo}: ${response.status}`
          );
        }
      } catch (error) {
        errores++;

        console.log(
          `   ❌ Error de red al sincronizar ${reporte.titulo}:`,
          error.message
        );
      }
    }

    console.log(
      `✅ PUSH completado: ${subidos} subidos, ${errores} errores`
    );

    return {
      success: true,
      subidos,
      errores,
    };
  } catch (error) {
    console.error('❌ Error en pushReportesPendientes:', error);

    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Descargar reportes del servidor (PULL)
 */
export const pullReportesDelServidor = async (userId) => {
  try {
    console.log('🟡 PULL: Descargando reportes del servidor...');

    const url = `${API_URL}/api/reportes/usuario/${userId}`;
    console.log(`   URL: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      console.log(`   ❌ HTTP Error: ${response.status}`);
      return { success: false, guardados: 0, error: `HTTP ${response.status}` };
    }

    const data = await response.json();

    if (!data.success) {
      console.log(`   ⚠️ API success: false`);
      return { success: false, guardados: 0 };
    }

    const reportesServidor = data.data || [];
    console.log(`   📥 Reportes del servidor: ${reportesServidor.length}`);

    // 🔥 Obtener reportes locales para verificar duplicados por servidor_id
    const reportesLocales = await getReportesLocales();

    // Crear un Set con los servidor_id que YA tenemos en SQLite
    const servidorIdsLocales = new Set(
      reportesLocales.filter(r => r.servidor_id).map(r => r.servidor_id)
    );

    // También un Set con los IDs locales (UUIDs) por si acaso
    const idsLocales = new Set(reportesLocales.map(r => r.id));

    let guardados = 0;
    let duplicados = 0;
    let invalidos = 0;

    for (const reporte of reportesServidor) {
      const servidorId = reporte._id;

      // 🔥 CRITERIO 1: Si YA tenemos este servidor_id localmente → DUPLICADO
      if (servidorIdsLocales.has(servidorId)) {
        console.log(`   ⏭️ DUPLICADO (servidor_id ya existe): ${reporte.titulo} (${servidorId})`);
        duplicados++;
        continue;
      }

      // 🔥 CRITERIO 2: Si el UUID local coincide con algún reporte pendiente
      // Buscar si hay un reporte local pendiente con el mismo título y timestamp cercano
      const pendienteRelacionado = reportesLocales.find(r =>
        r.sincronizado === 0 &&
        r.titulo === reporte.titulo &&
        Math.abs(r.timestamp_original - new Date(reporte.creadoEn).getTime()) < 60000 // 1 minuto
      );

      if (pendienteRelacionado) {
        console.log(`   🔗 Vinculando reporte pendiente con servidor_id: ${pendienteRelacionado.id} -> ${servidorId}`);
        // Actualizar el reporte pendiente con el servidor_id
        await marcarSincronizadoConServidorId(pendienteRelacionado.id, servidorId);
        duplicados++;
        continue;
      }

      // Validar que tenga ubicación válida
      const tieneUbicacion = reporte.ubicacion &&
        reporte.ubicacion.coordinates &&
        reporte.ubicacion.coordinates[0] !== 0 &&
        reporte.ubicacion.coordinates[1] !== 0;

      if (!tieneUbicacion) {
        console.log(`   ⏭️ INVÁLIDO (sin ubicación): ${reporte.titulo}`);
        invalidos++;
        continue;
      }

      let timestampOriginal = reporte.timestamp_original;
      if (!timestampOriginal && reporte.creadoEn) {
        timestampOriginal = new Date(reporte.creadoEn).getTime();
      } else if (!timestampOriginal) {
        timestampOriginal = Date.now();
      }

      console.log(`   ✅ NUEVO reporte: ${reporte.titulo} (servidor_id: ${servidorId})`);

      // Guardar usando el ID del servidor como identificador principal
      const reporteLocal = {
        id: servidorId,  // ← AHORA USA EL ID DEL SERVIDOR
        servidor_id: servidorId,
        titulo: reporte.titulo,
        descripcion: reporte.descripcion || '',
        latitud: reporte.ubicacion?.coordinates?.[1] || 0,
        longitud: reporte.ubicacion?.coordinates?.[0] || 0,
        foto_url: reporte.imagenURL || reporte.foto_url || null,
        timestamp_original: timestampOriginal,
        sincronizado: 1,
        user_id: reporte.user_id,
        user_name: reporte.nombreUsuario || reporte.user_name || 'Anónimo',
        direccion: reporte.direccion || '',
        colonia: reporte.colonia || '',
        etiquetas: reporte.etiquetas || [],
        estado: reporte.estado || 'pendiente'
      };

      await guardarReporteLocal(reporteLocal);
      guardados++;

      // Agregar al Set para evitar duplicados en esta misma ejecución
      servidorIdsLocales.add(servidorId);
    }

    console.log(`✅ PULL completado: +${guardados} nuevos, ${duplicados} duplicados/vinculados, ${invalidos} inválidos`);

    if (guardados > 0) {
      await guardarUltimaSincronizacion(Date.now());
    }

    return { success: true, guardados, duplicados, invalidos };

  } catch (error) {
    console.error('❌ Error en pullReportesDelServidor:', error);
    return { success: false, error: error.message, guardados: 0 };
  }
};

/**
 * Subir una imagen pendiente a Cloudinary
 */
const subirImagenPendiente = async (uri) => {
  try {
    const data = new FormData();
    data.append("file", {
      uri: uri,
      type: "image/jpeg",
      name: "reporte_pendiente.jpg",
    });
    data.append("upload_preset", "report");
    data.append("cloud_name", "dcsa4u3cj");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dcsa4u3cj/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const result = await res.json();
    return result.secure_url;
  } catch (error) {
    console.error("Error subiendo imagen pendiente:", error);
    throw error;
  }
};

/**
 * Sincronización completa (PUSH + PULL)
 */
export const sincronizarCompleto = async (userId, showLogs = true) => {

  // Evitar sincronizaciones simultáneas
  if (sincronizando) {
    console.log('⏳ Ya hay una sincronización en progreso');

    return {
      success: false,
      skipped: true
    };
  }

  sincronizando = true;

  try {

    if (showLogs) {
      console.log('🔄 Iniciando sincronización completa...');
    }

    // Verificar conexión
    const netInfo = await NetInfo.fetch();

    if (!netInfo.isConnected) {
      console.log('⚠️ Sin internet');

      return {
        success: false,
        error: 'Sin conexión'
      };
    }

    // PUSH
    const pushResult = await pushReportesPendientes(userId);

    // PULL
    const pullResult = await pullReportesDelServidor(userId);

    if (showLogs) {
      console.log('✅ Sincronización completada');
      console.log(`📤 Subidos: ${pushResult.subidos || 0}`);
      console.log(`📥 Descargados: ${pullResult.guardados || 0}`);
    }

    return {
      success: pushResult.success && pullResult.success,
      subidos: pushResult.subidos || 0,
      descargados: pullResult.guardados || 0,
      errores: pushResult.errores || 0
    };

  } catch (error) {

    console.error('❌ Error en sincronizarCompleto:', error);

    return {
      success: false,
      error: error.message
    };

  } finally {

    sincronizando = false;

  }
};

/**
 * Verificar si hay conexión a internet
 */
export const isConnected = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected;
};

/**
 * Configurar sincronización automática al detectar conexión
 */
let syncInterval = null;
let netInfoUnsubscribe = null;

export const iniciarSincronizacionAutomatica = (userId) => {
  // Detener sincronizaciones anteriores si existen
  detenerSincronizacionAutomatica();

  if (!userId) return;

  // Sincronizar cuando se detecta conexión
  netInfoUnsubscribe = NetInfo.addEventListener(async (state) => {
    if (state.isConnected && userId) {
      console.log('🌐 Conexión detectada, sincronizando...');
      await sincronizarCompleto(userId, false);
    }
  });

  // Sincronizar cada 10 minutos
  syncInterval = setInterval(async () => {
    const netInfo = await NetInfo.fetch();

    if (netInfo.isConnected && userId) {
      console.log('⏰ Sincronización programada...');
      await sincronizarCompleto(userId, false);
    }
  }, 10 * 60 * 1000);
};

export const detenerSincronizacionAutomatica = () => {
  if (netInfoUnsubscribe) {
    netInfoUnsubscribe();
    netInfoUnsubscribe = null;
  }
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};