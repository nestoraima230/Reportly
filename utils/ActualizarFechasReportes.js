import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { app } from '../config/firebaseConfig';

export default function ActualizarFechasReportes() {
  const [cargando, setCargando] = useState(false);
  const [actualizados, setActualizados] = useState(0);
  const [completo, setCompleto] = useState(false);

  const db = getFirestore(app);

  const actualizarFechas = async () => {
    setCargando(true);
    setCompleto(false);
    setActualizados(0);

    try {
      const snapshot = await getDocs(collection(db, 'reportes'));
      const docsSinFecha = snapshot.docs.filter(doc => !doc.data().fechaCreacion);

      const actualizaciones = docsSinFecha.map(async (documento) => {
        await updateDoc(doc(db, 'reportes', documento.id), {
          fechaCreacion: serverTimestamp(),
        });
      });

      await Promise.all(actualizaciones);
      setActualizados(docsSinFecha.length);
      setCompleto(true);
      Alert.alert('Actualización completa', `Se actualizaron ${docsSinFecha.length} reportes.`);
    } catch (error) {
      console.error('Error al actualizar reportes:', error);
      Alert.alert('Error', 'No se pudieron actualizar los reportes.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actualizar Reportes Sin Fecha</Text>

      <Button
        title="Actualizar reportes antiguos"
        onPress={actualizarFechas}
        disabled={cargando}
      />

      {cargando && <ActivityIndicator style={{ marginTop: 10 }} />}
      {completo && (
        <Text style={styles.success}>
          ✅ Se actualizaron {actualizados} reportes correctamente.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20, justifyContent: 'center', alignItems: 'center'
  },
  title: {
    fontSize: 20, marginBottom: 20, fontWeight: 'bold'
  },
  success: {
    marginTop: 15, fontSize: 16, color: 'green'
  }
});
