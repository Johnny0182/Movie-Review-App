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
      console.log('Current user found:', currentUser.name);
      setUser(currentUser as User);
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
      
      // Check if we're on web
      if (typeof window !== 'undefined') {
        // Web OAuth flow - direct redirect
        const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
        const successUrl = window.location.origin + '/(tabs)';
        const failureUrl = window.location.origin;
        
        const authUrl = `https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/google?project=${projectId}&success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}`;
        
        console.log('Starting web OAuth flow to:', authUrl);
        window.location.href = authUrl;
        return;
      }
      
      // Mobile flow - simplified approach
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'movies',
      });
      
      console.log('Mobile redirect URI:', redirectUri);
      
      const authUrl = `https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/google?project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}&success=${encodeURIComponent(redirectUri)}&failure=${encodeURIComponent(redirectUri)}`;
      
      // For mobile, we'll use WebBrowser directly (simpler approach)
      if (typeof AuthSession.startAsync === 'function') {
        const result = await AuthSession.startAsync({
          authUrl: authUrl,
          returnUrl: redirectUri,
        });
        
        console.log('Auth result:', result);
        
        if (result.type === 'success') {
          await new Promise(resolve => setTimeout(resolve, 2000));
          await checkAuthState();
        } else {
          setLoading(false);
          throw new Error('OAuth authentication was cancelled or failed');
        }
      } else {
        // Fallback - just redirect on mobile too
        console.log('Using fallback redirect approach');
        window.location.href = authUrl;
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
      setLoading(true);
      console.log('Attempting to sign out...');
      
      // For OAuth sessions, use deleteSession('current') instead of deleteSessions()
      await account.deleteSession('current');
      console.log('Current session deleted successfully');
      
      // Clear user state after successful session deletion
      setUser(null);
      console.log('User state cleared');
      
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if session deletion fails, clear the user state locally
      setUser(null);
      console.log('User state cleared despite session deletion error');
    } finally {
      setLoading(false);
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