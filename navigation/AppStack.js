import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import ReportDetail from '../screens/ReportDetail'; 
import AdminPanel from "../utils/adminPanel";

const Stack = createNativeStackNavigator();

export default function AppStack({ user }) {

  const userRole = user?.role;
  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Screen
        name="Main"
        options={{ headerShown: false }}
      >
        {(props) => <MainTabs {...props} user={user} />}
      </Stack.Screen>

      {/* Aquí se registra la pantalla ReportDetail */}
      <Stack.Screen
        name="ReportDetail"
        component={ReportDetail}
        options={{ title: 'Detalle del Reporte' }}
      />

      {userRole === 'admin' && (
        <Stack.Screen name="AdminPanel" component={AdminPanel} />
      )}

    </Stack.Navigator>
  );
}
