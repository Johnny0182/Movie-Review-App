import AuthPrompt from '@/components/AuthPrompt';
import React from 'react';

const Login = () => {
  return (
    <AuthPrompt 
      title="Welcome Back"
      message="Sign in to access your saved movies and personalized recommendations"
      actionText="Sign In"
    />
  );
};

export default Login;