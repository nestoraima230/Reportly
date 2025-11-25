import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import MapView from "react-native-map-clustering";
import { Marker } from "react-native-maps";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export default function MapAllScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "reportes"));
        const data = [];

        querySnapshot.forEach((doc) => {
          const r = doc.data();
          if (r.ubicacion && r.ubicacion.latitude) {
            data.push({
              id: doc.id,
              ...r,
            });
          }
        });

        setReports(data);
        setLoading(false);
      } catch (error) {
        console.log("Error cargando reportes:", error);
        setLoading(false);
      }
    };

    loadReports();
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
        latitude:  24.14231,    //La Paz, BCS
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
          title={rep.titulo}
          description={rep.descripcion}
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
