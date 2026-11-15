import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { auth } from '../config/firebaseConfig';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfile, createUserProfile } from '../services/userService';
import { subscribeToUserReports } from '../services/reportsService';

const { width } = Dimensions.get('window');
const ITEM_MARGIN = 6;
const CARD_WIDTH = (width - 32 - ITEM_MARGIN) / 2; // 2 columnas con padding de pantalla

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const user = auth.currentUser;

  // Cargar perfil del usuario desde Firestore
  const cargarPerfil = useCallback(async () => {
    if (!user) {
      setLoadingProfile(false);
      return;
    }

    try {
      const profileData = await getUserProfile(user.uid);
      if (profileData) {
        setProfile(profileData);
      } else {
        const defaultProfile = await createUserProfile(user.uid, {
          username: user.displayName || (user.email ? user.email.split('@')[0] : 'Usuario'),
          address: '',
          profileImage: '',
          posts: [],
        });
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil.');
    } finally {
      setLoadingProfile(false);
    }
  }, [user]);

  // Recargar perfil cada vez que la pantalla entra en foco (ej. volviendo de EditProfile)
  useFocusEffect(
    useCallback(() => {
      cargarPerfil();
    }, [cargarPerfil])
  );

  // Suscripción en tiempo real a los reportes del usuario actual
  useEffect(() => {
    if (!user) {
      setLoadingReports(false);
      return;
    }

    const unsubscribe = subscribeToUserReports(
      user.uid,
      (reports) => {
        setUserReports(reports);
        setLoadingReports(false);
        setRefreshing(false);
      },
      (error) => {
        console.error('Error escuchando reportes del usuario:', error);
        setLoadingReports(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarPerfil();
    // La suscripción a reportes se actualiza automáticamente con Firestore
    setTimeout(() => setRefreshing(false), 800);
  };

  // Métricas calculadas para la cabecera estilo Instagram
  const totalReports = userReports.length;
  const resolvedReports = userReports.filter((r) => r.estado === 'resuelto').length;
  const pendingReports = userReports.filter((r) => r.estado === 'pendiente').length;

  const goToDetail = (reporte) => {
    navigation.navigate('ReportDetail', { reporte });
  };

  const renderBadge = (estado) => {
    if (estado === 'resuelto') {
      return (
        <View style={[styles.badge, styles.badgeResuelto]}>
          <Text style={styles.badgeText}>✓ Resuelto</Text>
        </View>
      );
    }
    if (estado === 'no_resuelto') {
      return (
        <View style={[styles.badge, styles.badgeNoResuelto]}>
          <Text style={styles.badgeText}>✕ No Resuelto</Text>
        </View>
      );
    }
    return (
      <View style={[styles.badge, styles.badgePendiente]}>
        <Text style={styles.badgeText}>🕒 Pendiente</Text>
      </View>
    );
  };

  const renderReportItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => goToDetail(item)}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.cardNoImage}>
            <Ionicons name="megaphone-outline" size={32} color="#2c4d4e" />
            <Text style={styles.noImageCategory} numberOfLines={1}>
              {item.etiquetas?.[0] ? `#${item.etiquetas[0]}` : 'Incidencia'}
            </Text>
          </View>
        )}

        {/* Insignia de estado en la esquina superior */}
        <View style={styles.badgeWrapper}>{renderBadge(item.estado)}</View>

        {/* Título en la parte inferior sobre overlay */}
        <View style={styles.titleOverlay}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title || 'Sin título'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        {/* Barra superior con Ajustes */}
        <View style={styles.topBar}>
          <Text style={styles.screenTitle}>Mi Perfil</Text>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('EditProfile')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Sección Principal: Avatar y Estadísticas Estilo Instagram */}
        <View style={styles.profileRow}>
          {profile?.profileImage ? (
            <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <Ionicons name="person-circle-outline" size={82} color="#bbb" />
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>{totalReports}</Text>
              <Text style={styles.statLabel}>Reportes</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={[styles.statNumber, { color: '#2e7d32' }]}>{resolvedReports}</Text>
              <Text style={styles.statLabel}>Resueltos</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={[styles.statNumber, { color: '#e65100' }]}>{pendingReports}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
          </View>
        </View>

        {/* Información del Usuario (Nombre y Ubicación) */}
        <View style={styles.bioSection}>
          <Text style={styles.username}>{profile?.username || 'Usuario'}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={15} color="#555" />
            <Text style={styles.address}>
              {profile?.address ? profile.address : 'Ubicación no configurada'}
            </Text>
          </View>
        </View>

        {/* Botón Ancho Estilo Instagram "Editar Perfil" */}
        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editProfileButtonText}>Editar perfil</Text>
        </TouchableOpacity>

        {/* Divisor / Pestaña de Publicaciones */}
        <View style={styles.tabSection}>
          <View style={styles.tabActive}>
            <Ionicons name="grid-outline" size={20} color="#2c4d4e" />
            <Text style={styles.tabTextActive}>Mis Publicaciones ({totalReports})</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loadingReports) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="small" color="#2c4d4e" />
          <Text style={styles.emptySubtext}>Cargando reportes...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={60} color="#bbb" />
        <Text style={styles.emptyTitle}>Aún no tienes reportes</Text>
        <Text style={styles.emptySubtext}>
          Cuando crees un reporte de baches, luminarias o fallas urbanas, aparecerá en esta cuadrícula.
        </Text>
        <TouchableOpacity
          style={styles.createReportBtn}
          onPress={() => navigation.navigate('Create')}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.createReportBtnText}>Crear un reporte</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loadingProfile && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2c4d4e" />
        <Text style={{ marginTop: 10, color: '#666' }}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={userReports}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={renderReportItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2c4d4e']} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  settingsBtn: {
    padding: 4,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#eee',
    borderWidth: 2,
    borderColor: '#2c4d4e',
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 16,
  },
  statColumn: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  bioSection: {
    marginBottom: 14,
  },
  username: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    marginLeft: 4,
    fontSize: 13,
    color: '#555',
  },
  editProfileButton: {
    backgroundColor: '#f0f3f3',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d0dcdc',
    marginBottom: 16,
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c4d4e',
  },
  tabSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
    marginBottom: 12,
  },
  tabActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTextActive: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#2c4d4e',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: ITEM_MARGIN,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH, // Aspect ratio 1:1 cuadrado (estilo Instagram)
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f2f2f2',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardNoImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e7eeef',
    padding: 10,
  },
  noImageCategory: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    color: '#2c4d4e',
  },
  badgeWrapper: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeResuelto: {
    backgroundColor: 'rgba(46, 125, 50, 0.9)',
  },
  badgeNoResuelto: {
    backgroundColor: 'rgba(198, 40, 40, 0.9)',
  },
  badgePendiente: {
    backgroundColor: 'rgba(230, 81, 0, 0.9)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#444',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  createReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c4d4e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createReportBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
