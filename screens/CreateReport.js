import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function CreateReport({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [etiquetas, setEtiquetas] = useState('');
  const [imagen, setImagen] = useState(null);

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

  const publicarReporte = () => {
    if (!titulo || !descripcion || !ubicacion) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    Alert.alert('¡Reporte publicado!', `Título: ${titulo}`);
    // Aquí podrías guardar el reporte en una base de datos o backend
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

      <TouchableOpacity style={styles.button} onPress={publicarReporte}>
        <Text style={styles.buttonText}>Publicar</Text>
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
