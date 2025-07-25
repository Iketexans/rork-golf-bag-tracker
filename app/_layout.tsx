import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Platform, View } from "react-native";
import { useDeepLinking } from "@/hooks/useDeepLinking";
import { useAuthStore } from "@/store/authStore";
import { ThemeProvider, useTheme } from "@/store/themeStore";

// Conditional import for gesture handler
let GestureHandlerRootView: any = View;

if (Platform.OS !== 'web') {
  try {
    const GestureHandler = require('react-native-gesture-handler');
    GestureHandlerRootView = GestureHandler.GestureHandlerRootView;
  } catch (error) {
    console.warn('Gesture handler not available:', error);
    GestureHandlerRootView = View;
  }
}

export const unstable_settings = {
  initialRouteName: "auth/login",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { isAuthenticated, isSubscriptionActive, isInitialized } = useAuthStore();
  const { colors, isDarkMode, isLoaded } = useTheme();
  
  // Initialize deep linking only after auth is ready
  useDeepLinking();

  console.log('RootLayoutNav - Auth state:', { isAuthenticated, isSubscriptionActive, isInitialized });

  // Show loading while initializing
  if (!isInitialized || !isLoaded) {
    console.log('Not initialized, showing loading');
    return null;
  }

  // Check authentication status
  if (!isAuthenticated) {
    console.log('Not authenticated, showing auth screen');
    return (
      <>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
        </Stack>
      </>
    );
  }

  // Check subscription status
  if (!isSubscriptionActive) {
    console.log('Subscription not active, showing auth screen');
    return (
      <>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
        </Stack>
      </>
    );
  }

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: colors.primary,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="bag/[id]" 
          options={{ 
            title: "Bag Details",
            presentation: "card",
          }} 
        />
        <Stack.Screen 
          name="order/[id]" 
          options={{ 
            title: "Order Details",
            presentation: "card",
          }} 
        />
        <Stack.Screen 
          name="member/[id]" 
          options={{ 
            title: "Member Details",
            presentation: "card",
          }} 
        />
      </Stack>
    </>
  );
}