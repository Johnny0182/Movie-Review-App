import { Link } from "expo-router";
import React from 'react';
import { Image, TouchableOpacity } from 'react-native';

const TrendingCard = ({ movie: { movie_id, title, poster_url }, index }: TrendingCardProps) => {
  // Only render if poster_url exists and is valid
  if (!poster_url || poster_url.includes('${movie.poster_path}')) {
    return null;
  }

  return (
    <Link href={`/movies/${movie_id}`} asChild>
      <TouchableOpacity className="w-32 relative pl-5">
        <Image 
          source={{ uri: poster_url }}
          className="w-32 h-48 rounded-lg"
          resizeMode="cover"
        />
      </TouchableOpacity>
    </Link>
  );
}

export default TrendingCard;