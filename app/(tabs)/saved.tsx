// app/(tabs)/saved.tsx
import AuthPrompt from '@/components/AuthPrompt';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSavedMovies, unsaveMovie } from '@/services/savedMovies';
import useFetch from '@/services/useFetch';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const Saved = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch saved movies from Appwrite
  const {
    data: savedMovies,
    loading: moviesLoading,
    error: moviesError,
    refetch: refetchSavedMovies
  } = useFetch(
    () => user ? getUserSavedMovies(user.$id) : Promise.resolve([]),
    false // Don't auto-fetch until user is available
  );

  // Fetch saved movies when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      refetchSavedMovies();
    }
  }, [isAuthenticated, user]);

  // Handle refresh
  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await refetchSavedMovies();
    setRefreshing(false);
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
        title="Save Your Favorites"
        message="Sign in to save movies, create watchlists, and get personalized recommendations"
        onSuccess={() => {
          console.log('User signed in successfully!');
        }}
      />
    );
  }

  // Function to remove a movie from saved list
  const removeSavedMovie = async (movieId: number) => {
    if (!user) return;
    
    try {
      await unsaveMovie(user.$id, movieId);
      // Refresh the list after removing
      await refetchSavedMovies();
      Alert.alert('Removed!', 'Movie has been removed from your saved list');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove movie. Please try again.');
      console.error('Error removing saved movie:', error);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const EmptyState = () => (
    <View className="flex-1 justify-center items-center px-10">
      <Image 
        source={icons.save} 
        className="w-16 h-16 mb-4" 
        tintColor="#6B7280" 
      />
      <Text className="text-gray-400 text-lg font-semibold mb-2">
        No Saved Movies
      </Text>
      <Text className="text-gray-500 text-center text-sm leading-5">
        Movies you save will appear here. Start exploring and save your favorites!
      </Text>
    </View>
  );

  const LoadingState = () => (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#ab8bff" />
      <Text className="text-white mt-4">Loading your saved movies...</Text>
    </View>
  );

  const ErrorState = () => (
    <View className="flex-1 justify-center items-center px-10">
      <Text className="text-red-400 text-lg font-semibold mb-2">
        Error Loading Movies
      </Text>
      <Text className="text-gray-500 text-center text-sm leading-5 mb-4">
        {moviesError?.message || 'Something went wrong'}
      </Text>
      <TouchableOpacity
        onPress={refetchSavedMovies}
        className="bg-accent px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  // Custom movie card for saved page - clean and modern
  const SavedMovieCard = ({ item }: { item: Movie }) => {
    const capitalizeTitle = (title: string) => {
      return title
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    const handleDeletePress = (e: any) => {
      e.stopPropagation();
      Alert.alert(
        'Remove Movie',
        `Are you sure you want to remove "${item.title}" from your saved movies?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: () => removeSavedMovie(item.id)
          }
        ]
      );
    };

    return (
      <View className="w-[30%] mb-6">
        {!isEditMode ? (
          <Link href={`/movies/${item.id}`} asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <View className="relative">
                <Image
                  source={{ 
                    uri: item.poster_path
                      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                      : 'https://via.placeholder.com/300x450/1a1a1a/ffffff.png'
                  }}
                  className="w-full aspect-[2/3] rounded-xl"
                  resizeMode="cover"
                />
              </View>
              
              <View className="mt-3">
                <Text className="text-white font-bold text-sm leading-tight" numberOfLines={2}>
                  {capitalizeTitle(item.title)}
                </Text>

                <View className="flex-row items-center mt-1">
                  <Image source={icons.star} className="w-3 h-3 mr-1" />
                  <Text className="text-yellow-400 font-semibold text-xs">
                    {Math.round(item.vote_average / 2)}/5
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        ) : (
          <TouchableOpacity disabled activeOpacity={1}>
            <View className="relative">
              <Image
                source={{ 
                  uri: item.poster_path
                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                    : 'https://via.placeholder.com/300x450/1a1a1a/ffffff.png'
                }}
                className="w-full aspect-[2/3] rounded-xl"
                resizeMode="cover"
              />
              
              {/* Delete button in edit mode */}
              <TouchableOpacity
                onPress={handleDeletePress}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full w-7 h-7 items-center justify-center z-10 shadow-lg"
                activeOpacity={0.8}
              >
                <Text className="text-white text-sm font-bold">×</Text>
              </TouchableOpacity>
            </View>
            
            <View className="mt-3">
              <Text className="text-white font-bold text-sm leading-tight" numberOfLines={2}>
                {capitalizeTitle(item.title)}
              </Text>

              <View className="flex-row items-center mt-1">
                <Image source={icons.star} className="w-3 h-3 mr-1" />
                <Text className="text-yellow-400 font-semibold text-xs">
                  {Math.round(item.vote_average / 2)}/5
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 mt-16 mb-5">
        <View className="flex-row items-center">
          <Image source={icons.save} className="w-6 h-6 mr-2" tintColor="#ab8bff" />
          <Text className="text-white text-xl font-bold">
            Saved Movies ({savedMovies?.length || 0})
          </Text>
        </View>
        
        {savedMovies && savedMovies.length > 0 && (
          <TouchableOpacity 
            onPress={toggleEditMode}
            className={`px-4 py-2 rounded-lg ${isEditMode ? 'bg-red-500' : 'bg-accent'}`}
          >
            <Text className="text-white font-semibold">
              {isEditMode ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Edit Mode Instructions */}
      {isEditMode && savedMovies && savedMovies.length > 0 && (
        <View className="mx-5 mb-4 bg-red-500/20 border border-red-500 rounded-lg p-3">
          <Text className="text-red-400 text-sm text-center">
            Tap the × on any movie to remove it from your saved list
          </Text>
        </View>
      )}

      {/* Content */}
      {moviesLoading ? (
        <LoadingState />
      ) : moviesError ? (
        <ErrorState />
      ) : !savedMovies || savedMovies.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={savedMovies}
          renderItem={({ item }) => <SavedMovieCard item={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          columnWrapperStyle={{
            justifyContent: 'flex-start',
            paddingHorizontal: 20,
            gap: 10
          }}
          contentContainerStyle={{ 
            paddingBottom: 100,
            paddingTop: 10
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default Saved;