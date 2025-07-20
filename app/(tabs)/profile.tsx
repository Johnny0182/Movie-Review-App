// app/(tabs)/profile.tsx
import AuthPrompt from '@/components/AuthPrompt';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';

const Profile = () => {
  const { user, loading, isAuthenticated, signOut } = useAuth();
  const [signOutLoading, setSignOutLoading] = useState(false);

  const handleSignOut = async () => {
    console.log('handleSignOut called!');
    try {
      setSignOutLoading(true);
      await signOut();
      console.log('Successfully signed out');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setSignOutLoading(false);
    }
  };

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <Image source={images.bg} className="absolute w-full h-full z-0" />
        <ActivityIndicator size="large" color="#ab8bff" />
        <Text className="text-white mt-4">Loading...</Text>
      </View>
    );
  }

  // Show AuthPrompt if user is not signed in
  if (!isAuthenticated) {
    return (
      <AuthPrompt 
        title="Your Movie Profile"
        message="Sign in to save movies, track your favorites, and connect with other movie lovers"
        onSuccess={() => {
          console.log('User signed in from profile page!');
        }}
      />
    );
  }

  // User is signed in - show profile
  return (
    <View className="bg-primary flex-1">
      <Image source={images.bg} className="absolute w-full h-full z-0" />
      
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mt-16 mb-8">
          <Text className="text-white text-2xl font-bold">Profile</Text>
          <TouchableOpacity
            onPress={handleSignOut}
            disabled={signOutLoading}
            className={`bg-red-500 px-4 py-2 rounded-lg ${signOutLoading ? 'opacity-50' : ''}`}
          >
            {signOutLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Sign Out</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* User Info Card */}
        <View className="bg-dark-200/50 rounded-xl p-6 mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 rounded-full mr-4 overflow-hidden bg-accent items-center justify-center">
              {user?.prefs?.profilePicture || user?.email ? (
                <Image
                  source={{ 
                    uri: user?.prefs?.profilePicture || 
                         `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=ab8bff&color=ffffff&size=64`
                  }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-white text-xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">{user?.name || 'User'}</Text>
              <Text className="text-gray-400 text-sm">{user?.email || 'No email'}</Text>
              <Text className="text-gray-500 text-xs mt-1">
                {user?.prefs?.provider ? `Signed in with ${user.prefs.provider}` : 'Google Account'}
              </Text>
            </View>
          </View>
          
          <View className="border-t border-gray-600 pt-4">
            <Text className="text-gray-400 text-xs">Account ID</Text>
            <Text className="text-gray-300 text-sm font-mono">{user?.$id}</Text>
          </View>
        </View>

        {/* Profile Options */}
        <View className="bg-dark-200/50 rounded-xl p-6 mb-6">
          <Text className="text-white text-lg font-bold mb-4">Coming Soon</Text>
          
          <View className="space-y-4">
            <View className="flex-row items-center py-3 border-b border-gray-600">
              <Image source={icons.person} className="w-5 h-5 mr-3" tintColor="#ab8bff" />
              <Text className="text-gray-400">Edit Profile</Text>
            </View>
            
            <View className="flex-row items-center py-3 border-b border-gray-600">
              <Image source={icons.star} className="w-5 h-5 mr-3" tintColor="#ab8bff" />
              <Text className="text-gray-400">My Reviews</Text>
            </View>
            
            <View className="flex-row items-center py-3 border-b border-gray-600">
              <Image source={icons.person} className="w-5 h-5 mr-3" tintColor="#ab8bff" />
              <Text className="text-gray-400">Friends</Text>
            </View>
            
            <View className="flex-row items-center py-3">
              <Image source={icons.save} className="w-5 h-5 mr-3" tintColor="#ab8bff" />
              <Text className="text-gray-400">Settings</Text>
            </View>
          </View>
        </View>

        {/* Debug Info (remove in production) */}
        <View className="bg-gray-800/50 rounded-xl p-4">
          <Text className="text-gray-400 text-xs mb-2">Debug Info:</Text>
          <Text className="text-gray-500 text-xs">Loading: {loading.toString()}</Text>
          <Text className="text-gray-500 text-xs">Authenticated: {isAuthenticated.toString()}</Text>
          <Text className="text-gray-500 text-xs">User exists: {(user !== null).toString()}</Text>
        </View>
      </View>
    </View>
  );
};

export default Profile;