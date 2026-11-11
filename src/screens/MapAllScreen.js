import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import MapView from "react-native-map-clustering";
import { Marker } from "react-native-maps";
import { subscribeToReports } from "../services/reportsService";

export default function MapAllScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToReports(
      (data) => {
        const filtered = data.filter(
          (d) =>
            d.ubicacion?.latitude !== undefined &&
            d.ubicacion?.longitude !== undefined
        );
        setReports(filtered);
        setLoading(false);
      },
      (error) => {
        console.log("Error cargando reportes en mapa:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2c4d4e" />
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      clusterColor="#2c4d4e"
      initialRegion={{
        latitude: 24.14231, // La Paz, BCS
        longitude: -110.31316,
        latitudeDelta: 0.4,
        longitudeDelta: 0.4,
      }}
    >
      {reports.map((rep) => (
        <Marker
          key={rep.id}
          coordinate={{
            latitude: rep.ubicacion.latitude,
            longitude: rep.ubicacion.longitude,
          }}
          title={rep.title}
          description={rep.description}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
