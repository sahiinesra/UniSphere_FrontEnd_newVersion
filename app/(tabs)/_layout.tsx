import { Tabs } from 'expo-router';
import React from 'react';
import CustomTabBar from '../../components/CustomTabBar';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'AI',
        }}
      />
      
      <Tabs.Screen
        name="notification"
        options={{
          title: 'Alerts',
        }}
      />

<Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
