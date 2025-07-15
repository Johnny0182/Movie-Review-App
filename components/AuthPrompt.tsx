// components/AuthPrompt.tsx
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface AuthPromptProps {
  title?: string;
  message?: string;
  actionText?: string;
  showGoogleButton?: boolean;
  onSuccess?: () => void;
}

const AuthPrompt = ({ 
  title = "Sign In Required",
  message = "Sign in to save your favorite movies and get personalized recommendations",
  actionText = "Save Movies",
  showGoogleButton = true,
  onSuccess
}: AuthPromptProps) => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      onSuccess?.(); // Call success callback if provided
    } catch (error: any) {
      Alert.alert(
        'Sign In Failed', 
        error.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full h-full z-0" />
      
      <View className="flex-1 justify-center items-center px-8">
        {/* Icon */}
        <View className="w-20 h-20 bg-accent/20 rounded-full items-center justify-center mb-6">
          <Image source={icons.save} className="w-10 h-10" tintColor="#ab8bff" />
        </View>
        
        {/* Title */}
        <Text className="text-white text-2xl font-bold mb-3 text-center">
          {title}
        </Text>
        
        {/* Message */}
        <Text className="text-gray-400 text-center text-base leading-6 mb-8 max-w-sm">
          {message}
        </Text>

        {/* Sign In Buttons */}
        <View className="w-full max-w-sm">
          {/* Google Sign In Button */}
          {showGoogleButton && (
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={loading}
              className={`w-full bg-white rounded-full py-4 px-6 flex-row items-center justify-center mb-4 ${
                loading ? 'opacity-70' : ''
              }`}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#1f1f1f" />
              ) : (
                <>
                  {/* Google Icon - using a simple colored circle for now */}
                  <View className="w-5 h-5 mr-3 bg-blue-500 rounded-full" />
                  <Text className="text-black font-semibold text-base">
                    Continue with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Divider */}
          <View className="flex-row items-center mb-4">
            <View className="flex-1 h-px bg-gray-600" />
            <Text className="text-gray-400 text-sm mx-4">or</Text>
            <View className="flex-1 h-px bg-gray-600" />
          </View>

          {/* Email Sign Up Button */}
          <TouchableOpacity
            className="w-full bg-accent rounded-full py-4 px-6 flex-row items-center justify-center mb-3"
            activeOpacity={0.8}
            onPress={() => Alert.alert('Coming Soon', 'Email sign-up will be available soon!')}
          >
            <Image source={icons.person} className="w-5 h-5 mr-3" tintColor="#fff" />
            <Text className="text-white font-semibold text-base">
              Sign up with Email
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity
            className="w-full py-3 items-center"
            activeOpacity={0.8}
            onPress={() => Alert.alert('Coming Soon', 'Email login will be available soon!')}
          >
            <Text className="text-gray-400 text-base">
              Already have an account? <Text className="text-accent font-semibold">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <View className="mt-8 max-w-xs">
          <Text className="text-gray-500 text-xs text-center leading-4">
            By continuing, you agree to our{' '}
            <Text 
              className="text-accent underline"
              onPress={() => router.push('/terms')}
            >
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text 
              className="text-accent underline"
              onPress={() => router.push('/privacy-policy')}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AuthPrompt;