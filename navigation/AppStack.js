import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';

const Stack = createNativeStackNavigator();

export default function AppStack({ user }) {
  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Screen 
        name="Main" 
        options={{ headerShown: false }}
      >
        {(props) => <MainTabs {...props} user={user} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
