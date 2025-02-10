import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from '../contexts/AuthContext';
import { ExchangeRateProvider } from '../contexts/ExchangeRateContext';
import { SafeAreaView } from 'react-native';
import { DataProvider } from '../contexts/DataContext';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <AuthProvider>
        <ExchangeRateProvider>
          <DataProvider>
            <Stack>
              <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
              <Stack.Screen
                name='login'
                options={{
                  headerShown: true,
                  headerBackButtonDisplayMode: 'minimal',
                  title: '로그인',
                }}
              />
              <Stack.Screen
                name='register'
                options={{
                  headerShown: true,
                  headerBackButtonDisplayMode: 'minimal',
                  title: '회원가입',
                }}
              />
              <Stack.Screen
                name='exchange-details'
                options={{
                  headerShown: true,
                  headerBackButtonDisplayMode: 'minimal',
                  title: '환율 그래프',
                }}
              />
              <Stack.Screen
                name='search'
                options={{
                  headerShown: true,
                  headerBackButtonDisplayMode: 'minimal',
                  title: '검색',
                }}
              />
            </Stack>
            <StatusBar style='dark' />
          </DataProvider>
        </ExchangeRateProvider>
      </AuthProvider>
    </SafeAreaView>
  );
}
