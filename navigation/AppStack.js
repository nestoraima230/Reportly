import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import EditProfile from '../screens/EditProfile';
import CreateReport from '../screens/CreateReport';

const Stack = createNativeStackNavigator();

export default function AppStack({ user }) {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" options={{ title: 'Inicio' }}>
        {(props) => <HomeScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: 'Editar Perfil' }} />
      <Stack.Screen name="CreateReport" component={CreateReport} options={{ title: 'Crear Reporte' }} />
    </Stack.Navigator>
  );
}
