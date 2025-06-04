import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, Share } from 'react-native';
import { FAB } from 'react-native-paper';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { app } from '../config/firebaseConfig';

const db = getFirestore(app);

export default function Feed() {
  const [reportes, setReportes] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'reportes'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().titulo,
        description: doc.data().descripcion,
        image: doc.data().imagenURL,
        comments: doc.data().comentarios || [],
      }));
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

  const renderPost = ({ item }) => (
    <View style={styles.post}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : null}
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleShare(item.title, item.description)}>
          <Text style={styles.actionText}>📤 Compartir</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleReport(item.title)}>
          <Text style={[styles.actionText, { color: 'red' }]}>🚩 Reportar</Text>
        </TouchableOpacity>
      </View>

      {item.comments?.length > 0 && (
        <View style={styles.comments}>
          <Text style={styles.commentsTitle}>Comentarios:</Text>
          {item.comments.map((comment, index) => (
            <Text key={index} style={styles.comment}>• {comment}</Text>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={reportes}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hay reportes aún</Text>}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        label="Nuevo"
        onPress={() => navigation.navigate('CreateReport')}
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
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  actionText: { fontSize: 14, color: '#007BFF' },
  comments: { marginTop: 10 },
  commentsTitle: { fontWeight: 'bold', marginBottom: 5 },
  comment: { fontSize: 14, marginLeft: 10 },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#007BFF',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
});
