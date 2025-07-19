import AuthPrompt from '@/components/AuthPrompt';
import React from 'react';

const SignUp = () => {
  return (
    <AuthPrompt 
      title="Join Movie Amigos"
      message="Create an account to save your favorite movies, build watchlists, and get personalized recommendations"
      actionText="Get Started"
      showGoogleButton={true}
    />
  );
};

export default SignUp;