import CommunityScreen from '@/screens/app/community/CommunityScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const CommunityStackNavigator = ({ route }: { route: any }) => {
  const { communityId } = route?.params || {};

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="CommunityScreen"
        component={CommunityScreen}
        initialParams={{ communityId }}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default CommunityStackNavigator;
