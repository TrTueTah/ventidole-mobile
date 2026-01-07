import ProfileScreen from '@/screens/app/profile/ProfileScreen';
import { RouteProp, useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ProfileStack'>>();
  const { userId } = route.params;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        initialParams={{ userId }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
