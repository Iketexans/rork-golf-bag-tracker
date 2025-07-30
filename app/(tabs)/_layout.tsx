import React from "react";
import { Tabs } from "expo-router";
import { useTheme } from "@/store/themeStore";
import { Flag, Home, Search, Settings, ClipboardList } from "lucide-react-native";

export default function TabLayout() {
  const { colors } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Operations Hub",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bags"
        options={{
          title: "Bag Tracker",
          tabBarIcon: ({ color }) => <Flag size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Service Orders",
          tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Member Search",
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Club Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}