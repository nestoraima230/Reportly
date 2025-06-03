// navigation/ProfileStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profile from '../screens/Profile';
import EditProfile from '../screens/EditProfile';

const Stack = createNativeStackNavigator();

export default function ProfileStack({ user }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileScreen"
        options={{ title: 'Perfil', headerShown: false }}
      >
        {(props) => <Profile {...props} user={user} />}
      </Stack.Screen>

      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{ title: 'Editar Perfil' }}
      />
    </Stack.Navigator>
  );
}
