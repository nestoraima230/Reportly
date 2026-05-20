import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { 
  getReportesPendientes, 
  marcarSincronizado, 
  guardarUltimaSincronizacion,
  getUltimaSincronizacion,
  guardarReporteLocal
} from './LocalDB';

// IMPORTANTE: Cambiar esta IP por la IP de tu computadora en la red local
// Para desarrollo con Expo: usa la IP de tu máquina (no localhost)
// Ejemplo: 'http://192.168.1.100:3000'
const API_URL = 'http://192.168.1.122:3000'; // ← CAMBIAR ANTES DE LA DEMO

/**
 * Subir reportes pendientes al servidor (PUSH)
 */
export const pushReportesPendientes = async (userId) => {
  try {
    console.log('🟡 PUSH: Buscando reportes pendientes...');
    
    const pendientes = await getReportesPendientes();
    
    // Filtrar solo los reportes del usuario actual
    const misPendientes = pendientes.filter(r => r.user_id === userId);
    
    if (misPendientes.length === 0) {
      console.log('✅ No hay reportes pendientes');
      return { success: true, subidos: 0 };
    }
    
    console.log(`📤 Subiendo ${misPendientes.length} reportes pendientes...`);
    
    let subidos = 0;
    let errores = 0;
    
    for (const reporte of misPendientes) {
      try {
        // Construir el objeto para enviar al servidor
        const reporteParaServidor = {
          titulo: reporte.titulo,
          descripcion: reporte.descripion || reporte.descripcion,
          ubicacion: {
            latitud: reporte.latitud,
            longitud: reporte.longitud
          },
          foto_url: reporte.foto_url,
          user_id: reporte.user_id,
          user_name: reporte.user_name,
          timestamp_original: reporte.timestamp_original  // ← CLAVE: timestamp original
        };
        
        const response = await fetch(`${API_URL}/api/reportes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reporteParaServidor)
        });
        
        if (response.ok) {
          await marcarSincronizado(reporte.id);
          subidos++;
          console.log(`   ✅ ${reporte.titulo} sincronizado`);
        } else {
          errores++;
          console.log(`   ❌ Error al sincronizar ${reporte.titulo}: ${response.status}`);
        }
      } catch (error) {
        errores++;
        console.log(`   ❌ Error de red al sincronizar ${reporte.titulo}:`, error.message);
      }
    }
    
    console.log(`✅ PUSH completado: ${subidos} subidos, ${errores} errores`);
    return { success: true, subidos, errores };
    
  } catch (error) {
    console.error('❌ Error en pushReportesPendientes:', error);
    return { success: false, error: error.message };
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
    console.log(`   Status: ${response.status}`);
    
    const data = await response.json();
    
    if (!data.success) {
      console.log(`   ⚠️ success: false`);
      return { success: false, guardados: 0 };
    }
    
    const reportesServidor = data.data || [];
    console.log(`   📥 Reportes del servidor: ${reportesServidor.length}`);
    
    let guardados = 0;
    
    for (const reporte of reportesServidor) {
      // Calcular timestamp_original de forma segura
      let timestampOriginal = reporte.timestamp_original;
      if (!timestampOriginal) {
        if (reporte.creadoEn) {
          timestampOriginal = new Date(reporte.creadoEn).getTime();
        } else if (reporte.fecha) {
          timestampOriginal = new Date(reporte.fecha).getTime();
        } else {
          timestampOriginal = Date.now(); // Valor por defecto
        }
      }
      
      // Log para debug
      console.log(`   Procesando reporte: ${reporte.titulo}, timestamp: ${timestampOriginal}`);
      
      const reporteLocal = {
        id: reporte._id,
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
    }
    
    if (guardados > 0) {
      await guardarUltimaSincronizacion(Date.now());
    }
    
    console.log(`✅ PULL completado: ${guardados} reportes guardados`);
    return { success: true, guardados };
    
  } catch (error) {
    console.error('❌ Error en pullReportesDelServidor:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sincronización completa (PUSH + PULL)
 */
export const sincronizarCompleto = async (userId, showLogs = true) => {
  if (showLogs) console.log('🔄 Iniciando sincronización completa...');
  
  // Verificar si hay conexión a internet
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    console.log('⚠️ Sin conexión a internet. No se puede sincronizar.');
    return { success: false, error: 'Sin conexión a internet' };
  }
  
  // Paso 1: Subir reportes pendientes (PUSH)
  const pushResult = await pushReportesPendientes(userId);
  
  // Paso 2: Descargar reportes nuevos (PULL)
  const pullResult = await pullReportesDelServidor(userId);
  
  if (showLogs) {
    console.log(`✅ Sincronización completada`);
    console.log(`   📤 Subidos: ${pushResult.subidos || 0}`);
    console.log(`   📥 Descargados: ${pullResult.guardados || 0}`);
  }
  
  return {
    success: pushResult.success && pullResult.success,
    subidos: pushResult.subidos || 0,
    descargados: pullResult.guardados || 0,
    errores: pushResult.errores || 0
  };
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
  netInfoUnsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected && userId) {
      console.log('🌐 Conexión detectada, sincronizando...');
      sincronizarCompleto(userId, false);
    }
  });
  
  // Sincronizar cada 10 minutos (opcional)
  syncInterval = setInterval(async () => {
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected && userId) {
      console.log('⏰ Sincronización programada...');
      sincronizarCompleto(userId, false);
    }
  }, 10 * 60 * 1000); // 10 minutos
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