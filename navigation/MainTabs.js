import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feed from '../screens/Feed';
import CreateReport from '../screens/CreateReport';
import Profile from '../screens/Profile';
import { Ionicons } from '@expo/vector-icons';
import ProfileStack from '../navigation/ProfileStack';

const Tab = createBottomTabNavigator();

export default function MainTabs({ user }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Feed') iconName = 'home';
          else if (route.name === 'Create') iconName = 'add-circle';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2c4d4e',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Feed">
        {(props) => <Feed {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Create">
        {(props) => <CreateReport {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {(props) => <ProfileStack {...props} user={user} />}
      </Tab.Screen>

    </Tab.Navigator>
  );
}
