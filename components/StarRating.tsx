// components/StarRating.tsx
import { icons } from '@/constants/icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface StarRatingProps {
  rating: number; // 1-10 scale
  onRatingChange?: (rating: number) => void;
  size?: 'small' | 'medium' | 'large';
  readonly?: boolean;
  showNumber?: boolean;
}

const StarRating = ({ 
  rating, 
  onRatingChange, 
  size = 'medium', 
  readonly = false,
  showNumber = true 
}: StarRatingProps) => {
  const starCount = 5;
  
  // Size configurations
  const sizeConfig = {
    small: { starSize: 'w-4 h-4', textSize: 'text-sm', spacing: 'gap-1' },
    medium: { starSize: 'w-6 h-6', textSize: 'text-base', spacing: 'gap-2' },
    large: { starSize: 'w-8 h-8', textSize: 'text-lg', spacing: 'gap-3' }
  };

  const config = sizeConfig[size];

  // Convert 1-10 rating to 5-star display (each star represents 2 points)
  const getStarFill = (starIndex: number) => {
    const starValue = (starIndex + 1) * 2; // Star 1 = 2, Star 2 = 4, etc.
    const prevStarValue = starIndex * 2; // Star 0 = 0, Star 1 = 2, etc.
    
    if (rating >= starValue) {
      return 'full'; // Full star
    } else if (rating > prevStarValue) {
      return 'half'; // Half star
    } else {
      return 'empty'; // Empty star
    }
  };

  const handleStarPress = (starIndex: number, isHalf: boolean = false) => {
    if (readonly || !onRatingChange) return;
    
    // Calculate rating based on star position and half/full press
    const newRating = isHalf ? (starIndex * 2) + 1 : (starIndex + 1) * 2;
    onRatingChange(Math.max(1, Math.min(10, newRating)));
  };

  const renderStar = (starIndex: number) => {
    const fillType = getStarFill(starIndex);
    const isInteractive = !readonly && onRatingChange;

    if (isInteractive) {
      // Interactive stars - split into halves for precise rating
      return (
        <View key={starIndex} className={`${config.starSize} relative`}>
          {/* Left half */}
          <TouchableOpacity
            onPress={() => handleStarPress(starIndex, true)}
            className="absolute left-0 top-0 w-1/2 h-full z-10"
            activeOpacity={0.7}
          />
          
          {/* Right half */}
          <TouchableOpacity
            onPress={() => handleStarPress(starIndex, false)}
            className="absolute right-0 top-0 w-1/2 h-full z-10"
            activeOpacity={0.7}
          />
          
          {/* Star background (empty) */}
          <Image 
            source={icons.star} 
            className={`${config.starSize} absolute`}
            tintColor="#374151" // Gray for empty
          />
          
          {/* Star fill */}
          <View className={`${config.starSize} overflow-hidden`}>
            <Image 
              source={icons.star} 
              className={`${config.starSize}`}
              tintColor="#FCD34D" // Yellow for filled
              style={{
                opacity: fillType === 'full' ? 1 : fillType === 'half' ? 0.5 : 0
              }}
            />
          </View>
        </View>
      );
    } else {
      // Static stars for display only
      return (
        <View key={starIndex} className={config.starSize}>
          {/* Star background */}
          <Image 
            source={icons.star} 
            className={`${config.starSize} absolute`}
            tintColor="#374151"
          />
          
          {/* Star fill overlay */}
          <View 
            className={`${config.starSize} overflow-hidden`}
            style={{
              width: fillType === 'full' ? '100%' : fillType === 'half' ? '50%' : '0%'
            }}
          >
            <Image 
              source={icons.star} 
              className={`${config.starSize}`}
              tintColor="#FCD34D"
            />
          </View>
        </View>
      );
    }
  };

  return (
    <View className={`flex-row items-center ${config.spacing}`}>
      {/* Stars */}
      <View className={`flex-row ${config.spacing}`}>
        {Array.from({ length: starCount }, (_, index) => renderStar(index))}
      </View>
      
      {/* Rating number */}
      {showNumber && (
        <Text className={`text-white font-semibold ${config.textSize} ml-2`}>
          {rating}/10
        </Text>
      )}
    </View>
  );
};

export default StarRating;