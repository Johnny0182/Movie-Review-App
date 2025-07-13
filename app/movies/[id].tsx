import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

const MovieDetail = () => {
  const { id } = useLocalSearchParams();

  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <Text className="text-white text-xl">Movie ID: {id}</Text>
    </View>
  );
};

export default MovieDetail;