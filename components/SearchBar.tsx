import { icons } from '@/constants/icons';
import React from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
  placeholder: string;
  onPress?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
}

const SearchBar = ({ placeholder, onPress, value, onChangeText }: Props) => {
  // If onPress is provided (like on home page), make it a touchable that navigates
  if (onPress && !onChangeText) {
    return (
      <TouchableOpacity 
        onPress={onPress}
        className="flex-row items-center bg-dark-200 rounded-full px-5 py-4"
      >
        <Image source={icons.search} className="size-5" resizeMode="contain" tintColor="#ab8bff" />
        <View className="flex-1 ml-2">
          <Text className="text-[#a8b5db]">{placeholder}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // If onChangeText is provided (like on search page), make it an actual input
  return (
    <View className="flex-row items-center bg-dark-200 rounded-full px-5 py-4">
      <Image source={icons.search} className="size-5" resizeMode="contain" tintColor="#ab8bff" />
      
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#a8b5db"
        className="flex-1 ml-2 text-white"
        autoFocus={true}
      />
    </View>
  );
}

export default SearchBar