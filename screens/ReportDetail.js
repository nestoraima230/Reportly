import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

export default function ReportDetail({ route }) {
  // Mejor manejo de parámetros con valores por defecto
  const report = route.params?.reporte || route.params?.report || {
    title: 'Reporte no disponible',
    user: 'Anónimo',
    description: 'No hay descripción proporcionada',
    direccion: 'Ubicación desconocida',
    etiquetas: [],
    comments: []
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{report.title || 'Sin título'}</Text>
      <Text style={styles.user}>👤 {report.user || 'Anónimo'}</Text>

      {report.image ? (
        <Image 
          source={{ uri: report.image }} 
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.noImage]}>
          <Text>No hay imagen</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>Descripción:</Text>
        <Text style={styles.text}>
          {report.description || 'No hay descripción disponible'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Dirección:</Text>
        <Text style={styles.text}>
          📍 {report.direccion || 'Ubicación no especificada'}
        </Text>
      </View>

      {report.etiquetas?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Etiquetas:</Text>
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
          <Text style={styles.label}>Comentarios ({report.comments.length}):</Text>
          {report.comments.map((comment, index) => (
            <View key={`comment-${index}`} style={styles.commentContainer}>
              <Text style={styles.comment}>• {comment}</Text>
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
    backgroundColor: '#fff',
    paddingBottom: 30
  },
  section: {
    marginBottom: 20
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginVertical: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  noImage: {
    backgroundColor: '#eaeaea'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },
  user: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
    color: '#444'
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: '#555'
  },
  etiquetasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5
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
    overflow: 'hidden'
  },
  commentContainer: {
    marginTop: 8,
    paddingLeft: 5,
    borderLeftWidth: 2,
    borderLeftColor: '#007BFF'
  },
  comment: {
    fontSize: 15,
    color: '#555',
    lineHeight: 20
  }
});