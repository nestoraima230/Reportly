import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseApp } from '../config/firebaseConfig';

const screenWidth = Dimensions.get('window').width;
const db = getFirestore(firebaseApp);

// Categorías válidas
const CATEGORIAS_VALIDAS = ['Robo', 'Incendio', 'Basura', 'Vialidad'];

export default function Dashboard() {
  const [categoriaData, setCategoriaData] = useState({});
  const [totalReportes, setTotalReportes] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'reportes'));
      const counts = {};
      let total = 0;

      CATEGORIAS_VALIDAS.forEach(cat => counts[cat] = 0);

      snapshot.forEach(doc => {
        total++;
        const data = doc.data();
        (data.etiquetas || []).forEach(tag => {
          const cleanTag = tag.trim().toLowerCase();
          CATEGORIAS_VALIDAS.forEach(valid => {
            if (cleanTag === valid.toLowerCase()) {
              counts[valid]++;
            }
          });
        });
      });

      setTotalReportes(total);
      setCategoriaData(counts);
    };

    fetchData();
  }, []);

  const labels = Object.keys(categoriaData);
  const values = Object.values(categoriaData);

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>
        Total de Reportes: {totalReportes}
      </Text>

      <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 20 }}>
        Reportes por Categoría
      </Text>

      {labels.length > 0 ? (
        <BarChart
          data={{
            labels,
            datasets: [{ data: values }],
          }}
          width={screenWidth - 40}
          height={250}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: () => '#333',
          }}
          style={{
            borderRadius: 16,
          }}
        />
      ) : (
        <Text>No hay datos para mostrar.</Text>
      )}
    </ScrollView>
  );
}
