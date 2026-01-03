// app/_layout.tsx
import { Stack, SplashScreen } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { useEffect } from "react";
import { View } from 'react-native';
import { AuthProvider } from '@/config/authContext';
import { FirebaseAuthProvider } from '@/config/firebaseAuthContext';
import { Provider } from 'react-redux';
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { store } from "@/redux/store";
import FONTS from "@/assets/fonts";
import useLocation from "@/hooks/useLocation";
import { configureMoment } from "@/config/momentConfig";
import * as RNLocalize from 'react-native-localize';


let persistor = persistStore(store);

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

export default function RootLayout() {
  // Load fonts with error handling - make it completely non-blocking
  const [fontsLoaded, error] = useFonts(FONTS);

  // Make location optional - don't block app if location fails
  let latitude: number | null = null;
  let longitude: number | null = null;
  let errorMsg: string | null = null;
  
  try {
    const locationData = useLocation();
    latitude = locationData.latitude;
    longitude = locationData.longitude;
    errorMsg = locationData.errorMsg;
  } catch (locationError) {
    console.warn('Location hook error (non-critical):', locationError);
    // Continue without location
  }

  useEffect(() => {
    // Get device locale and timezone
    const deviceLocale = RNLocalize.getLocales()[0].languageTag; // e.g., 'en-US'
    const deviceTimezone = RNLocalize.getTimeZone(); // e.g., 'America/New_York'

    // Configure Moment.js
    configureMoment(deviceLocale, deviceTimezone);
  }, []);

  useEffect(() => {
    const hideSplash = async () => {
      try {
        if (error) {
          console.warn('Font loading error (non-critical, continuing with system fonts):', error?.message || error);
          // Continue even if fonts fail - app will use system fonts
        }

        // Reduced delay for faster loading
        await new Promise(resolve => setTimeout(resolve, 300));

        // Always hide splash - don't wait for fonts if there's an error
        if (fontsLoaded || error) {
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        console.error('Error hiding splash screen:', e);
        // Force hide splash even on error
        try {
          await SplashScreen.hideAsync();
        } catch {}
      }
    };

    hideSplash();
  }, [fontsLoaded, error]);

  // Don't block rendering - always show app, even if fonts aren't loaded
  // App will use system fonts as fallback
  if (!fontsLoaded && !error) {
    // Show empty view briefly while fonts load
    return <View style={{ flex: 1 }} />;
  }

  // Even if there's an error, continue - fonts are optional
  // The app will use system fonts as fallback

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <FirebaseAuthProvider>
          <AuthProvider>
            <SafeAreaProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'none',
                  gestureEnabled: false
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen
                  name="login/loginScreen"
                  options={{
                    gestureEnabled: true,
                    animation: 'fade'
                  }}
                />
                <Stack.Screen
                  name="(tabs)/profileScreen"
                  options={{
                    gestureEnabled: true,
                    animation: 'fade'
                  }}
                />
                <Stack.Screen
                  name="discoverScreens"
                  options={{
                    gestureEnabled: true,
                    animation: 'fade',

                  }}
                />
                <Stack.Screen
                  name="(news)/[slug]"
                  options={{
                    gestureEnabled: true,
                    animation: 'fade'
                  }}
                />
                <Stack.Screen
                  name="login/mobile"
                  options={{
                    gestureEnabled: true,
                    animation: 'fade'
                  }}
                />
              </Stack>
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </AuthProvider>
      </FirebaseAuthProvider>
      </PersistGate>
    </Provider>
  );
}