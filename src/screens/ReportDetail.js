import React, { useContext, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Button, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ROLES } from '../constants/roles';
import { updateReportStatus, deleteReport } from '../services/reportsService';
import { useTheme } from '../constants/theme';

export default function ReportDetail({ route }) {
  const { user, userRole } = useContext(AuthContext);
  const navigation = useNavigation();
  const theme = useTheme();
  const [eliminando, setEliminando] = useState(false);

  const report = route.params?.reporte || route.params?.report || {
    title: 'Reporte no disponible',
    user: 'Anónimo',
    description: 'No hay descripción proporcionada',
    direccion: 'Ubicación desconocida',
    etiquetas: [],
    comments: [],
    id: null,
    latitude: null,
    longitude: null,
    userId: null,
  };

  const esAutor = Boolean(user?.uid && report?.userId && user.uid === report.userId);
  const esAdmin = userRole === ROLES.ADMIN;
  const puedeEliminar = esAutor || esAdmin;

  const confirmarEliminacion = () => {
    Alert.alert(
      'Eliminar reporte',
      '¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: ejecutarEliminacion,
        },
      ]
    );
  };

  const ejecutarEliminacion = async () => {
    if (!report.id) return;
    setEliminando(true);
    try {
      await deleteReport(report.id);
      Alert.alert('Reporte eliminado', 'El reporte ha sido eliminado correctamente.');
      navigation.goBack();
    } catch (error) {
      console.error('Error al eliminar el reporte:', error);
      Alert.alert('Error', 'No se pudo eliminar el reporte. Inténtalo de nuevo.');
      setEliminando(false);
    }
  };

  useLayoutEffect(() => {
    if (puedeEliminar && report.id) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={confirmarEliminacion}
            disabled={eliminando}
            style={{ paddingHorizontal: 10, paddingVertical: 5 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {eliminando ? (
              <ActivityIndicator size="small" color="#e53935" />
            ) : (
              <Ionicons name="trash-outline" size={22} color="#e53935" />
            )}
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: () => null,
      });
    }
  }, [navigation, puedeEliminar, report.id, eliminando]);

  const cambiarEstado = async (nuevoEstado) => {
    try {
      await updateReportStatus(report.id, nuevoEstado);
      Alert.alert('Éxito', `El reporte fue marcado como ${nuevoEstado}`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado.');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
      style={{ backgroundColor: theme.background }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: theme.text }]}>{report.title || 'Sin título'}</Text>
      <Text style={[styles.user, { color: theme.textSecondary }]}>👤 {report.user || 'Anónimo'}</Text>

      {report.estado && (
        <Text
          style={[
            styles.estado,
            report.estado === 'resuelto'
              ? styles.estadoResuelto
              : report.estado === 'no_resuelto'
                ? styles.estadoNoResuelto
                : styles.estadoPendiente
          ]}
        >
          Estado:{' '}
          {report.estado === 'resuelto'
            ? '✅ Resuelto'
            : report.estado === 'no_resuelto'
              ? '❌ No Resuelto'
              : '🕒 Pendiente'}
        </Text>
      )}

      {report.image ? (
        <Image source={{ uri: report.image }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.noImage, { backgroundColor: theme.surface }]}>
          <Text style={{ color: theme.textMuted }}>No hay imagen</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.label }]}>Descripción:</Text>
        <Text style={[styles.text, { color: theme.text }]}>{report.description || 'No hay descripción disponible'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.label }]}>Dirección:</Text>
        <Text style={[styles.text, { color: theme.text }]}>📍 {report.direccion || 'Ubicación no especificada'}</Text>

        {/* BOTÓN DE MAPA */}
        {report.ubicacion?.latitude && report.ubicacion?.longitude && (
          <TouchableOpacity
            style={[styles.mapButton, { backgroundColor: theme.button }]}
            onPress={() =>
              navigation.navigate('MapScreen', {
                latitude: report.ubicacion.latitude,
                longitude: report.ubicacion.longitude,
              })
            }
          >
            <Text style={styles.mapButtonText}>Ver en el mapa</Text>
          </TouchableOpacity>
        )}
      </View>

      {userRole === ROLES.ADMIN && report.id && (
        <View style={{ marginTop: 20 }}>
          <Button title="Marcar como Resuelto" onPress={() => cambiarEstado('resuelto')} />
          <Button title="Marcar como No Resuelto" onPress={() => cambiarEstado('no_resuelto')} />
        </View>
      )}

      {report.etiquetas?.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.label }]}>Etiquetas:</Text>
          <View style={styles.etiquetasContainer}>
            {report.etiquetas.map((etiqueta, index) => (
              <Text key={`tag-${index}`} style={styles.etiqueta}>
                #{etiqueta}
              </Text>
            ))}
          </View>
        </View>
      )}

      {report.comments?.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.label }]}>Comentarios ({report.comments.length}):</Text>
          {report.comments.map((comment, index) => (
            <View key={`comment-${index}`} style={styles.commentContainer}>
              <Text style={[styles.comment, { color: theme.text }]}>• {comment}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImage: {
    // backgroundColor se aplica dinámicamente con theme.surface
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    // color se aplica dinámicamente con theme.text
  },
  user: {
    fontSize: 14,
    marginBottom: 15,
    // color se aplica dinámicamente con theme.textSecondary
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
    // color se aplica dinámicamente con theme.label
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    // color se aplica dinámicamente con theme.text
  },
  etiquetasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  etiqueta: {
    backgroundColor: '#007BFF',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 14,
    overflow: 'hidden',
  },
  commentContainer: {
    marginTop: 8,
    paddingLeft: 5,
    borderLeftWidth: 2,
    borderLeftColor: '#007BFF',
  },
  comment: {
    fontSize: 15,
    lineHeight: 20,
    // color se aplica dinámicamente con theme.text
  },
  estado: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  estadoResuelto: {
    color: 'green',
  },
  estadoNoResuelto: {
    color: 'red',
  },
  estadoPendiente: {
    color: 'orange',
  },
  mapButton: {
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    // backgroundColor se aplica dinámicamente con theme.button
  },
  mapButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
