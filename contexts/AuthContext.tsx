// contexts/AuthContext.tsx
import { Account, Client, ID } from 'appwrite';
import * as AuthSession from 'expo-auth-session';
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
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      // Create redirect URI for Expo
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'exp',
        path: '/',
      });
      
      console.log('Redirect URI:', redirectUri);
      
      // Build OAuth URL for Appwrite
      const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
      const authUrl = `https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/google?project=${projectId}&success=${encodeURIComponent(redirectUri)}&failure=${encodeURIComponent(redirectUri)}`;
      
      console.log('Auth URL:', authUrl);
      
      // Use Expo AuthSession
      const result = await AuthSession.startAsync({
        authUrl,
        returnUrl: redirectUri,
      });
      
      console.log('Auth result:', result);
      
      if (result.type === 'success') {
        // Wait for session to be created
        await new Promise(resolve => setTimeout(resolve, 1000));
        await checkAuthState();
      } else {
        setLoading(false);
        throw new Error('OAuth authentication failed');
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
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

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