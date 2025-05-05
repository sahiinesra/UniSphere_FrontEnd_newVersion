import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define types for our tabs
type TabInfo = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  route: string;
};

// A simplified static tab bar that doesn't require complex navigation props
const StaticTabBar: React.FC = () => {
  const router = useRouter();
  
  // Tab configuration with correct types
  const tabs: TabInfo[] = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: '/(tabs)' },
    { name: 'AI', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses', route: '/(tabs)/assistant' },
    { name: 'Alerts', icon: 'notifications-outline', activeIcon: 'notifications', route: '/(tabs)/notification' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: '/(tabs)/profile' }
  ];

  // Current active tab is Home for all these pages
  const activeTab = 'Home';

  return (
    <View style={styles.tabBarContainer}>
      {tabs.map((tab) => {
        const isFocused = tab.name === activeTab;
        
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => {
              // @ts-ignore - Handle router navigation with string path
              router.push(tab.route);
            }}
            style={[
              styles.tabButton,
              isFocused && styles.tabButtonActive
            ]}
          >
            <Ionicons
              name={isFocused ? tab.activeIcon : tab.icon}
              size={26}
              color={isFocused ? '#2196F3' : '#fff'}
            />
            <Text style={[
              styles.tabText,
              isFocused && styles.tabTextActive
            ]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 75,
    backgroundColor: '#2196F3',
    borderTopWidth: 4,
    borderTopColor: '#000',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 12 : 6,
    paddingHorizontal: 16,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 8,
    paddingBottom: 10,
    borderRadius: 4,
    paddingHorizontal: 16,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: '#000',
  },
  tabButtonActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tabTextActive: {
    color: '#2196F3',
  }
});

export default StaticTabBar; 