// contexts/AuthContext.tsx
import { Account, Client, ID } from 'appwrite';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

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
      
      // Create the OAuth URL
      const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
      const redirectUrl = 'exp://192.168.1.135:8081';
      
      console.log('Redirect URL:', redirectUrl);
      
      // Build the OAuth URL manually
      const oauthUrl = `https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/google?project=${projectId}&success=${encodeURIComponent(redirectUrl)}&failure=${encodeURIComponent(redirectUrl)}`;
      
      console.log('OAuth URL:', oauthUrl);
      
      // Open the OAuth session using WebBrowser
      const result = await WebBrowser.openAuthSessionAsync(
        oauthUrl,
        redirectUrl
      );
      
      console.log('OAuth result:', result);
      
      if (result.type === 'success') {
        // Check auth state after successful OAuth
        await checkAuthState();
      } else if (result.type === 'cancel') {
        setLoading(false);
        throw new Error('OAuth was cancelled by user');
      } else {
        setLoading(false);
        throw new Error('OAuth failed');
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