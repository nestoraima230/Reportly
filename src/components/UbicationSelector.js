import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const UbicationSelector = ({ onLocationSelected, selectedLocation, style }) => {
  const [location, setLocation] = useState(null);
  const [mapLocation, setMapLocation] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  const defaultLocation = {
    latitude: 19.4326,
    longitude: -99.1332,
  };

  useEffect(() => {
    const getLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso Denegado',
          'Se requieren permisos de ubicación para utilizar esta función.',
          [{ text: 'Entendido' }]
        );
        setIsFetching(false);
        return;
      }

      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (error) {
        Alert.alert(
          'Error',
          'No se pudo obtener la ubicación actual. Usando ubicación por defecto.',
          [{ text: 'Entendido' }]
        );
      } finally {
        setIsFetching(false);
      }
    };

    getLocationPermission();
  }, []);

  useEffect(() => {
    if (selectedLocation === null) {
      setMapLocation(null); 
    }
  }, [selectedLocation]);

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newLocation = {
      latitude,
      longitude,
    };
    setMapLocation(newLocation);
    onLocationSelected(newLocation);
  };

  if (isFetching) {
    return (
      <View style={[styles.loader, style]}>
        <ActivityIndicator size="large" color="#2c4d4e" />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        style={styles.map}
        initialRegion={{
          ...(location || defaultLocation),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
      >
        {mapLocation && (
          <Marker title="Ubicación seleccionada" coordinate={mapLocation} />
        )}
        {selectedLocation && !mapLocation && (
          <Marker title="Ubicación actual" coordinate={selectedLocation} />
        )}
      </MapView>
    </View>
  );
};

export default UbicationSelector;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
