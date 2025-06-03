import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../config/firebaseConfig'; // Asegúrate de que la ruta es correcta

export default function CreateReport({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [etiquetas, setEtiquetas] = useState('');
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);

  const seleccionarImagen = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImagen(result.assets[0].uri);
    }
  };

  const subirImagen = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `reportes/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const publicarReporte = async () => {
    if (!titulo || !descripcion || !ubicacion) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    setLoading(true);
    let imagenURL = '';

    try {
      if (imagen) {
        imagenURL = await subirImagen(imagen);
      }

      await addDoc(collection(db, 'reportes'), {
        titulo,
        descripcion,
        ubicacion,
        etiquetas: etiquetas.split(',').map(e => e.trim()),
        imagenURL,
        creadoEn: serverTimestamp(),
      });

      Alert.alert('¡Reporte publicado!', `Tu reporte "${titulo}" ha sido guardado.`);
      navigation.navigate('Feed'); // o cualquier otra pantalla
    } catch (error) {
      console.error('Error al publicar:', error);
      Alert.alert('Error', 'No se pudo guardar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear nuevo reporte</Text>

      <TextInput
        style={styles.input}
        placeholder="Título del reporte"
        value={titulo}
        onChangeText={setTitulo}
      />

      <TouchableOpacity style={styles.imagePicker} onPress={seleccionarImagen}>
        {imagen ? (
          <Image source={{ uri: imagen }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>Seleccionar imagen</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Descripción"
        multiline
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TextInput
        style={styles.input}
        placeholder="Ubicación"
        value={ubicacion}
        onChangeText={setUbicacion}
      />

      <TextInput
        style={styles.input}
        placeholder="Etiquetas (separadas por comas)"
        value={etiquetas}
        onChangeText={setEtiquetas}
      />

      <TouchableOpacity style={styles.button} onPress={publicarReporte} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Publicar</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10,
    borderRadius: 8, marginBottom: 12
  },
  imagePicker: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 12
  },
  imagePlaceholder: { color: '#999' },
  image: { width: '100%', height: '100%', borderRadius: 8 },
  button: {
    backgroundColor: '#2c4d4e', padding: 15,
    borderRadius: 8, alignItems: 'center', marginTop: 10
  },
  buttonText: { color: '#fff', fontSize: 16 },
});
