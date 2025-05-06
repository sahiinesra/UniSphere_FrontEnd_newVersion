import { Stack } from "expo-router";
import './globals.css';

export default function RootLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        // Animation for replacing screens in the stack
        animationTypeForReplace: 'pop',
        // Presentation mode for card-style animations
        presentation: 'card',
      }}
      initialRouteName="login"
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="home" />
    </Stack>
  );
}