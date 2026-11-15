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
import { useTheme } from '../constants/theme';

export default function LoginScreen({ navigation }) {
  const theme = useTheme();

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
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={[styles.title, { color: theme.text }]}>¡Hola de nuevo!</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Inicia sesión en tu cuenta</Text>

          {/* Campo Correo Electrónico */}
          <Text style={[styles.label, { color: theme.label }]}>Correo electrónico</Text>
          <TextInput
            placeholder="ejemplo@correo.com"
            placeholderTextColor={theme.textMuted}
            style={[
              styles.input,
              { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.inputText },
              errors.email && styles.inputError,
            ]}
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
          <Text style={[styles.label, { color: theme.label }]}>Contraseña</Text>
          <View
            style={[
              styles.passwordContainer,
              { backgroundColor: theme.input, borderColor: theme.inputBorder },
              errors.password && styles.inputError,
            ]}
          >
            <TextInput
              placeholder="Tu contraseña"
              placeholderTextColor={theme.textMuted}
              style={[styles.passwordInput, { color: theme.inputText }]}
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
                color={theme.textSecondary}
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
            <Text style={[styles.forgotText, { color: theme.link }]}>
              {resettingPassword ? 'Enviando enlace...' : '¿Olvidaste la contraseña?'}
            </Text>
          </TouchableOpacity>

          {/* Botón Iniciar Sesión */}
          {loading ? (
            <ActivityIndicator size="large" color={theme.activityIndicator} style={{ marginTop: 10 }} />
          ) : (
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={handleLogin}>
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>Iniciar sesión</Text>
            </TouchableOpacity>
          )}

          {/* Navegación a Registro */}
          <Text style={[styles.switchText, { color: theme.switchText }]}>
            ¿Eres nuevo?{' '}
            <Text
              style={[styles.linkText, { color: theme.link }]}
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
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: {
    paddingLeft: 8,
  },
  inputError: {
    borderColor: '#d32f2f',
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
    fontWeight: '500',
    fontSize: 14,
  },
  button: {
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchText: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 15,
  },
  linkText: {
    fontWeight: 'bold',
  },
});
