import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { loginWithEmail } from '../config/firebaseAuthService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      try {
        const user = await loginWithEmail(email, password);
        Alert.alert("Bienvenido", `Has iniciado sesión como ${user.email}`);
        //navigation.navigate('Home')
        //navigation.navigate("Feed"); 
      } catch (error) {
        Alert.alert("Error al iniciar sesión", error.message);
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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <Text style={styles.switchText}>
        ¿Eres nuevo?{' '}
        <Text style={styles.linkText} onPress={() => navigation.navigate('Register')}>
          Regístrate aquí
        </Text>
      </Text>

      {/* Botón para ir a Editar Perfil y Crear Reporte directamente */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#4e6270', marginTop: 30 }]}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Text style={styles.buttonText}>Ir a Editar Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#778899', marginTop: 10 }]}
        onPress={() => navigation.navigate('CreateReport')}
      >
       <Text style={styles.buttonText}>Ir a Crear Reporte</Text>
      </TouchableOpacity>
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
