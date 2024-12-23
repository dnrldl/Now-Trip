import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
            <Stack.Screen
              name='login'
              options={{
                headerShown: true,
                headerBackButtonDisplayMode: 'minimal',
              }}
            />
            <Stack.Screen
              name='register'
              options={{
                headerShown: true,
                headerBackButtonDisplayMode: 'minimal',
              }}
            />
            <Stack.Screen name='test' />
            <Stack.Screen name='protected' />
          </Stack>
          <StatusBar style='auto' />
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
