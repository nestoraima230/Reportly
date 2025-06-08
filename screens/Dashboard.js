import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseApp } from '../config/firebaseConfig';

const screenWidth = Dimensions.get('window').width;
const db = getFirestore(firebaseApp);

// Colores para los gráficos
const colores = [
  '#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#9C27B0',
  '#FF9800', '#00BCD4', '#795548', '#607D8B', '#E91E63',
  '#4CAF50', '#3F51B5', '#FFC107', '#CDDC39', '#009688'
];

export default function Dashboard() {
  const [etiquetaData, setEtiquetaData] = useState({});
  const [coloniaData, setColoniaData] = useState({});
  const [totalReportes, setTotalReportes] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'reportes'));
      const countsEtiqueta = {};
      const countsColonia = {};
      let total = 0;

      snapshot.forEach(doc => {
        total++;
        const data = doc.data();

        // Conteo por etiqueta
        (data.etiquetas || []).forEach(tag => {
          const cleanTag = tag.trim();
          if (cleanTag) {
            countsEtiqueta[cleanTag] = (countsEtiqueta[cleanTag] || 0) + 1;
          }
        });

        // Conteo por colonia
        const colonia = (data.colonia && data.colonia.trim() !== '') ? data.colonia.trim() : 'Desconocida';
        countsColonia[colonia] = (countsColonia[colonia] || 0) + 1;
      });

      setTotalReportes(total);
      setEtiquetaData(countsEtiqueta);
      setColoniaData(countsColonia);
    };

    fetchData();
  }, []);

  const formatPieChartData = (dataObj) =>
    Object.entries(dataObj)
      .filter(([, value]) => value > 0)
      .map(([key, value], index) => ({
        name: key,
        population: value,
        color: colores[index % colores.length],
        legendFontColor: '#333',
        legendFontSize: 15,
      }));

  const etiquetaChartData = formatPieChartData(etiquetaData);
  const coloniaChartData = formatPieChartData(coloniaData);

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>
        Total de Reportes: {totalReportes}
      </Text>

      <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20 }}>
        Reportes por Etiqueta
      </Text>

      {etiquetaChartData.length > 0 ? (
        <PieChart
          data={etiquetaChartData}
          width={screenWidth - 40}
          height={250}
          chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      ) : (
        <Text>No hay datos de etiquetas para mostrar.</Text>
      )}

      <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 30 }}>
        Reportes por Colonia
      </Text>

      {coloniaChartData.length > 0 ? (
        <PieChart
          data={coloniaChartData}
          width={screenWidth - 40}
          height={250}
          chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      ) : (
        <Text>No hay datos de colonias para mostrar.</Text>
      )}
    </ScrollView>
  );
}
