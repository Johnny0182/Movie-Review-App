// services/savedMovies.ts
import { Client, Databases, ID, Query } from 'appwrite';

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const SAVED_MOVIES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_SAVED_MOVIES_COLLECTION_ID;

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

// Interface for saved movie document
interface SavedMovieDocument {
  $id: string;
  user_id: string;
  movie_id: number;
  title: string;
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
  saved_at: string;
}

// Save a movie for a user
export const saveMovie = async (userId: string, movie: Movie): Promise<void> => {
  try {
    // Check if movie is already saved to prevent duplicates
    const existing = await isMovieSaved(userId, movie.id);
    if (existing) {
      console.log('Movie already saved');
      return;
    }

    await database.createDocument(
      DATABASE_ID!,
      SAVED_MOVIES_COLLECTION_ID!,
      ID.unique(),
      {
        user_id: userId,
        movie_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || '',
        vote_average: movie.vote_average || 0,
        release_date: movie.release_date || '',
        saved_at: new Date().toISOString(),
      }
    );

    console.log('Movie saved successfully:', movie.title);
  } catch (error) {
    console.error('Error saving movie:', error);
    throw error;
  }
};

// Remove a saved movie
export const unsaveMovie = async (userId: string, movieId: number): Promise<void> => {
  try {
    // Find the document to delete
    const result = await database.listDocuments(
      DATABASE_ID!,
      SAVED_MOVIES_COLLECTION_ID!,
      [
        Query.equal('user_id', userId),
        Query.equal('movie_id', movieId),
      ]
    );

    if (result.documents.length > 0) {
      await database.deleteDocument(
        DATABASE_ID!,
        SAVED_MOVIES_COLLECTION_ID!,
        result.documents[0].$id
      );
      console.log('Movie unsaved successfully');
    }
  } catch (error) {
    console.error('Error unsaving movie:', error);
    throw error;
  }
};

// Get all saved movies for a user
export const getUserSavedMovies = async (userId: string): Promise<Movie[]> => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID!,
      SAVED_MOVIES_COLLECTION_ID!,
      [
        Query.equal('user_id', userId),
        Query.orderDesc('saved_at'), // Most recently saved first
        Query.limit(100), // Reasonable limit
      ]
    );

    // Convert Appwrite documents to Movie format
    return result.documents.map((doc: any) => ({
      id: doc.movie_id,
      title: doc.title,
      poster_path: doc.poster_path,
      vote_average: doc.vote_average,
      release_date: doc.release_date,
      original_language: '', // Not stored in saved movies
      adult: false,
      backdrop_path: '',
      genre_ids: [],
      original_title: doc.title,
      overview: '',
      popularity: 0,
      video: false,
      vote_count: 0,
    }));
  } catch (error) {
    console.error('Error fetching saved movies:', error);
    throw error;
  }
};

// Check if a specific movie is saved by a user
export const isMovieSaved = async (userId: string, movieId: number): Promise<boolean> => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID!,
      SAVED_MOVIES_COLLECTION_ID!,
      [
        Query.equal('user_id', userId),
        Query.equal('movie_id', movieId),
        Query.limit(1),
      ]
    );

    return result.documents.length > 0;
  } catch (error) {
    console.error('Error checking if movie is saved:', error);
    return false;
  }
};

// Get count of saved movies for a user
export const getSavedMoviesCount = async (userId: string): Promise<number> => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID!,
      SAVED_MOVIES_COLLECTION_ID!,
      [
        Query.equal('user_id', userId),
        Query.limit(1), // We just need the count
      ]
    );

    return result.total;
  } catch (error) {
    console.error('Error getting saved movies count:', error);
    return 0;
  }
};

// Toggle save/unsave a movie
export const toggleMovieSaved = async (userId: string, movie: Movie): Promise<boolean> => {
  try {
    const isSaved = await isMovieSaved(userId, movie.id);
    
    if (isSaved) {
      await unsaveMovie(userId, movie.id);
      return false; // Now unsaved
    } else {
      await saveMovie(userId, movie);
      return true; // Now saved
    }
  } catch (error) {
    console.error('Error toggling movie saved state:', error);
    throw error;
  }
};