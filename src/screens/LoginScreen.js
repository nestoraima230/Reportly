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
import { loginWithEmail, resetPassword } from '../config/firebaseAuthService';
import { getUserProfile } from '../services/userService';
import { getAuthErrorMessage } from '../utils/authErrors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Ingresa un correo electrónico válido (ej. usuario@correo.com)';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      setLoading(true);
      const normalizedEmail = email.trim().toLowerCase();
      try {
        const user = await loginWithEmail(normalizedEmail, password);
        const profile = await getUserProfile(user.uid);

        if (!profile) {
          console.warn('No se encontró perfil para el usuario logueado.');
        }
      } catch (error) {
        const friendlyMessage = getAuthErrorMessage(error);
        Alert.alert('Error al iniciar sesión', friendlyMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrors((prev) => ({
        ...prev,
        email: 'Ingresa tu correo para enviarte el enlace de recuperación',
      }));
      Alert.alert(
        'Recuperar contraseña',
        'Por favor ingresa un correo electrónico válido en el campo correspondiente para enviarte las instrucciones.'
      );
      return;
    }

    setResettingPassword(true);
    try {
      await resetPassword(trimmedEmail);
      Alert.alert(
        'Correo enviado',
        `Hemos enviado un enlace para restablecer tu contraseña a ${trimmedEmail}. Revisa también tu carpeta de spam.`
      );
    } catch (error) {
      const friendlyMessage = getAuthErrorMessage(error);
      Alert.alert('No se pudo enviar el correo', friendlyMessage);
    } finally {
      setResettingPassword(false);
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
          <Text style={styles.title}>¡Hola de nuevo!</Text>
          <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>

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
              placeholder="Tu contraseña"
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

          {/* Botón ¿Olvidaste la contraseña? */}
          <TouchableOpacity
            onPress={handleForgotPassword}
            disabled={resettingPassword}
            style={styles.forgotButton}
          >
            <Text style={styles.forgotText}>
              {resettingPassword ? 'Enviando enlace...' : '¿Olvidaste la contraseña?'}
            </Text>
          </TouchableOpacity>

          {/* Botón Iniciar Sesión */}
          {loading ? (
            <ActivityIndicator size="large" color="#2c4d4e" style={{ marginTop: 10 }} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            </TouchableOpacity>
          )}

          {/* Navegación a Registro */}
          <Text style={styles.switchText}>
            ¿Eres nuevo?{' '}
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate('Register')}
            >
              Regístrate aquí
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
  },
  container: {
    padding: 24,
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
    marginBottom: 24,
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 20,
  },
  forgotText: {
    color: '#2c4d4e',
    fontWeight: '500',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2c4d4e',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
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
