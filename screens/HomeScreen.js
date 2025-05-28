// HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';

export default function HomeScreen({ user, navigation }) {
  const auth = getAuth();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('Sesión cerrada');
      })
      .catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Bienvenido {user?.displayName || user?.email || 'Usuario'}
      </Text>
      <Text>ID: {user?.uid}</Text>
      <Button title="Cerrar sesión" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, marginBottom: 10 },
});
