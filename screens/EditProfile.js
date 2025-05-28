import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfile() {
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState(null);

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

  const handleSave = () => {
    if (!username || !address) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    // Aquí puedes guardar los datos en tu backend o base de datos local
    Alert.alert('Perfil actualizado', 'Los cambios se han guardado correctamente');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
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
      />

      <TextInput
        placeholder="Dirección"
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
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
  },
  button: {
    backgroundColor: '#2c4d4e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontSize: 16 },
});