import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Mock saved movies data for now - will be replaced with real data from Appwrite
const mockSavedMovies = [
  {
    id: 550,
    title: "Fight Club",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    vote_average: 8.4,
    release_date: "1999-10-15",
    original_language: "en"
  },
  {
    id: 13,
    title: "Forrest Gump", 
    poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    vote_average: 8.5,
    release_date: "1994-06-23",
    original_language: "en"
  },
  {
    id: 278,
    title: "The Shawshank Redemption",
    poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", 
    vote_average: 9.3,
    release_date: "1994-09-23",
    original_language: "en"
  },
  {
    id: 238,
    title: "The Godfather",
    poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    vote_average: 9.2,
    release_date: "1972-03-14",
    original_language: "en"
  },
  {
    id: 680,
    title: "Pulp Fiction",
    poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    vote_average: 8.9,
    release_date: "1994-09-10",
    original_language: "en"
  },
  {
    id: 155,
    title: "The Dark Knight",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    vote_average: 9.0,
    release_date: "2008-07-16",
    original_language: "en"
  }
];

const Saved = () => {
  const [savedMovies, setSavedMovies] = useState(mockSavedMovies);
  const [isEditMode, setIsEditMode] = useState(false);

  // Function to remove a movie from saved list
  const removeSavedMovie = (movieId: number) => {
    setSavedMovies(prev => prev.filter(movie => movie.id !== movieId));
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

  // Custom movie card for saved page - clean and modern
  const SavedMovieCard = ({ item }: { item: any }) => {
    const capitalizeTitle = (title: string) => {
      return title
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    const handleDeletePress = (e: any) => {
      e.stopPropagation();
      removeSavedMovie(item.id);
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
            Saved Movies ({savedMovies.length})
          </Text>
        </View>
        
        {savedMovies.length > 0 && (
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
      {isEditMode && savedMovies.length > 0 && (
        <View className="mx-5 mb-4 bg-red-500/20 border border-red-500 rounded-lg p-3">
          <Text className="text-red-400 text-sm text-center">
            Tap the × on any movie to remove it from your saved list
          </Text>
        </View>
      )}

      {/* Content */}
      {savedMovies.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={savedMovies}
          renderItem={({ item }) => <SavedMovieCard item={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          key={savedMovies.length} // Force re-render when items are deleted
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