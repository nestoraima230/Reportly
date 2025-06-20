import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { collection, query, where, onSnapshot, updateDoc, doc, getFirestore, serverTimestamp } from 'firebase/firestore';
import { app } from '../config/firebaseConfig';

const db = getFirestore(app);

export default function AdminPanel() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reportes'), where('estado', '==', 'pendiente'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReportes(datos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await updateDoc(doc(db, 'reportes', id), {
        estado: nuevoEstado,
        actualizadoEn: serverTimestamp()
      });
      Alert.alert('Éxito', `Reporte marcado como ${nuevoEstado}`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el estado.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.reporteCard}>
      <Text style={styles.titulo}>{item.titulo}</Text>
      <Text style={styles.descripcion}>{item.descripcion}</Text>
      <Text style={styles.usuario}>👤 {item.nombreUsuario || 'Anónimo'}</Text>
      <View style={styles.botones}>
        <TouchableOpacity style={[styles.boton, styles.resuelto]} onPress={() => cambiarEstado(item.id, 'resuelto')}>
          <Text style={styles.botonTexto}>✅ Resuelto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.boton, styles.noResuelto]} onPress={() => cambiarEstado(item.id, 'no_resuelto')}>
          <Text style={styles.botonTexto}>❌ No Resuelto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#2c4d4e" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <FlatList
      data={reportes}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
      ListEmptyComponent={<Text style={{ textAlign: 'center' }}>No hay reportes pendientes</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20
  },
  reporteCard: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  descripcion: {
    color: '#555',
    marginBottom: 8
  },
  usuario: {
    color: '#777',
    marginBottom: 10
  },
  botones: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  boton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center'
  },
  resuelto: {
    backgroundColor: 'green'
  },
  noResuelto: {
    backgroundColor: 'red'
  },
  botonTexto: {
    color: 'white',
    fontWeight: 'bold'
  }
});
