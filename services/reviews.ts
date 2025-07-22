// services/reviews.ts
import { Client, Databases, ID, Query } from 'appwrite';

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const REVIEWS_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID;

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

// Interface for review document
export interface Review {
  $id: string;
  user_id: string;
  user_name: string;
  movie_id: number;
  movie_title: string;
  rating: number; // 1-10 scale
  review_text: string;
  created_at: string;
}

// Create a new review
export const createReview = async (
  userId: string,
  userName: string,
  movieId: number,
  movieTitle: string,
  rating: number,
  reviewText: string
): Promise<Review> => {
  try {
    // Check if user already has a review for this movie
    const existingReview = await getUserReviewForMovie(userId, movieId);
    if (existingReview) {
      throw new Error('You have already reviewed this movie');
    }

    const reviewData = {
      user_id: userId,
      user_name: userName,
      movie_id: movieId,
      movie_title: movieTitle,
      rating: rating,
      review_text: reviewText.trim(),
      created_at: new Date().toISOString(),
    };

    const result = await database.createDocument(
      DATABASE_ID!,
      REVIEWS_COLLECTION_ID!,
      ID.unique(),
      reviewData
    );

    console.log('Review created successfully:', result);
    return result as unknown as Review;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// Get all reviews for a movie
export const getMovieReviews = async (movieId: number): Promise<Review[]> => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID!,
      REVIEWS_COLLECTION_ID!,
      [
        Query.equal('movie_id', movieId),
        Query.orderDesc('rating'), // Highest rated first
        Query.orderDesc('created_at'), // Then newest first for same ratings
        Query.limit(100), // Reasonable limit
      ]
    );

    return result.documents as unknown as Review[];
  } catch (error) {
    console.error('Error fetching movie reviews:', error);
    throw error;
  }
};

// Get a specific user's review for a movie
export const getUserReviewForMovie = async (userId: string, movieId: number): Promise<Review | null> => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID!,
      REVIEWS_COLLECTION_ID!,
      [
        Query.equal('user_id', userId),
        Query.equal('movie_id', movieId),
        Query.limit(1),
      ]
    );

    return result.documents.length > 0 ? (result.documents[0] as unknown as Review) : null;
  } catch (error) {
    console.error('Error fetching user review:', error);
    return null;
  }
};

// Delete a review (only the review owner can delete)
export const deleteReview = async (reviewId: string, userId: string): Promise<void> => {
  try {
    // First verify the review belongs to the user
    const review = await database.getDocument(
      DATABASE_ID!,
      REVIEWS_COLLECTION_ID!,
      reviewId
    );

    if (review.user_id !== userId) {
      throw new Error('You can only delete your own reviews');
    }

    await database.deleteDocument(
      DATABASE_ID!,
      REVIEWS_COLLECTION_ID!,
      reviewId
    );

    console.log('Review deleted successfully');
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Get all reviews by a specific user (for profile page later)
export const getUserReviews = async (userId: string): Promise<Review[]> => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID!,
      REVIEWS_COLLECTION_ID!,
      [
        Query.equal('user_id', userId),
        Query.orderDesc('created_at'), // Most recent first
        Query.limit(100),
      ]
    );

    return result.documents as unknown as Review[];
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

// Get review count for a movie
export const getMovieReviewCount = async (movieId: number): Promise<number> => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID!,
      REVIEWS_COLLECTION_ID!,
      [
        Query.equal('movie_id', movieId),
        Query.limit(1), // We just need the count
      ]
    );

    return result.total;
  } catch (error) {
    console.error('Error getting review count:', error);
    return 0;
  }
};

// Get average rating for a movie
export const getMovieAverageRating = async (movieId: number): Promise<number> => {
  try {
    const reviews = await getMovieReviews(movieId);
    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / reviews.length) * 10) / 10; // Round to 1 decimal place
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return 0;
  }
};