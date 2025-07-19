// contexts/AuthContext.tsx
import { Account, Client, ID } from 'appwrite';
import * as AuthSession from 'expo-auth-session';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);

interface User {
  $id: string;
  name: string;
  email: string;
  prefs: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = user !== null;

  const checkAuthState = async () => {
    try {
      setLoading(true);
      const currentUser = await account.get();
      setUser(currentUser as User);
      console.log('✅ User authenticated:', currentUser.name);
    } catch (error) {
      setUser(null);
      console.log('❌ No active session');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      if (Platform.OS === 'web') {
        // For web, use Appwrite's built-in OAuth
        const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
        const successUrl = window.location.origin + '/';
        const failureUrl = window.location.origin + '/';
        
        console.log('🌐 Redirecting to Google OAuth (web)...');
        
        // Redirect to Appwrite OAuth
        window.location.href = `https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/google?project=${projectId}&success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}`;
        
      } else {
        // For mobile, use Expo AuthSession
        console.log('📱 Starting mobile OAuth...');
        
        const redirectUri = AuthSession.makeRedirectUri({
          scheme: 'exp',
          path: '/',
        });
        
        const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
        const authUrl = `https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/google?project=${projectId}&success=${encodeURIComponent(redirectUri)}&failure=${encodeURIComponent(redirectUri)}`;
        
        const result = await AuthSession.startAsync({
          authUrl,
          returnUrl: redirectUri,
        });
        
        console.log('Auth result:', result);
        
        if (result.type === 'success') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await checkAuthState();
        } else {
          setLoading(false);
          throw new Error('OAuth authentication failed');
        }
      }
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      setLoading(false);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      await account.createEmailPasswordSession(email, password);
      await checkAuthState();
    } catch (error) {
      setLoading(false);
      console.error('Email sign-in error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      await account.create(ID.unique(), email, password, name);
      await signInWithEmail(email, password);
    } catch (error) {
      setLoading(false);
      console.error('Email sign-up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('🔓 Attempting to sign out...');
      setLoading(true);
      
      // Delete the current session
      await account.deleteSession('current');
      
      // Clear user state
      setUser(null);
      
      console.log('✅ Successfully signed out');
      
      // On web, optionally redirect to home or login
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Clear any cached data
        window.localStorage.clear();
        window.sessionStorage.clear();
      }
      
    } catch (error) {
      console.error('❌ Sign out error:', error);
      // Even if there's an error, clear the user state
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check for OAuth callback on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Check if we're returning from OAuth
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('userId') || window.location.search.includes('success')) {
        console.log('🔄 OAuth callback detected, checking auth state...');
        // OAuth success, check auth state
        checkAuthState();
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        checkAuthState();
      }
    } else {
      checkAuthState();
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    checkAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};