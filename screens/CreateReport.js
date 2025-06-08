import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app, db } from '../config/firebaseConfig';
import UbicationSelector from '../utils/ubicationSelector';

// Función para obtener la colonia con Nominatim
const obtenerColonia = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
    );
    const data = await response.json();

    return (
      address.suburb ||
      address.neighbourhood ||
      address.village ||
      address.hamlet ||
      address.road ||
      "Desconocida"
    );
  } catch (error) {
    console.error('Error obteniendo colonia:', error);
    return 'Desconocido';
  }
};

export default function CreateReport({ navigation }) {
  const auth = getAuth(app);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacionTexto, setUbicacionTexto] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [etiquetas, setEtiquetas] = useState('');
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);

  const pedirPermisos = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert('Permisos requeridos', 'Necesitamos permisos de cámara y galería.');
      return false;
    }
    return true;
  };

  const seleccionarImagen = async () => {
    if (!(await pedirPermisos())) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        setImagen(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo acceder a la galería.');
    }
  };

  const tomarFoto = async () => {
    if (!(await pedirPermisos())) return;
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        setImagen(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara.');
    }
  };

  const subirImagen = async (uri) => {
    const data = new FormData();
    data.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'reporte.jpg',
    });
    data.append('upload_preset', 'report');
    data.append('cloud_name', 'dcsa4u3cj');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dcsa4u3cj/image/upload', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (result.secure_url) {
        return result.secure_url;
      } else {
        throw new Error('No se obtuvo la URL de Cloudinary');
      }
    } catch (error) {
      console.error('Error subiendo a Cloudinary:', error);
      throw error;
    }
  };

  const handleLocationSelected = async (location) => {
    setSelectedLocation(location);
    try {
      const [geoInfo] = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (geoInfo) {
        const dir = `${geoInfo.name || ''} ${geoInfo.street || ''}, ${geoInfo.city || ''}, ${geoInfo.region || ''}, ${geoInfo.country || ''}`.trim();
        setUbicacionTexto(dir);
      }
    } catch (error) {
      console.warn('Error reverse geocoding:', error);
      setUbicacionTexto('');
    }
  };

  const publicarReporte = async () => {
    if (!titulo || !descripcion || !selectedLocation) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    setLoading(true);
    let imagenURL = '';

    try {
      if (imagen) {
        imagenURL = await subirImagen(imagen);
      }

      const colonia = await obtenerColonia(
        selectedLocation.latitude,
        selectedLocation.longitude
      );

      await addDoc(collection(db, 'reportes'), {
        titulo,
        descripcion,
        ubicacion: selectedLocation,
        direccion: ubicacionTexto,
        colonia, // ✅ Se guarda la colonia
        etiquetas: etiquetas.split(',').map(e => e.trim()),
        imagenURL,
        creadoEn: serverTimestamp(),
        userId: auth.currentUser.uid,
        nombreUsuario: auth.currentUser.displayName || 'Sin nombre',
      });

      Alert.alert('¡Reporte publicado!', `Tu reporte "${titulo}" ha sido guardado.`);
      navigation.navigate('Feed');
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

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.imageBtn} onPress={seleccionarImagen}>
          <Text style={styles.imageBtnText}>📁 Galería</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.imageBtn} onPress={tomarFoto}>
          <Text style={styles.imageBtnText}>📷 Cámara</Text>
        </TouchableOpacity>
      </View>

      {imagen && <Image source={{ uri: imagen }} style={styles.image} />}

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Descripción"
        multiline
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TextInput
        style={styles.input}
        placeholder="Ubicación seleccionada"
        value={ubicacionTexto}
        editable={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Etiquetas (separadas por comas)"
        value={etiquetas}
        onChangeText={setEtiquetas}
      />

      <UbicationSelector
        onLocationSelected={handleLocationSelected}
        style={{ height: 300, marginVertical: 10 }}
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
  buttonRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12
  },
  imageBtn: {
    flex: 1, backgroundColor: '#ddd', padding: 10,
    borderRadius: 8, marginHorizontal: 5, alignItems: 'center'
  },
  imageBtnText: { color: '#333' },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 12 },
  button: {
    backgroundColor: '#2c4d4e', padding: 15,
    borderRadius: 8, alignItems: 'center', marginTop: 10
  },
  buttonText: { color: '#fff', fontSize: 16 },
});
