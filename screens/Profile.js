import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { auth, db } from '../config/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const user = auth.currentUser;

        if (user) {
          const docRef = doc(db, 'usuarios', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            const defaultProfile = {
              username: user.email.split('@')[0],
              address: '',
              profileImage: '',
              posts: [],
            };
            await setDoc(docRef, defaultProfile);
            setProfile(defaultProfile);
          }
        } else {
          Alert.alert('Error', 'Usuario no autenticado');
        }
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
        Alert.alert('Error', 'No se pudo cargar el perfil.');
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2c4d4e" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text>No se encontró el perfil.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
        <Ionicons name="settings-outline" size={24} color="#555" />
      </TouchableOpacity>

      <View style={styles.header}>
        {profile.profileImage ? (
          <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholder]}>
            <Ionicons name="person-circle-outline" size={80} color="#ccc" />
          </View>
        )}
        <Text style={styles.username}>{profile.username}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color="#555" />
          <Text style={styles.address}>{profile.address || 'No disponible'}</Text>
        </View>
      </View>

      <FlatList
        data={profile.posts || []}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <Image source={{ uri: item.image }} style={styles.postImage} />
        )}
        contentContainerStyle={styles.posts}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}></Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  editBtn: { position: 'absolute', top: 40, right: 20, zIndex: 1 },
  header: { alignItems: 'center', marginTop: 80, marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ddd' },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  username: { fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  address: { marginLeft: 4, color: '#555' },
  posts: { paddingTop: 10 },
  postImage: { width: '48%', aspectRatio: 1, margin: '1%', borderRadius: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
