import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EditProfile from '../screens/EditProfile';
import CreateReport from '../screens/CreateReport';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: 'Editar Perfil' }} />
      <Stack.Screen name="CreateReport" component={CreateReport} options={{ title: 'Crear Reporte' }} />
    </Stack.Navigator>
  );
}
