import { icons } from '@/constants/icons';
import { fetchMovieDetails } from '@/services/api';
import useFetch from '@/services/useFetch';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Props interface for reusable MovieInfo component
interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

// Reusable component for displaying movie information with consistent styling
// Takes a label and value, displays them in a standardized format with gray text
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
// Converts large numbers into readable format with appropriate suffixes (B/M/K)
// Handles edge cases like null values and provides consistent decimal formatting
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

// Main movie details screen component
// Fetches and displays comprehensive movie information including poster, metadata, and financial data
// Uses expo-router for navigation and custom hooks for data fetching
const MovieDetails = () => {
  const { id } = useLocalSearchParams();
  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string));
  
  return (
    <View className="bg-primary flex-1">
      {/* Main scrollable content container */}
      {/* Provides adequate bottom padding to prevent content from being hidden behind the back button */}
      <ScrollView contentContainerStyle={{
        paddingBottom: 100 
      }}>
        
        {/* Hero poster section */}
        {/* Displays the main movie poster in full width with stretching to fill the container */}
        {/* Uses TMDB's w500 image size for optimal quality and loading performance */}
        <View>
          <Image 
            source={{ uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`}} 
            className="w-full h-[550px]" 
            resizeMode="stretch" 
          />
        </View>

        {/* Title and basic info section */}
        {/* Shows movie title prominently with release year and runtime in a compact layout */}
        {/* Uses semantic spacing and typography hierarchy for visual clarity */}
        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{movie?.title}</Text>
          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">
              {movie?.release_date?.split('-')[0]}
            </Text>
            <Text className="text-light-200 text-sm">•</Text>
            <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
          </View>
        </View>

        {/* Rating display section */}
        {/* Features star icon with numerical rating and vote count for credibility */}
        {/* Uses rounded values for cleaner presentation and includes vote count for transparency */}
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
        {/* Contains all the movie metadata organized in logical groups */}
        {/* Uses consistent spacing and typography for easy scanning and readability */}
        <View className="px-5">
          
          {/* Story overview */}
          {/* Displays the full plot synopsis to help users understand the movie's premise */}
          <MovieInfo 
            label="Overview" 
            value={movie?.overview} 
          />
          
          {/* Genre classification */}
          {/* Shows all genres separated by bullet points for clear categorization */}
          <MovieInfo 
            label="Genres" 
            value={movie?.genres?.map((g) => g.name).join(' • ') || 'N/A'} 
          />
          
          {/* Financial performance metrics */}
          {/* Side-by-side layout showing both production budget and box office revenue */}
          {/* Uses formatted currency values for professional presentation */}
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
          {/* Lists all production companies involved in making the film */}
          {/* Provides insight into the movie's backing and production scale */}
          <MovieInfo 
            label="Production Companies" 
            value={movie?.production_companies?.map((c) => c.name).join(' • ') || 'N/A'} 
          />
          
          {/* Additional movie metadata */}
          {/* Shows original language and adult content rating for content appropriateness */}
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
      {/* Positioned absolutely at the bottom for easy access regardless of scroll position */}
      {/* Uses accent color and clear iconography for intuitive navigation */}
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