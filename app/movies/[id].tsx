import { icons } from '@/constants/icons';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMovieDetails } from '@/services/api';
import { isMovieSaved, toggleMovieSaved } from '@/services/savedMovies';
import useFetch from '@/services/useFetch';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Props interface for reusable MovieInfo component
interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

// Reusable component for displaying movie information with consistent styling
const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-gray-400 font-normal text-sm">
      {label}
    </Text>
    <Text className="text-gray-400 font-bold text-sm mt-2">
      {value || 'N/A'}
    </Text>
  </View>
)

// Helper function to format monetary values (budget/revenue)
const formatMoney = (amount: number | undefined | null): string => {
  if (!amount || amount === 0) return 'N/A';
  
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  } else if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  } else if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  } else {
    return `$${amount.toLocaleString()}`;
  }
};

const MovieDetails = () => {
  const { id } = useLocalSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string));
  
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Check if movie is saved when user changes or movie loads
  useEffect(() => {
    if (isAuthenticated && user && movie) {
      checkSavedStatus();
    } else {
      setIsSaved(false);
    }
  }, [isAuthenticated, user, movie]);

  const checkSavedStatus = async () => {
    if (!user || !movie) return;
    try {
      const saved = await isMovieSaved(user.$id, movie.id);
      setIsSaved(saved);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSavePress = async () => {
    // If not authenticated, redirect to saved tab which will show AuthPrompt
    if (!isAuthenticated) {
      router.push('/saved');
      return;
    }

    if (!user || !movie) return;

    try {
      setSaveLoading(true);
      const movieData: Movie = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || '',
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        original_language: movie.original_language,
        adult: movie.adult || false,
        backdrop_path: movie.backdrop_path || '',
        genre_ids: movie.genres?.map(g => g.id) || [],
        original_title: movie.original_title || movie.title,
        overview: movie.overview || '',
        popularity: movie.popularity || 0,
        video: false,
        vote_count: movie.vote_count || 0,
      };

      const newSavedState = await toggleMovieSaved(user.$id, movieData);
      setIsSaved(newSavedState);

      // Show feedback
      Alert.alert(
        newSavedState ? 'Saved!' : 'Removed!',
        newSavedState 
          ? `${movie.title} has been added to your saved movies` 
          : `${movie.title} has been removed from your saved movies`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Error toggling save:', error);
    } finally {
      setSaveLoading(false);
    }
  };
  
  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{
        paddingBottom: 100 
      }}>
        
        {/* Hero poster section */}
        <View>
          <Image 
            source={{ uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`}} 
            className="w-full h-[550px]" 
            resizeMode="stretch" 
          />
        </View>

        {/* Title and basic info section with save button */}
        <View className="flex-row items-start justify-between mt-5 px-5">
          <View className="flex-1 mr-4">
            <Text className="text-white font-bold text-xl">{movie?.title}</Text>
            <View className="flex-row items-center gap-x-1 mt-2">
              <Text className="text-light-200 text-sm">
                {movie?.release_date?.split('-')[0]}
              </Text>
              <Text className="text-light-200 text-sm">•</Text>
              <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
            </View>
          </View>
          
          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSavePress}
            disabled={saveLoading}
            className={`w-12 h-12 rounded-full items-center justify-center border-2 ${
              isSaved 
                ? 'bg-red-500 border-red-500' 
                : 'bg-transparent border-gray-500'
            } ${saveLoading ? 'opacity-50' : ''}`}
            activeOpacity={0.8}
          >
            <Text className="text-2xl">
              {isSaved ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rating display section */}
        <View className="flex-row items-center bg-dark-100 px-3 py-2 rounded-lg gap-x-2 mt-4 mx-5">
          <Image source={icons.star} className="size-4" />
          <Text className="text-white font-bold text-sm">
            {Math.round(movie?.vote_average ?? 0)}/10
          </Text>
          <Text className="text-light-200 text-sm">
            ({movie?.vote_count?.toLocaleString()} votes)
          </Text>
        </View>
        
        {/* Detailed information section */}
        <View className="px-5">
          
          {/* Story overview */}
          <MovieInfo 
            label="Overview" 
            value={movie?.overview} 
          />
          
          {/* Genre classification */}
          <MovieInfo 
            label="Genres" 
            value={movie?.genres?.map((g) => g.name).join(' • ') || 'N/A'} 
          />
          
          {/* Financial performance metrics */}
          <View className="flex flex-row justify-between w-full mt-5">
            <View className="flex-1 mr-4">
              <MovieInfo 
                label="Budget" 
                value={formatMoney(movie?.budget)} 
              />
            </View>
            <View className="flex-1">
              <MovieInfo 
                label="Revenue" 
                value={formatMoney(movie?.revenue)} 
              />
            </View>
          </View>
          
          {/* Production information */}
          <MovieInfo 
            label="Production Companies" 
            value={movie?.production_companies?.map((c) => c.name).join(' • ') || 'N/A'} 
          />
          
          {/* Additional movie metadata */}
          <View className="flex flex-row justify-between w-full mt-5">
            <View className="flex-1 mr-4">
              <MovieInfo 
                label="Original Language" 
                value={movie?.original_language?.toUpperCase()} 
              />
            </View>
            <View className="flex-1">
              <MovieInfo 
                label="Content Rating" 
                value={movie?.adult ? '18+' : 'General Audience'} 
              />
            </View>
          </View>
          
        </View>
      </ScrollView>

      {/* Fixed back navigation button */}
      <TouchableOpacity 
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image 
          source={icons.arrow} 
          className="size-5 mr-2 rotate-180" 
          tintColor="#fff" 
        />
        <Text className="text-white font-semibold text-base">Go Back</Text>
      </TouchableOpacity>
    </View>
  )
}

export default MovieDetails;