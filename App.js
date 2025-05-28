import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native'; 
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import AuthStack from './navigation/AuthStack';
import AppStack from './navigation/AppStack';
import { app } from './config/firebaseConfig';

const auth = getAuth(app); 

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false); 
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text></Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
        {user ? <AppStack user={user} /> : <AuthStack />}
    </NavigationContainer>
  );
}
