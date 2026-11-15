import React, { useContext } from 'react';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import AuthStack from './src/navigation/AuthStack';
import AppStack from './src/navigation/AppStack';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

function AppNavigator() {
  const { user, loading } = useContext(AuthContext);
  const scheme = useColorScheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: scheme === 'dark' ? '#121212' : '#ffffff' }}>
        <ActivityIndicator size="large" color={scheme === 'dark' ? '#5fa898' : '#2c4d4e'} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
