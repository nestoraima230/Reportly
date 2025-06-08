import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, Share } from 'react-native';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { app } from '../config/firebaseConfig';

const db = getFirestore(app);

export default function Feed() {
  const [reportes, setReportes] = useState([]);
  const navigation = useNavigation();

useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'reportes'), (snapshot) => {
    const data = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        title: d.titulo,
        description: d.descripcion,
        image: d.imagenURL,
        comments: d.comentarios || [],
        user: d.nombreUsuario || 'Anónimo',
        direccion: d.direccion || 'Ubicación no disponible',
        etiquetas: d.etiquetas || [],
        creadoEn: d.creadoEn?.toDate() || null, // ← Agregado aquí
      };
    });
    setReportes(data);
  });

  return () => unsubscribe();
}, []);


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
  const direccionRecortada = item.direccion.length > 50
    ? item.direccion.slice(0, 50) + '...'
    : item.direccion;

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

      {/* Imagen */}
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.image} />
      )}

      {/* Título */}
      <TouchableOpacity onPress={() => navigation.navigate('ReportDetail', { reporte: item })}>
        <Text style={styles.title}>{item.title}</Text>
      </TouchableOpacity>

      {/* Descripción */}
      <Text style={styles.description}>{item.description}</Text>

      {/* Dirección */}
      <Text style={styles.direccion}>📍 {direccionRecortada}</Text>

      {/* Etiquetas */}
      {item.etiquetas.length > 0 && (
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
      <FlatList
        data={reportes}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hay reportes aún</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 10 },
  post: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    elevation: 3,
  },
  image: { width: '100%', height: 200, borderRadius: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
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
});
