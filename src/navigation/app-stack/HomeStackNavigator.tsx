import HomeScreen from '@/screens/app/home/HomeScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { homePath } from '../pathLocations';
import { RootStackParamList } from '../types';

const HomeStack = createNativeStackNavigator<RootStackParamList>();
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator initialRouteName={homePath}>
      <HomeStack.Screen
        name={homePath}
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
    </HomeStack.Navigator>
  );
};

export default HomeStackNavigator;
