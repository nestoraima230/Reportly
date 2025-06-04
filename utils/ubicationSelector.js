import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const UbicationSelector = ({ onLocationSelected, style }) => {
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
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
          'Permission Denied',
          'Location permission is required to use this feature.',
          [{ text: 'Okay' }]
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
          'Could not fetch location. Using default location.',
          [{ text: 'Okay' }]
        );
      } finally {
        setIsFetching(false);
      }
    };

    getLocationPermission();
  }, []);

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newLocation = {
      latitude,
      longitude,
    };
    setSelectedLocation(newLocation);
    onLocationSelected(newLocation);
  };

  if (isFetching) {
    return (
      <View style={[styles.loader, style]}>
        <ActivityIndicator size="large" color="#0000ff" />
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
        {selectedLocation && (
          <Marker title="Selected Location" coordinate={selectedLocation} />
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
