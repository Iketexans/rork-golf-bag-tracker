import React from "react";
import { Tabs } from "expo-router";
import { useTheme } from "@/store/themeStore";
import { Flag, Home, Search, Settings, ClipboardList } from "lucide-react-native";

export default function TabLayout() {
  const { colors } = useTheme();
  
  // Fallback colors in case theme is not properly initialized
  const safeColors = colors || {
    primary: '#3a7ca5',
    textSecondary: '#636e72',
    card: '#ffffff',
    border: '#e0e0e0',
    background: '#f8f9fa',
    text: '#2d3436',
  };
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: safeColors.primary,
        tabBarInactiveTintColor: safeColors.textSecondary,
        tabBarStyle: {
          backgroundColor: safeColors.card,
          borderTopColor: safeColors.border,
        },
        headerStyle: {
          backgroundColor: safeColors.background,
        },
        headerTintColor: safeColors.text,
        headerShadowVisible: false,
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bags"
        options={{
          title: "Bags",
          tabBarIcon: ({ color }) => <Flag size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}