// components/ReviewsSection.tsx
import { icons } from '@/constants/icons';
import { useAuth } from '@/contexts/AuthContext';
import { createReview, deleteReview, getMovieReviews, getUserReviewForMovie, Review } from '@/services/reviews';
import useFetch from '@/services/useFetch';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import StarRating from './StarRating';

interface ReviewsSectionProps {
  movieId: number;
  movieTitle: string;
}

const ReviewsSection = ({ movieId, movieTitle }: ReviewsSectionProps) => {
  const { user, isAuthenticated } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  // Fetch all reviews for the movie
  const {
    data: reviews,
    loading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews
  } = useFetch(() => getMovieReviews(movieId), true);

  // Check if current user has already reviewed this movie
  const checkUserReview = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        const existingReview = await getUserReviewForMovie(user.$id, movieId);
        setUserReview(existingReview);
      } catch (error) {
        console.error('Error checking user review:', error);
      }
    }
  }, [isAuthenticated, user, movieId]);

  useEffect(() => {
    checkUserReview();
  }, [checkUserReview]);

  const handleSubmitReview = async () => {
    if (!user || !isAuthenticated) {
      router.push('/saved'); // Redirect to auth prompt
      return;
    }

    if (!reviewText.trim()) {
      Alert.alert('Review Required', 'Please write a review before submitting.');
      return;
    }

    if (reviewText.trim().length > 500) {
      Alert.alert('Review Too Long', 'Please keep your review under 500 characters.');
      return;
    }

    try {
      setSubmitting(true);
      
      await createReview(
        user.$id,
        user.name,
        movieId,
        movieTitle,
        userRating,
        reviewText.trim()
      );

      // Reset form and refresh data
      setReviewText('');
      setUserRating(5);
      setShowReviewForm(false);
      
      // Refresh reviews and user review
      await refetchReviews();
      await checkUserReview();

      Alert.alert('Success!', 'Your review has been posted.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!user) return;

    try {
      // Use browser confirm for web, Alert for mobile
      const confirmed = typeof window !== 'undefined' 
        ? window.confirm('Are you sure you want to delete your review? This cannot be undone.')
        : await new Promise(resolve => {
            Alert.alert(
              'Delete Review',
              'Are you sure you want to delete your review? This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                { text: 'Delete', style: 'destructive', onPress: () => resolve(true) }
              ]
            );
          });

      if (!confirmed) return;

      await deleteReview(reviewId, user.$id);
      
      // Refresh data
      await refetchReviews();
      await checkUserReview();
      
      Alert.alert('Deleted', 'Your review has been deleted.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete review.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Sort reviews: user's review first, then by rating (highest first)
  const sortedReviews = reviews ? [...reviews].sort((a, b) => {
    // User's review always comes first
    if (user && a.user_id === user.$id) return -1;
    if (user && b.user_id === user.$id) return 1;
    // Then sort by rating (highest first), then by date (newest first)
    if (a.rating !== b.rating) return b.rating - a.rating;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }) : [];

  return (
    <View className="px-5 mt-6">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-white text-xl font-bold">
          Reviews ({reviews?.length || 0})
        </Text>
        
        {/* Add Review Button */}
        {isAuthenticated && !userReview && (
          <TouchableOpacity
            onPress={() => setShowReviewForm(!showReviewForm)}
            className="bg-accent px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">
              {showReviewForm ? 'Cancel' : 'Write Review'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Review Form */}
      {showReviewForm && isAuthenticated && !userReview && (
        <View className="bg-dark-200/50 rounded-xl p-4 mb-6">
          <Text className="text-white text-lg font-semibold mb-3">Write Your Review</Text>
          
          {/* Star Rating Input */}
          <View className="mb-4">
            <Text className="text-gray-400 text-sm mb-2">Rating</Text>
            <StarRating
              rating={userRating}
              onRatingChange={setUserRating}
              size="large"
              readonly={false}
            />
          </View>

          {/* Review Text Input */}
          <View className="mb-4">
            <Text className="text-gray-400 text-sm mb-2">
              Review ({reviewText.length}/500)
            </Text>
            <TextInput
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Share your thoughts about this movie..."
              placeholderTextColor="#6B7280"
              multiline
              maxLength={500}
              className="bg-dark-100 text-white p-3 rounded-lg min-h-[100px] text-base"
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmitReview}
            disabled={submitting || !reviewText.trim()}
            className={`py-3 rounded-lg ${
              submitting || !reviewText.trim() 
                ? 'bg-gray-600' 
                : 'bg-accent'
            }`}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-center">
                Post Review
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Sign In Prompt */}
      {!isAuthenticated && (
        <TouchableOpacity
          onPress={() => router.push('/saved')}
          className="bg-accent/20 border border-accent rounded-xl p-4 mb-6"
        >
          <Text className="text-accent text-center font-semibold">
            Sign in to write a review
          </Text>
        </TouchableOpacity>
      )}

      {/* Already Reviewed Message */}
      {isAuthenticated && userReview && !showReviewForm && (
        <View className="bg-green-500/20 border border-green-500 rounded-xl p-4 mb-6">
          <Text className="text-green-400 text-center">
            You've already reviewed this movie! Your review is shown below.
          </Text>
        </View>
      )}

      {/* Reviews List */}
      {reviewsLoading ? (
        <View className="py-8">
          <ActivityIndicator size="large" color="#ab8bff" />
          <Text className="text-gray-400 text-center mt-2">Loading reviews...</Text>
        </View>
      ) : reviewsError ? (
        <View className="py-8">
          <Text className="text-red-400 text-center">Error loading reviews</Text>
        </View>
      ) : sortedReviews.length === 0 ? (
        <View className="py-8">
          <Text className="text-gray-400 text-center">
            No reviews yet. Be the first to review this movie!
          </Text>
        </View>
      ) : (
        <View className="space-y-4">
          {sortedReviews.map((review) => (
            <View key={review.$id} className="bg-dark-200/50 rounded-xl p-4">
              {/* Review Header */}
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-white font-semibold text-base mr-2">
                      {review.user_name}
                    </Text>
                    {user && review.user_id === user.$id && (
                      <View className="bg-accent px-2 py-1 rounded">
                        <Text className="text-white text-xs font-semibold">You</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-gray-400 text-sm">
                    {formatDate(review.created_at)}
                  </Text>
                </View>
                
                {/* Delete button for user's own review */}
                {user && review.user_id === user.$id && (
                  <TouchableOpacity
                    onPress={() => handleDeleteReview(review.$id)}
                    className="p-2"
                  >
                    <Image 
                      source={icons.close}
                      className="w-5 h-5" 
                      tintColor="#ef4444" 
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Star Rating */}
              <View className="mb-3">
                <StarRating
                  rating={review.rating}
                  size="small"
                  readonly={true}
                />
              </View>

              {/* Review Text */}
              <Text className="text-gray-300 leading-6">
                {review.review_text}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default ReviewsSection;