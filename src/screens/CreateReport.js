import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { getAuth } from 'firebase/auth';
import { app } from '../config/firebaseConfig';
import UbicationSelector from '../components/UbicationSelector';
import { useFocusEffect } from '@react-navigation/native';
import { uploadImageToCloudinary } from '../services/storageService';
import { createReport } from '../services/reportsService';
import { useTheme } from '../constants/theme';

export default function CreateReport({ navigation }) {
  const auth = getAuth(app);
  const theme = useTheme();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacionTexto, setUbicacionTexto] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [etiquetas, setEtiquetas] = useState('');
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);

  const limpiarFormulario = () => {
    setTitulo('');
    setDescripcion('');
    setUbicacionTexto('');
    setImagen(null);
    setEtiquetas('');
    setSelectedLocation(null);
  };

  useFocusEffect(
    useCallback(() => {
      limpiarFormulario();
    }, [])
  );

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
        imagenURL = await uploadImageToCloudinary(imagen);
      }

      await createReport({
        titulo,
        descripcion,
        ubicacion: selectedLocation,
        direccion: ubicacionTexto,
        etiquetas: etiquetas ? etiquetas.split(',').map(e => e.trim()) : [],
        imagenURL,
        estado: "pendiente",
        userId: auth.currentUser?.uid || '',
        nombreUsuario: auth.currentUser?.displayName || 'Sin nombre',
      });

      Alert.alert('¡Reporte publicado!', `Tu reporte "${titulo}" ha sido guardado.`);
      navigation.navigate('Publicaciones');
    } catch (error) {
      console.error('Error al publicar:', error);
      Alert.alert('Error', 'No se pudo guardar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
      style={{ backgroundColor: theme.background }}
    >
      <Text style={[styles.title, { color: theme.text }]}>Crear nuevo reporte</Text>

      <TextInput
        style={[styles.input, {
          backgroundColor: theme.input,
          borderColor: theme.inputBorder,
          color: theme.inputText,
        }]}
        placeholder="Título del reporte"
        placeholderTextColor={theme.textMuted}
        value={titulo}
        onChangeText={setTitulo}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.imageBtn, { backgroundColor: theme.surface }]} onPress={seleccionarImagen}>
          <Text style={[styles.imageBtnText, { color: theme.text }]}>📁 Galería</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.imageBtn, { backgroundColor: theme.surface }]} onPress={tomarFoto}>
          <Text style={[styles.imageBtnText, { color: theme.text }]}>📷 Cámara</Text>
        </TouchableOpacity>
      </View>

      {imagen && <Image source={{ uri: imagen }} style={styles.image} />}

      <TextInput
        style={[styles.input, { height: 100, backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.inputText }]}
        placeholder="Descripción"
        placeholderTextColor={theme.textMuted}
        multiline
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TextInput
        style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.inputText }]}
        placeholder="Ubicación seleccionada"
        placeholderTextColor={theme.textMuted}
        value={ubicacionTexto}
        editable={false}
      />

      <TextInput
        style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.inputText }]}
        placeholder="Etiquetas (separadas por comas)"
        placeholderTextColor={theme.textMuted}
        value={etiquetas}
        onChangeText={setEtiquetas}
      />

      <UbicationSelector
        onLocationSelected={handleLocationSelected}
        selectedLocation={selectedLocation}
        style={{ height: 300, marginVertical: 10 }}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={publicarReporte}
        disabled={loading}
      >
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
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12
  },
  imageBtn: {
    flex: 1, padding: 10,
    borderRadius: 8, marginHorizontal: 5, alignItems: 'center'
  },
  imageBtnText: { fontWeight: '500' },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 12 },
  button: {
    padding: 15,
    borderRadius: 8, alignItems: 'center', marginTop: 10
  },
  buttonText: { color: '#fff', fontSize: 16 },
});
