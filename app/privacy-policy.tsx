// app/privacy-policy.tsx
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const PrivacyPolicy = () => {
  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full h-full z-0" />
      
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center mt-16 mb-6">
          <TouchableOpacity onPress={router.back} className="mr-4">
            <Image source={icons.arrow} className="w-6 h-6 rotate-180" tintColor="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Privacy Policy</Text>
        </View>

        <View className="bg-dark-200/50 rounded-xl p-6 mb-6">
          <Text className="text-white text-sm leading-6">
            <Text className="font-bold text-base">Movie Amigos Privacy Policy{'\n\n'}</Text>
            
            <Text className="font-semibold">Last updated: {new Date().toLocaleDateString()}{'\n\n'}</Text>
            
            <Text className="font-semibold">What We Collect{'\n'}</Text>
            • Your Google account info (name, email) when you sign in{'\n'}
            • Movies you save and search for{'\n'}
            • Basic app usage analytics{'\n\n'}
            
            <Text className="font-semibold">How We Use Your Data{'\n'}</Text>
            • To save your favorite movies{'\n'}
            • To provide personalized recommendations{'\n'}
            • To improve our app experience{'\n\n'}
            
            <Text className="font-semibold">Data Security{'\n'}</Text>
            • Your data is stored securely with Appwrite{'\n'}
            • We use industry-standard encryption{'\n'}
            • We don't sell your personal information{'\n\n'}
            
            <Text className="font-semibold">Third-Party Services{'\n'}</Text>
            • Google OAuth for authentication{'\n'}
            • TMDB for movie data{'\n'}
            • Appwrite for secure data storage{'\n\n'}
            
            <Text className="font-semibold">Your Rights{'\n'}</Text>
            • You can delete your account anytime{'\n'}
            • You can request your data{'\n'}
            • You can opt out of analytics{'\n\n'}
            
            <Text className="font-semibold">Contact Us{'\n'}</Text>
            • Email: privacy@movieamigos.app{'\n'}
            • We'll respond within 48 hours{'\n\n'}
            
            <Text className="font-semibold">Limitation of Liability & Disclaimers{'\n'}</Text>
            Movie Amigos is provided "AS IS" and "AS AVAILABLE" without warranties of any kind. We make no guarantees about service availability, data security, or accuracy of movie information.{'\n\n'}
            
            <Text className="font-semibold">Security Disclaimer{'\n'}</Text>
            While we implement reasonable security measures, no system is 100% secure. You use this app at your own risk. We are not responsible for any data breaches, security incidents, or unauthorized access to your information.{'\n\n'}
            
            <Text className="font-semibold">No Liability for Damages{'\n'}</Text>
            We shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of this app, including but not limited to data loss, security breaches, or service interruptions.{'\n\n'}
            
            <Text className="font-semibold">User Responsibility{'\n'}</Text>
            You are solely responsible for your account security, password protection, and any activities under your account. You agree to use strong passwords and keep your login credentials secure.{'\n\n'}
            
            <Text className="text-gray-400 text-xs">
              This policy may be updated occasionally. Continued use means you accept any changes.
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default PrivacyPolicy;