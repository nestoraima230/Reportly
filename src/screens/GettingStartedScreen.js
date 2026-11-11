import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function GettingStartedScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: 'https://snack-code-uploads.s3.us-west-1.amazonaws.com/~asset/4ec2593416d336823fce9aa7b55a384a',
        }}
        style={styles.logo}
      />
      <Text style={styles.title}>Reportly</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.buttonText}>Comenzar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  logo: { width: 100, height: 100, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 40 },
  button: { backgroundColor: '#2b4d45', padding: 15, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 16 },
});
