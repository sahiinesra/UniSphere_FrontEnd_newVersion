import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        height: 75,
        backgroundColor: '#2196F3',
        borderTopWidth: 4,
        borderTopColor: '#000',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 12 : 6,
        paddingHorizontal: 16,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress', target: route.key,
            canPreventDefault: true
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
          index: 'home-outline',
          assistant: 'chatbubble-ellipses-outline',
          profile: 'person-outline',
          notification: 'notifications-outline',
        };

        const activeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
          index: 'home',
          assistant: 'chatbubble-ellipses',
          profile: 'person',
          notification: 'notifications',
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              paddingTop: 8,
              paddingBottom: 10,
              borderRadius: 4,
              paddingHorizontal: 16,
              backgroundColor: isFocused ? '#fff' : '#2196F3',
              borderWidth: 2,
              borderColor: '#000',
            }}
          >
            <Ionicons
              name={isFocused ? activeIcons[route.name] : icons[route.name]}
              size={26}
              color={isFocused ? '#2196F3' : '#fff'}
            />
            <Text style={{
              fontSize: route.name === 'notification' ? 10 : 11,
              color: isFocused ? '#2196F3' : '#fff',
              fontWeight: '700',
              marginTop: 4,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
              {(options.title ?? route.name).length > 10
                ? (options.title ?? route.name).slice(0, 10) + '…'
                : (options.title ?? route.name)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomTabBar;
