import { Stack } from 'expo-router';

export default function FeedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" 
          options={{
            gestureEnabled: false,
        }}
      />                    
      <Stack.Screen
        name="account/[userId]"                        
        options={{ presentation: 'card' }}           
      />
    </Stack>
  );
}