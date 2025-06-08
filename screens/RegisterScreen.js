import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { registerWithEmail } from '../config/firebaseAuthService';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '../config/firebaseConfig';

const db = getFirestore(app);


export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const usernameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,40}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName) {
      newErrors.fullName = 'El nombre es obligatorio';
    } else if (!usernameRegex.test(fullName)) {
      newErrors.fullName = 'Solo letras, máximo 40 caracteres, sin símbolos';
    }

    if (!email) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Correo inválido (ej. usuario@correo.com)';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleRegister = async () => {
  if (validateForm()) {
    try {
      const userCredential = await registerWithEmail(email, password, fullName);
      const user = userCredential.user;

      // Crear documento en Firestore con UID del usuario
      await setDoc(doc(db, 'usuarios', user.uid), {
        username: fullName,
        profileImage: '',
        address: '',
        posts: []
      });

      Alert.alert("Registro exitoso", `Bienvenido, ${fullName}`);
    } catch (error) {
      Alert.alert("Error al registrarse", error.message);
    }
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido!</Text>

      <TextInput
        placeholder="Nombre completo"
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
      />
      {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

      <TextInput
        placeholder="Correo electrónico"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <TextInput
        placeholder="Confirmar Contraseña"
        style={styles.input}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <Text style={styles.switchText}>
        ¿Ya tienes una cuenta?{' '}
        <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
          Inicia sesión aquí
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 6,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#2c4d4e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 16 },
  switchText: { marginTop: 20, textAlign: 'center' },
  linkText: { color: '#2c4d4e', fontWeight: 'bold' },
  errorText: { color: 'red', marginBottom: 6, marginLeft: 4 },
});