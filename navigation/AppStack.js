import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import ReportDetail from '../screens/ReportDetail'; 
import AdminPanel from "../utils/adminPanel";
import MapScreen from "../screens/MapScreen";
import { AuthContext } from "../context/AuthContext";

const Stack = createNativeStackNavigator();

export default function AppStack() {

  // <-- Aquí obtienes user y userRole correctamente
  const { user, userRole } = useContext(AuthContext);

  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Screen
        name="Main"
        options={{ headerShown: false }}
      >
        {(props) => <MainTabs {...props} user={user} />}
      </Stack.Screen>

      <Stack.Screen
        name="ReportDetail"
        component={ReportDetail}
        options={{ title: 'Detalle del Reporte' }}
      />

      <Stack.Screen
        name="MapScreen"
        component={MapScreen}
        options={{ title: 'Ubicación del Reporte' }}
      />

      {userRole === 'admin' && (
        <Stack.Screen name="AdminPanel" component={AdminPanel} />
      )}
    </Stack.Navigator>
  );
}
