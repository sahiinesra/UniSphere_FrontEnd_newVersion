import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="CommunityChat"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
} 