// app/_layout.tsx
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StatusBar, Text, View } from "react-native";
import './globals.css';

// Component to handle OAuth callback and check auth state
const AuthTester = () => {
  const { user, loading, isAuthenticated, checkAuthState } = useAuth();

  // Check for OAuth callback on web
  useEffect(() => {
    // Only run on web and when not already authenticated
    if (typeof window !== 'undefined' && !isAuthenticated && !loading) {
      const currentUrl = window.location.href;
      
      // Check if we're returning from OAuth (Appwrite redirects will contain these params)
      if (currentUrl.includes('success=') || currentUrl.includes('failure=') || 
          window.location.pathname === '/(tabs)') {
        console.log('Detected OAuth callback, checking auth state...');
        
        // Small delay to let Appwrite set the session cookie
        setTimeout(() => {
          checkAuthState();
        }, 1000);
        
        // Clean up the URL
        if (currentUrl.includes('success=') || currentUrl.includes('failure=')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [isAuthenticated, loading]);

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