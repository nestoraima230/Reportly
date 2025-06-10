import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { loginWithEmail } from '../config/firebaseAuthService';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../config/firebaseConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const db = getFirestore(app);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    if (!trimmedPassword) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (trimmedPassword.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        const user = await loginWithEmail(email.trim(), password.trim());

        const userDocRef = doc(db, 'usuarios', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const profile = userDoc.data();
          console.log('Perfil cargado:', profile);
          // navigation.navigate('Profile', { profile });
          //Alert.alert('Inicio de sesión exitoso', `¡Bienvenido de nuevo, ${profile.username || 'usuario'}!`);
        } else {
          Alert.alert('Error', 'No se encontraron datos del perfil.');
        }
      } catch (error) {
        Alert.alert("Error al iniciar sesión", error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Hola de nuevo!</Text>
      <Text style={styles.subtitle}>Inicia sesión</Text>

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

      <TouchableOpacity>
        <Text style={styles.forgotText}>¿Olvidaste la contraseña?</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#2c4d4e" style={{ marginTop: 10 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.switchText}>
        ¿Eres nuevo?{' '}
        <Text style={styles.linkText} onPress={() => navigation.navigate('Register')}>
          Regístrate aquí
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 8,
    borderRadius: 8,
  },
  forgotText: {
    textAlign: 'right',
    color: '#2c4d4e',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2c4d4e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16 },
  switchText: { marginTop: 20, textAlign: 'center' },
  linkText: { color: '#2c4d4e', fontWeight: 'bold' },
  errorText: { color: 'red', marginBottom: 6, marginLeft: 4 },
});
