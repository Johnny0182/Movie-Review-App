import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, StatusBar, Text, View } from "react-native";
import './globals.css';

// Test component to see auth state
const AuthTester = () => {
  const { user, loading, isAuthenticated } = useAuth();

  console.log('Auth State:', { user: user?.name, loading, isAuthenticated });

  if (loading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#ab8bff" />
        <Text className="text-white mt-4">Checking authentication...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="movies/[id]" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/signup" />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar hidden={true} />
      <AuthTester />
    </AuthProvider>
  );
}