// app/terms.tsx
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const TermsOfService = () => {
  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full h-full z-0" />
      
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center mt-16 mb-6">
          <TouchableOpacity onPress={router.back} className="mr-4">
            <Image source={icons.arrow} className="w-6 h-6 rotate-180" tintColor="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Terms of Service</Text>
        </View>

        <View className="bg-dark-200/50 rounded-xl p-6 mb-6">
          <Text className="text-white text-sm leading-6">
            <Text className="font-bold text-base">Movie Amigos Terms of Service{'\n\n'}</Text>
            
            <Text className="font-semibold">Last updated: {new Date().toLocaleDateString()}{'\n\n'}</Text>
            
            <Text className="font-semibold">Agreement to Terms{'\n'}</Text>
            By using Movie Amigos, you agree to these terms. If you don't agree, please don't use our app.{'\n\n'}
            
            <Text className="font-semibold">Use of Service{'\n'}</Text>
            • You must be 18+ years old to use this app{'\n'}
            • Use only for personal, non-commercial purposes{'\n'}
            • Don't attempt to hack, spam, or abuse the service{'\n'}
            • We can terminate your account for violations{'\n\n'}
            
            <Text className="font-semibold">DISCLAIMER OF WARRANTIES{'\n'}</Text>
            THIS APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.{'\n\n'}
            
            <Text className="font-semibold">LIMITATION OF LIABILITY{'\n'}</Text>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THIS APP, INCLUDING BUT NOT LIMITED TO:{'\n'}
            • Data loss or corruption{'\n'}
            • Security breaches or unauthorized access{'\n'}
            • Service interruptions or downtime{'\n'}
            • Any damages exceeding $10{'\n\n'}
            
            <Text className="font-semibold">INDEMNIFICATION{'\n'}</Text>
            You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of the app or violation of these terms.{'\n\n'}
            
            <Text className="font-semibold">Security & Data Breaches{'\n'}</Text>
            While we implement reasonable security measures, we cannot guarantee absolute security. You acknowledge that:{'\n'}
            • No system is 100% secure{'\n'}
            • Data breaches may occur despite our efforts{'\n'}
            • You use this service at your own risk{'\n'}
            • We are not liable for any security incidents{'\n\n'}
            
            <Text className="font-semibold">Third-Party Content{'\n'}</Text>
            Movie data comes from TMDB. We don't control or endorse third-party content and aren't responsible for its accuracy.{'\n\n'}
            
            <Text className="font-semibold">Modifications{'\n'}</Text>
            We may update these terms anytime. Continued use means acceptance of changes.{'\n\n'}
            
            <Text className="font-semibold">Termination{'\n'}</Text>
            We can terminate your access immediately for any reason. Upon termination, these terms still apply to limit our liability.{'\n\n'}
            
            <Text className="font-semibold">Governing Law{'\n'}</Text>
            These terms are governed by [Your State] law. Any disputes must be resolved through binding arbitration.{'\n\n'}
            
            <Text className="font-semibold">Contact{'\n'}</Text>
            Questions? Email: legal@movieamigos.app{'\n\n'}
            
            <Text className="text-gray-400 text-xs">
              By using Movie Amigos, you acknowledge that you have read, understood, and agree to be bound by these terms.
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default TermsOfService;