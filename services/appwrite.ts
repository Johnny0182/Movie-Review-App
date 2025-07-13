// Track the searches made by the user
import { Client, Databases, ID, Query } from 'appwrite';

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1') // My Appwrite endpoint
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!); // My Appwrite project ID

const database = new Databases(client);

// Clean search term to avoid partial matches
const cleanSearchTerm = (query: string): string => {
  return query.toLowerCase().trim();
};

// Expanded list of short movie titles that should be tracked (2-3 characters)
const shortMovieTitles = [
  // 2 characters
  'up', 'it', 'us', 'pi', 'ai', 'ad', 'go', 'ma', 'if', 'se', 'xt', 'id', 'oz', 'io',
  
  // 3 characters  
  'her', 'elf', 'rio', 'ted', 'big', 'tom', 'lucy', 'blow', 'heat', 'rush', 'life', 
  'noah', 'salt', 'hug', 'sex', 'dune', 'soul', 'coco', 'luca', 'saw', 'red', 'yes',
  'zed', 'dan', 'max', 'joe', 'bob', 'sam', 'ben', 'tim', 'jim', 'ray', 'leo', 'ivy',
  'eva', 'sue', 'war', 'spy', 'fly', 'run', 'dig', 'hit', 'pop', 'top', 'job', 'cop',
  'mob', 'web', 'net', 'car', 'bus', 'van', 'air', 'sky', 'sea', 'ice', 'sun', 'toy',
  'gun', 'box', 'bag', 'hat', 'dog', 'cat', 'ant', 'bee', 'fox', 'rat', 'owl', 'pig'
];

// Check if search term should be tracked
const shouldTrackSearch = (query: string): boolean => {
  const cleanQuery = query.trim().toLowerCase();
  
  // Don't track if too short
  if (cleanQuery.length < 2) return false;
  
  // Allow whitelisted short movie titles (2-3 characters)
  if (cleanQuery.length <= 3 && shortMovieTitles.includes(cleanQuery)) {
    return true;
  }
  
  // For 2-3 character searches not in whitelist, don't track
  if (cleanQuery.length <= 3) {
    return false;
  }
  
  // Track anything 4+ characters automatically
  return cleanQuery.length >= 4;
};

// Track searches by search term (smart filtering)
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
      await database.createDocument(
        DATABASE_ID!,
        COLLECTION_ID!,
        ID.unique(),
        {
          searchTerm: cleanQuery,
          movie_id: movie.id,
          count: 1,
          title: movie.title,
          poster_url: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/300x450/1a1a1a/ffffff.png',
        }
      );
    }
  } catch (error) {
    console.log('Error updating search count:', error);
    throw error;
  }
};

// Get trending based on what people actually searched for (no duplicates)
export const getTrendingMoviesFromMetrics = async (): Promise<TrendingMovie[] | undefined> => {
  try {
    const result = await database.listDocuments(DATABASE_ID!, COLLECTION_ID!, [
      Query.limit(20), // Get more to filter out duplicates
      Query.orderDesc('count'),
    ]);

    // Remove duplicates by searchTerm and keep highest count
    const uniqueTrending = new Map();
    
    result.documents.forEach((doc: any) => {
      const searchTerm = doc.searchTerm;
      if (!uniqueTrending.has(searchTerm) || uniqueTrending.get(searchTerm).count < doc.count) {
        uniqueTrending.set(searchTerm, {
          movie_id: doc.movie_id,
          title: doc.searchTerm, // Show what people searched for
          poster_url: doc.poster_url,
          search_count: doc.count
        });
      }
    });

    // Convert map to array and sort by count, then limit to 10
    const trendingMovies = Array.from(uniqueTrending.values())
      .sort((a, b) => b.search_count - a.search_count)
      .slice(0, 10);

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