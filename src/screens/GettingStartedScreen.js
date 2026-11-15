import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTheme } from '../constants/theme';

export default function GettingStartedScreen({ navigation }) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image
        source={require('../../assets/icono_blanco.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Logo de Reportly"
      />
      <Text style={[styles.title, { color: theme.text }]}>Reportly</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={() => navigation.navigate('Register')}
        accessibilityRole="button"
      >
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>Comenzar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 260, height: 260, marginBottom: -40 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 40 },
  button: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 10 },
  buttonText: { fontSize: 16 },
});
