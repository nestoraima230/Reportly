import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GettingStartedScreen from '../screens/GettingStartedScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="GettingStarted">
      <Stack.Screen
        name="GettingStarted"
        component={GettingStartedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar sesión' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registrarse' }} />
    </Stack.Navigator>
  );
}
