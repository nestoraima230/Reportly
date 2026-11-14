import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { registerWithEmail } from '../config/firebaseAuthService';
import { serverTimestamp } from 'firebase/firestore';
import { ROLES } from '../constants/roles';
import { createUserProfile } from '../services/userService';
import { getAuthErrorMessage } from '../utils/authErrors';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]{2,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Permite cualquier caracter (incluyendo símbolos), requiriendo al menos 1 letra y 1 número
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFullName) {
      newErrors.fullName = 'El nombre completo es obligatorio';
    } else if (!nameRegex.test(trimmedFullName)) {
      newErrors.fullName = 'Ingresa un nombre válido (solo letras, de 2 a 50 caracteres)';
    }

    if (!trimmedEmail) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Ingresa un correo electrónico válido (ej. usuario@correo.com)';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (!passwordRegex.test(password)) {
      newErrors.password = 'Debe incluir al menos una letra y un número';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar tu contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      setLoading(true);
      const normalizedEmail = email.trim().toLowerCase();
      const sanitizedName = fullName.trim();

      try {
        const userCredential = await registerWithEmail(
          normalizedEmail,
          password,
          sanitizedName
        );
        const user = userCredential.user;

        await createUserProfile(user.uid, {
          username: sanitizedName,
          profileImage: '',
          rol: ROLES.USER,
          address: '',
          posts: [],
          creadoEn: serverTimestamp(),
        });

        Alert.alert('Registro exitoso', `¡Bienvenido a Reportly, ${sanitizedName}!`);
      } catch (error) {
        const friendlyMessage = getAuthErrorMessage(error);
        Alert.alert('Error al registrarse', friendlyMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>¡Crea tu cuenta!</Text>
          <Text style={styles.subtitle}>Regístrate para comenzar a reportar</Text>

          {/* Campo Nombre Completo */}
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            placeholder="Ej. Juan Pérez"
            placeholderTextColor="#999"
            style={[styles.input, errors.fullName && styles.inputError]}
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (errors.fullName) {
                setErrors((prev) => ({ ...prev, fullName: null }));
              }
            }}
            autoCapitalize="words"
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

          {/* Campo Correo Electrónico */}
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            placeholder="ejemplo@correo.com"
            placeholderTextColor="#999"
            style={[styles.input, errors.email && styles.inputError]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: null }));
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Campo Contraseña */}
          <Text style={styles.label}>Contraseña</Text>
          <View
            style={[
              styles.passwordContainer,
              errors.password && styles.inputError,
            ]}
          >
            <TextInput
              placeholder="Mínimo 6 caracteres (letras y números)"
              placeholderTextColor="#999"
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: null }));
                }
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {/* Campo Confirmar Contraseña */}
          <Text style={styles.label}>Confirmar contraseña</Text>
          <View
            style={[
              styles.passwordContainer,
              errors.confirmPassword && styles.inputError,
            ]}
          >
            <TextInput
              placeholder="Repite tu contraseña"
              placeholderTextColor="#999"
              style={styles.passwordInput}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: null }));
                }
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          {/* Botón Registrarse */}
          {loading ? (
            <ActivityIndicator size="large" color="#2c4d4e" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Registrarse</Text>
            </TouchableOpacity>
          )}

          {/* Navegación a Login */}
          <Text style={styles.switchText}>
            ¿Ya tienes una cuenta?{' '}
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate('Login')}
            >
              Inicia sesión aquí
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  container: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
    color: '#2c4d4e',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    paddingLeft: 8,
  },
  inputError: {
    borderColor: '#d32f2f',
    backgroundColor: '#fff8f8',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#2c4d4e',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchText: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 15,
    color: '#555',
  },
  linkText: {
    color: '#2c4d4e',
    fontWeight: 'bold',
  },
});
