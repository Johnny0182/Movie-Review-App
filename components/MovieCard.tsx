import { icons } from '@/constants/icons';
import { Link } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const MovieCard = ({ id, poster_path, title, vote_average, release_date, original_language }: Movie) => {
    console.log(poster_path);
    // Add the formatDate function
    const formatDate = (dateString: string) => {
        if (!dateString) return ''
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
// Change movie card format
  return (
    <Link
      href={`/movies/${id}`} asChild>
        <TouchableOpacity className="w-[30%]">
            <Image
                source={{ 
                    uri: poster_path
                        ? `https://image.tmdb.org/t/p/w500${poster_path}`
                        : 'https://via.placeholder.com/600x400/1a1a1a/ffffff.png'
                }}
                className="w-full h-48 rounded-lg"
                resizeMode="cover"
            />
            <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>{title}</Text>

            <View className="flex-row items-center justify-start gap-x-1">
                <Image source={icons.star} className="size-4"
    />
            <Text className="text-xs text-white font-bold uppercase">{Math.round(vote_average / 2)}</Text>
            </View>
            
            <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-light-300 font-medium mt-1">
                        {formatDate(release_date)} {original_language && `(${original_language.toUpperCase()})`}
                    </Text>
            </View>

        </TouchableOpacity>
    </Link>
  )
}

export default MovieCard