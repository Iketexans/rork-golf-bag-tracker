import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import colors from "@/constants/colors";
import { useDeepLinking } from "@/hooks/useDeepLinking";
import { useAuthStore } from "@/store/authStore";

export const unstable_settings = {
  initialRouteName: "auth",
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

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { isAuthenticated, isSubscriptionActive, isInitialized } = useAuthStore();
  
  // Initialize deep linking only after auth is ready
  useDeepLinking();

  // Show loading while initializing
  if (!isInitialized) {
    return null;
  }

  // Check authentication status
  if (!isAuthenticated) {
    return (
      <>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
        </Stack>
      </>
    );
  }

  // Check subscription status
  if (!isSubscriptionActive) {
    return (
      <>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
        </Stack>
      </>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
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
    </GestureHandlerRootView>
  );
}