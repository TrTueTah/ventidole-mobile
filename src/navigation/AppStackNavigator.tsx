import SettingsScreen from '@/screens/SettingsScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import { bottomTabPath } from './pathLocations';
import { RootStackParamList } from './types';

const AppStack = createNativeStackNavigator<RootStackParamList>();

const AppStackNavigator = () => {
  return (
    <>
      <AppStack.Navigator
        initialRouteName={bottomTabPath}
        screenOptions={{ headerShown: false }}
      >
        <AppStack.Screen
          key={bottomTabPath}
          name={bottomTabPath}
          component={BottomTabNavigator}
        />
        {/* <AppStack.Screen
          key={postStackPath}
          name={postStackPath}
          component={PostStackScreen}
        />
        <AppStack.Screen
          key={communityStackPath}
          name={communityStackPath}
          component={CommunityStackScreen}
        />
        <AppStack.Screen
          key={paymentStackPath}
          name={paymentStackPath}
          component={Payment}
          options={{ headerShown: false }}
        /> */}
        <AppStack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
          }}
        />
      </AppStack.Navigator>
    </>
  );
};

export default AppStackNavigator;
