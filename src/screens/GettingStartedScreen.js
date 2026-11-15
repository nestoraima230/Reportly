import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function GettingStartedScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/icono_blanco.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Logo de Reportly"
      />
      <Text style={styles.title}>Reportly</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Register')}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Comenzar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  logo: { width: 260, height: 260, marginBottom: -40 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 40 },
  button: { backgroundColor: '#2b4d45', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 16 },
});