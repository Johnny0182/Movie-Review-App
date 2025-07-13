// Track searches and get the most popular movie for each search term
import { Client, Databases, ID, Query } from 'appwrite';
import { fetchMovies } from './api';

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

// Clean search term
const cleanSearchTerm = (query: string): string => {
  return query.toLowerCase().trim();
};

// Expanded list of short movie titles that should be tracked (2-3 characters)
const shortMovieTitles = [
  // 2 characters
  'up', 'it', 'us', 'pi', 'ai', 'ad', 'go', 'ma', 'if', 'se', 'xt', 'id', 'oz', 'io',
  
  // 3 characters  
  'her', 'elf', 'rio', 'ted', 'big', 'tom', 'blow', 'heat', 'rush', 'life', 
  'noah', 'salt', 'hugo', 'thor', 'dune', 'soul', 'coco', 'luca', 'saw', 'red', 'yes',
  'zed', 'dan', 'max', 'joe', 'bob', 'sam', 'ben', 'tim', 'jim', 'ray', 'leo', 'ivy',
  'eva', 'sue', 'war', 'spy', 'fly', 'run', 'dig', 'hit', 'pop', 'top', 'job', 'cop',
  'mob', 'web', 'net', 'car', 'bus', 'van', 'air', 'sky', 'sea', 'ice', 'sun', 'toy',
  'gun', 'box', 'bag', 'hat', 'dog', 'cat', 'ant', 'bee', 'fox', 'rat', 'owl', 'pig'
];

// Check if search should be tracked
const shouldTrackSearch = (query: string): boolean => {
  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery.length < 2) return false;
  if (cleanQuery.length <= 3 && shortMovieTitles.includes(cleanQuery)) return true;
  if (cleanQuery.length <= 3) return false;
  return cleanQuery.length >= 4;
};

// Get the most popular movie for a search term
const getMostPopularMovieForSearch = async (searchTerm: string) => {
  try {
    const movies = await fetchMovies({ query: searchTerm });
    if (movies && movies.length > 0) {
      // Return the most popular (first) movie from the search results
      return movies[0];
    }
    return null;
  } catch (error) {
    console.log('Error fetching popular movie:', error);
    return null;
  }
};

// Track searches with smart poster selection
export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    if (!shouldTrackSearch(query)) {
      return;
    }

    const cleanQuery = cleanSearchTerm(query);
    
    const result = await database.listDocuments(
      DATABASE_ID!,
      COLLECTION_ID!,
      [Query.equal('searchTerm', cleanQuery)]
    );

    if (result.documents.length > 0) {
      // Just increment count for existing search
      const existingSearch = result.documents[0];
      await database.updateDocument(
        DATABASE_ID!,
        COLLECTION_ID!,
        existingSearch.$id,
        {
          count: existingSearch.count + 1,
        }
      );
    } else {
      // For new search, get the most popular movie
      const popularMovie = await getMostPopularMovieForSearch(cleanQuery);
      
      await database.createDocument(
        DATABASE_ID!,
        COLLECTION_ID!,
        ID.unique(),
        {
          searchTerm: cleanQuery,
          count: 1,
          // Use the most popular movie's data if available
          movie_id: popularMovie?.id || 0,
          title: popularMovie?.title || cleanQuery,
          poster_url: popularMovie?.poster_path 
            ? `https://image.tmdb.org/t/p/w500${popularMovie.poster_path}`
            : `https://via.placeholder.com/300x450/1a1a1a/ffffff.png?text=${encodeURIComponent(cleanQuery)}`,
        }
      );
    }
  } catch (error) {
    console.log('Error updating search count:', error);
    throw error;
  }
};

// Enhanced deduplication - get trending with movie posters (no duplicates)
export const getTrendingMoviesFromMetrics = async (): Promise<TrendingMovie[] | undefined> => {
  try {
    const result = await database.listDocuments(DATABASE_ID!, COLLECTION_ID!, [
      Query.limit(50), // Get even more to ensure we have enough after deduplication
      Query.orderDesc('count'),
    ]);

    console.log('Raw documents before deduplication:', result.documents.length);

    // Enhanced deduplication logic
    const uniqueTrending = new Map();
    
    result.documents.forEach((doc: any) => {
      const searchTerm = doc.searchTerm?.toLowerCase().trim();
      
      // Skip if no searchTerm
      if (!searchTerm) return;
      
      // Check if we already have this search term
      if (!uniqueTrending.has(searchTerm)) {
        // First occurrence of this search term
        uniqueTrending.set(searchTerm, {
          movie_id: doc.movie_id,
          title: doc.searchTerm, // Keep original case for display
          poster_url: doc.poster_url,
          search_count: doc.count,
          original_doc: doc
        });
      } else {
        // We already have this search term, compare counts
        const existing = uniqueTrending.get(searchTerm);
        if (doc.count > existing.search_count) {
          // This document has a higher count, replace it
          uniqueTrending.set(searchTerm, {
            movie_id: doc.movie_id,
            title: doc.searchTerm,
            poster_url: doc.poster_url,
            search_count: doc.count,
            original_doc: doc
          });
        }
      }
    });

    console.log('Unique trending after deduplication:', uniqueTrending.size);

    // Convert map to array, sort by count, and limit to 10
    const trendingMovies = Array.from(uniqueTrending.values())
      .map(item => ({
        movie_id: item.movie_id,
        title: item.title,
        poster_url: item.poster_url,
        search_count: item.search_count
      }))
      .sort((a, b) => b.search_count - a.search_count)
      .slice(0, 10);

    console.log('Final trending movies:', trendingMovies.map(m => `${m.title} (${m.search_count})`));

    return trendingMovies as unknown as TrendingMovie[];
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return undefined;
  }
};

// Keep the original function for backward compatibility
export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
  try {
    const result = await database.listDocuments(DATABASE_ID!, COLLECTION_ID!, [
      Query.limit(5),
      Query.orderDesc('count'),
    ]);
    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};