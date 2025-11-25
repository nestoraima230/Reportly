import React from "react";
import { View, Text, StyleSheet, Button, Linking, Platform } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function MapScreen({ route }) {
  const { latitude, longitude } = route.params || {};

  if (!latitude || !longitude) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: "#555" }}>
          No hay ubicación disponible para este reporte.
        </Text>
      </View>
    );
  }

  const openInMaps = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}`,
    });

    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title="Ubicación del reporte"
          description="Punto reportado"
        />
      </MapView>

      <View style={styles.buttonContainer}>
        <Button title="Abrir en Google Maps" onPress={openInMaps} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    padding: 10,
    backgroundColor: "#fff",
  },
});
