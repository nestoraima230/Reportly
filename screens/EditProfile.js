import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { subirImagen } from '../utils/subirImagen';

export default function EditProfile() {
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigation = useNavigation();
  const user = auth.currentUser;

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        if (user) {
          const userDocRef = doc(db, 'usuarios', user.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUsername(data.username || '');
            setAddress(data.address || '');
            setProfileImage(data.profileImage || null);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos del perfil.');
      }
    };

    cargarDatos();
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!username || !address) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = profileImage || '';

      // Si se seleccionó una imagen local (file://, content://, etc.), la subimos a Cloudinary
      if (
        profileImage &&
        (profileImage.startsWith('file://') ||
          profileImage.startsWith('content://') ||
          profileImage.startsWith('ph://'))
      ) {
        finalImageUrl = await subirImagen(profileImage);
      }

      const userDocRef = doc(db, 'usuarios', user.uid);

      await updateDoc(userDocRef, {
        username,
        address,
        profileImage: finalImageUrl,
      });

      Alert.alert('Perfil actualizado', 'Los cambios se han guardado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      Alert.alert('Error', 'No se pudo guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker} disabled={saving}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>Agregar Foto</Text>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Nombre de usuario"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        editable={!saving}
      />

      <TextInput
        placeholder="Dirección"
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        editable={!saving}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Guardar Cambios</Text>
        )}
      </TouchableOpacity>

      {/* Botón de Cerrar Sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={saving}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  imagePicker: {
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 75,
    width: 150,
    height: 150,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { color: '#777' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#2c4d4e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontSize: 16 },
  
  // Estilos para el botón de cerrar sesión
  logoutButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#b00020',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
