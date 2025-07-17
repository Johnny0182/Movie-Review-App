// contexts/AuthContext.tsx
import { Account, Client, ID, OAuthProvider } from 'appwrite'; // Make sure to import OAuthProvider
import * as Linking from 'expo-linking';
import React, { createContext, useContext, useEffect, useState } from 'react';

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
      console.log('User authenticated:', currentUser.name);
    } catch (error) {
      console.log('No authenticated user found');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      // Create OAuth2 session with Appwrite
      const redirectUri = Linking.createURL('/');
      console.log('Redirect URI:', redirectUri);
      
      // Use Appwrite's account.createOAuth2Session for proper session handling
      account.createOAuth2Session(
        OAuthProvider.Google, // Try with capital G
        redirectUri, // success URL
        redirectUri  // failure URL
      );
      
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
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Handle deep links from OAuth redirect
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('Received deep link:', url);
      // After OAuth redirect, check auth state
      if (url.includes('success') || url.includes('failure')) {
        setTimeout(() => {
          checkAuthState();
        }, 1000); // Give Appwrite time to create the session
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Check for initial URL when app launches
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    checkAuthState();
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