import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { app } from '../config/firebaseConfig';

// Importar servicios locales
import { initLocalDB, getReportesLocales, resetearBaseDatosLocal} from '../services/LocalDB';
import { sincronizarCompleto, isConnected, iniciarSincronizacionAutomatica, detenerSincronizacionAutomatica } from '../services/SyncService';

export default function Feed() {
  const [reportes, setReportes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const navigation = useNavigation();
  const auth = getAuth(app);
  console.log('📱 Usuario actual UID:', auth.currentUser?.uid);


  useEffect(() => {
    // Inicializar BD local
    initLocalDB();

    // Cargar reportes locales
    cargarReportesLocales();

    // Iniciar sincronización automática si hay usuario logueado
    const userId = auth.currentUser?.uid;
    if (userId) {
      iniciarSincronizacionAutomatica(userId);
    }

    // Limpiar al desmontar
    return () => {
      detenerSincronizacionAutomatica();
    };
  }, []);

  const cargarReportesLocales = async () => {
    const reportesLocales = await getReportesLocales();
    console.log('📊 Reportes con sincronizado:', reportesLocales.map(r => ({ titulo: r.titulo, sincronizado: r.sincronizado })));
    // Transformar a formato compatible con el renderizado existente
    const reportesFormateados = reportesLocales.map(r => ({
      id: r.id,
      _id: r.id,
      title: r.titulo,
      description: r.descripcion,
      image: r.foto_url,
      user: r.user_name || 'Anónimo',
      direccion: r.direccion || null,
      etiquetas: Array.isArray(r.etiquetas) ? r.etiquetas : [],
      estado: r.estado || 'pendiente',
      creadoEn: new Date(r.timestamp_original),
      ubicacion: { latitude: r.latitud, longitude: r.longitud },
      sincronizado: r.sincronizado === 1 || r.sincronizado === true
    }));
    setReportes(reportesFormateados);
  };

  const resetearYReSincronizar = async () => {
    console.log('🔄 Reseteando y sincronizando...');

    // Borrar todos los reportes locales
    await limpiarDatosLocales();
    console.log('🗑️ Todos los reportes eliminados');

    // Sincronizar para traer los del servidor
    const userId = auth.currentUser?.uid;
    if (userId) {
      await sincronizarCompleto(userId);
    }

    // Recargar feed
    await cargarReportesLocales();
    console.log('✅ Proceso completado');
  };

  const obtenerTextoDireccion = (item) => {
    if (item.direccion) {
      return item.direccion;
    }
    if (item.ubicacion?.latitude && item.ubicacion?.longitude
      && item.ubicacion.latitude !== 0 && item.ubicacion.longitude !== 0) {
      return `📍 ${item.ubicacion.latitude.toFixed(4)}, ${item.ubicacion.longitude.toFixed(4)}`;
    }
    return 'Ubicación no disponible';
  };

  const handleSync = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'Debes iniciar sesión para sincronizar');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Verificando conexión...');

    const hayInternet = await isConnected();
    if (!hayInternet) {
      Alert.alert('⚠️ Sin conexión', 'No hay internet. Los reportes se sincronizarán cuando tengas conexión.');
      setIsSyncing(false);
      setSyncStatus('');
      return;
    }

    setSyncStatus('Sincronizando con el servidor...');
    const resultado = await sincronizarCompleto(userId);

    if (resultado.success) {
      await cargarReportesLocales();
      Alert.alert(
        '✅ Sincronización completada',
        `📤 Subidos: ${resultado.subidos}\n📥 Descargados: ${resultado.descargados}\n${resultado.errores > 0 ? `⚠️ Errores: ${resultado.errores}` : ''}`
      );
    } else {
      Alert.alert('❌ Error', resultado.error || 'Error en la sincronización');
    }

    setIsSyncing(false);
    setSyncStatus('');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarReportesLocales();
    setRefreshing(false);
  };

  const handleShare = async (title, description) => {
    try {
      await Share.share({
        message: `${title}: ${description}`,
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir');
    }
  };

  const handleReport = (title) => {
    Alert.alert('Publicación reportada', `Has reportado: ${title}`);
  };

  const goToDetail = (reporte) => {
    navigation.navigate('ReportDetail', { reporte });
  };

  const renderPost = ({ item }) => {
    /*     const direccionRecortada = item.direccion?.length > 50
          ? item.direccion.slice(0, 50) + '...'
          : item.direccion || 'Ubicación no disponible'; */

    return (
      <TouchableOpacity style={styles.post} onPress={() => goToDetail(item)}>
        {/* Usuario */}
        <Text style={styles.user}>👤 {item.user}</Text>

        {/* Fecha de publicación */}
        {item.creadoEn && (
          <Text style={styles.fecha}>
            🕒 {item.creadoEn.toLocaleString('es-MX', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </Text>
        )}

        {/* Indicador de sincronización pendiente */}
        {!item.sincronizado && (
          <View style={styles.pendienteContainer}>
            <Text style={styles.pendienteTexto}>⏳ Pendiente de sincronizar</Text>
          </View>
        )}

        {/* Imagen */}
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.image} />
        )}

        {/* Título */}
        <Text style={styles.title}>{item.title}</Text>

        {/* Descripción */}
        <Text style={styles.description}>{item.description}</Text>

        {/* Dirección */}
        <Text style={styles.direccion}>📍 {obtenerTextoDireccion(item)}</Text>

        {/* Etiquetas */}
        {item.etiquetas?.length > 0 && (
          <View style={styles.etiquetasContainer}>
            {item.etiquetas.map((etiqueta, index) => (
              <Text key={index} style={styles.etiqueta}>#{etiqueta}</Text>
            ))}
          </View>
        )}

        {/* Acciones */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleShare(item.title, item.description)}>
            <Text style={styles.actionText}>📤 Compartir</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleReport(item.title)}>
            <Text style={styles.actionText}>🚩 Reportar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Barra de sincronización */}
      <View style={styles.syncBar}>
        <TouchableOpacity
          style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
          onPress={handleSync}
          disabled={isSyncing}
        >
          <Text style={styles.syncButtonText}>
            {isSyncing ? '🔄 Sincronizando...' : '🔄 Sincronizar'}
          </Text>
        </TouchableOpacity>

        {/* Botón temporal para limpiar duplicados */}
{/*         <TouchableOpacity
          style={styles.clearButton}
          onPress={resetearBaseDatosLocal}
        >
          <Text style={styles.clearButtonText}>🗑️ Limpiar Documentos</Text>
        </TouchableOpacity> */}

        {syncStatus !== '' && (
          <Text style={styles.syncStatus}>{syncStatus}</Text>
        )}
      </View>


      {/* Lista de reportes */}
      <FlatList
        data={reportes}
        keyExtractor={(item) => item.id} // o _id, pero consistente
        renderItem={renderPost}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={<Text style={styles.empty}>No hay reportes aún. ¡Crea tu primero!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 10 },
  syncBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  syncButton: {
    backgroundColor: '#2c4d4e',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  syncButtonDisabled: {
    backgroundColor: '#aaa',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  // Estilos nuevos para el botón de limpiar duplicados
  clearButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  syncStatus: {
    fontSize: 12,
    color: '#666',
  },
  post: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    elevation: 3,
  },
  image: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  description: { fontSize: 16, marginVertical: 5 },
  direccion: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  user: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  etiquetasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  fecha: {
    fontSize: 12,
    color: '#777',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  etiqueta: {
    backgroundColor: '#007BFF',
    color: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 5,
    borderRadius: 15,
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionText: {
    fontSize: 14,
    color: '#007BFF',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
  pendienteContainer: {
    backgroundColor: '#FFF3E0',
    padding: 5,
    borderRadius: 5,
    marginBottom: 10,
  },
  pendienteTexto: {
    color: '#FF9800',
    fontSize: 12,
    textAlign: 'center',
  },
});