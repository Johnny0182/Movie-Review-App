import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';

const Profile = () => {
  const { user, isAuthenticated, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Don't show success alert - the UI will update automatically
              console.log('User signed out successfully');
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="bg-primary flex-1 justify-center items-center">
        <Image source={images.bg} className="absolute w-full h-full z-0" />
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="bg-primary flex-1">
      <Image source={images.bg} className="absolute w-full h-full z-0" />
      
      {isAuthenticated && user ? (
        // User is signed in - show profile info
        <View className="flex-1 px-6 pt-20">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-accent rounded-full items-center justify-center mb-4">
              <Image source={icons.person} className="w-10 h-10" tintColor="#fff" />
            </View>
            <Text className="text-white text-2xl font-bold">{user.name}</Text>
            <Text className="text-gray-400 text-base">{user.email}</Text>
          </View>

          {/* Profile Stats/Info */}
          <View className="bg-dark-200/50 rounded-xl p-6 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Account Info</Text>
            
            <View className="flex-row justify-between items-center py-3 border-b border-gray-600">
              <Text className="text-gray-400">User ID</Text>
              <Text className="text-white text-xs">{user.$id.slice(0, 8)}...</Text>
            </View>
            
            <View className="flex-row justify-between items-center py-3">
              <Text className="text-gray-400">Account Type</Text>
              <Text className="text-green-400">Google Account</Text>
            </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-red-500 rounded-xl py-4 px-6 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base">Sign Out</Text>
          </TouchableOpacity>

          {/* App Info */}
          <View className="mt-8 items-center">
            <Text className="text-gray-500 text-sm">Movie Amigos v1.0.0</Text>
          </View>
        </View>
      ) : (
        // User is not signed in - show basic profile placeholder
        <View className="flex justify-center items-center flex-1 flex-col gap-5 px-10">
          <Image source={icons.person} className="size-10" tintColor="#fff" />
          <Text className="text-gray-500 text-base text-center">
            Sign in to see your profile and saved movies
          </Text>
        </View>
      )}
    </View>
  );
};

export default Profile;