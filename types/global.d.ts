// types/global.d.ts

// Movie interfaces
interface Movie {
    id: number;
    title: string;
    poster_path: string;
    vote_average: number;
    release_date: string;
    original_language: string;
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    original_title: string;
    overview: string;
    popularity: number;
    video: boolean;
    vote_count: number;
  }
  
  interface MovieDetails extends Movie {
    budget?: number;
    revenue?: number;
    runtime?: number;
    genres?: Array<{
      id: number;
      name: string;
    }>;
    production_companies?: Array<{
      id: number;
      name: string;
      logo_path?: string;
      origin_country: string;
    }>;
    production_countries?: Array<{
      iso_3166_1: string;
      name: string;
    }>;
    spoken_languages?: Array<{
      english_name: string;
      iso_639_1: string;
      name: string;
    }>;
  }
  
  interface TrendingMovie {
    movie_id: number;
    title: string;
    poster_url: string;
    search_count: number;
  }
  
  interface TrendingCardProps {
    movie: TrendingMovie;
    index: number;
  }
  
  // Auth context types
  interface User {
    $id: string;
    name: string;
    email: string;
  }
  
  interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
  }
  
  // Declare module augmentations for React Navigation if needed
  declare global {
    namespace ReactNavigation {
      interface RootParamList {
        '(tabs)': undefined;
        'movies/[id]': { id: string };
        'auth/login': undefined;
        'auth/signup': undefined;
        'terms': undefined;
        'privacy-policy': undefined;
      }
    }
  }
  
  export { };
