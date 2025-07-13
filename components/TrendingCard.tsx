import { images } from "@/constants/images";
import MaskedView from '@react-native-masked-view/masked-view';
import { Link } from "expo-router";
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const TrendingCard = ({ movie: { movie_id, title, poster_url }, index }: TrendingCardProps) => {
  // Only render if poster_url exists and is valid
  if (!poster_url || poster_url.includes('${movie.poster_path}')) {
    return null;
  }

  // Adjust position for double digits
  const isDoubleDigit = index + 1 >= 10;
  const numberPosition = isDoubleDigit ? "-left-4" : "-left-3.5";

  return (
    <Link href={`/movies/${movie_id}`} asChild>
      <TouchableOpacity className="w-32 relative pl-5">
        <Image 
          source={{ uri: poster_url }}
          className="w-32 h-48 rounded-lg"
          resizeMode="cover"
        />
        <View className={`absolute bottom-9 ${numberPosition} px-2 py-3 rounded-full`}>
            <MaskedView maskElement={
              <Text className={`font-bold text-white ${isDoubleDigit ? 'text-5xl' : 'text-6xl'}`}>
                {index + 1}
              </Text>
            }>
              <Image source={images.rankingGradient} 
              className="size-14" 
              resizeMode="cover" />
            </MaskedView>
        </View>
        <Text className="text-sm font-bold mt-2 text-light-200 capitalize" numberOfLines={2}>
          {title}
        </Text>
      </TouchableOpacity>
    </Link>
  );
}

export default TrendingCard;