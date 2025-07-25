import React from 'react';
import { Stack } from 'expo-router';
import colors from '@/constants/colors';

export default function AuthLayout() {
  return (
    <Stack
      initialRouteName="login"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="create-account" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}