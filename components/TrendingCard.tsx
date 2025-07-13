import { Link } from "expo-router";
import React from 'react';
import { Image, TouchableOpacity } from 'react-native';

const TrendingCard = ({ movie: { movie_id, title, poster_url }, index }: TrendingCardProps) => {
  // Fix broken poster URLs
  const fixedPosterUrl = poster_url.includes('${movie.poster_path}') 
    ? 'https://via.placeholder.com/300x450/1a1a1a/ffffff.png' 
    : poster_url;

  return (
    <Link href={`/movies/${movie_id}`} asChild>
      <TouchableOpacity className="w-32 relative pl-5">
        <Image 
          source={{ uri: fixedPosterUrl }}
          className="w-32 h-48 rounded-lg"
          resizeMode="cover"
        />
      </TouchableOpacity>
    </Link>
  );
}
export default TrendingCard;