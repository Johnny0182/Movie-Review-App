import MovieCard from '@/components/MovieCard';
import SearchBar from '@/components/SearchBar';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { fetchMovies } from '@/services/api';
import { getTrendingMoviesFromMetrics, updateSearchCount } from '@/services/appwrite';
import useFetch from '@/services/useFetch';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch trending movies for display before search
  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError
  } = useFetch(getTrendingMoviesFromMetrics, true);

  const {
    data: movies,
    loading,
    error,
    refetch: loadMovies,
    reset,
  } = useFetch(
    () =>
      fetchMovies({
        query: searchQuery,
      }),
    false
  );

  // Load movies when search query changes (300ms debounce for fast UI)
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadMovies();
      } else {
        reset();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Update search count with LONGER debounce to prevent partial searches
  useEffect(() => {
    const trackingTimeoutId = setTimeout(() => {
      if (movies?.length > 0 && searchQuery.trim()) {
        // Only track after user has stopped typing for 1 second
        updateSearchCount(searchQuery, {
          id: 0,
          title: '',
          poster_path: '',
          vote_average: 0,
          release_date: '',
          original_language: '',
          adult: false,
          backdrop_path: '',
          genre_ids: [],
          original_title: '',
          overview: '',
          popularity: 0,
          video: false,
          vote_count: 0
        });
      }
    }, 1000); // 1 second delay for tracking (vs 300ms for search)

    return () => clearTimeout(trackingTimeoutId);
  }, [movies, searchQuery]);

  // Convert trending movies to Movie format for MovieCard
  const convertTrendingToMovie = (trendingMovie: any) => ({
    id: trendingMovie.movie_id,
    title: trendingMovie.title,
    poster_path: trendingMovie.poster_url?.replace('https://image.tmdb.org/t/p/w500', '') || '',
    vote_average: 8, // Default rating for trending
    release_date: '',
    original_language: '',
    adult: false,
    backdrop_path: '',
    genre_ids: [],
    original_title: trendingMovie.title,
    overview: '',
    popularity: trendingMovie.search_count || 0,
    video: false,
    vote_count: 0
  });

  // Decide what data to show
  const showTrending = !searchQuery.trim() && !loading;
  const showSearchResults = searchQuery.trim() && !loading;

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      <FlatList
        data={showSearchResults 
          ? movies 
          : (showTrending ? trendingMovies?.slice(0, 21).map(convertTrendingToMovie) : [])
        }
        renderItem={({ item }) => <MovieCard {...item} />}
        keyExtractor={(item) => item.id.toString()}
        className="px-5"
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: 'center',
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} className="w-12 h-10 mb-5" />
            </View>

            <View className="mb-5">
              <SearchBar
                placeholder="Search movies ..."
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
              />
            </View>

            {/* Loading states */}
            {loading && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-3"
              />
            )}

            {trendingLoading && !searchQuery.trim() && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-3"
              />
            )}

            {/* Error states */}
            {error && (
              <Text className="text-red-500 px-5 my-3">
                Error: {error.message}
              </Text>
            )}

            {trendingError && !searchQuery.trim() && (
              <Text className="text-red-500 px-5 my-3">
                Error loading trending: {trendingError.message}
              </Text>
            )}

            {/* Search Results Header */}
            {searchQuery.trim() && !loading && (
              <Text className="text-xl text-white font-bold px-5 my-3">
                Search Results for{' '}
                <Text className="text-accent">{searchQuery}</Text>
              </Text>
            )}



            {/* No results messages */}
            {!loading &&
              !error &&
              searchQuery.trim() &&
              movies?.length === 0 && (
                <Text className="text-sm text-gray-400 px-5">
                  No movies found for "{searchQuery}"
                </Text>
              )}

            {/* Success messages */}
            {!loading &&
              !error &&
              searchQuery.trim() &&
              movies?.length > 0 && (
                <Text className="text-sm text-green-500 px-5">
                  Found {movies.length} movies
                </Text>
              )}

            {/* Trending count message */}
            {showTrending && 
              !trendingLoading && 
              !trendingError && 
              trendingMovies && 
              trendingMovies.length > 0 && (
                <Text className="text-sm text-green-500 px-5">
                  Showing {Math.min(trendingMovies.length, 21)} trending movies
                </Text>
              )}
          </>
        }
      />
    </View>
  );
};

export default Search;