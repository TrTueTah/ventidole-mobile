import SettingsScreen from '@/screens/SettingsScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CommunityStackNavigator from './app-stack/CommunityStackNavigator';
import PaymentStackNavigator from './app-stack/PaymentStackNavigator';
import PostStackNavigator from './app-stack/PostStackNavigator';
import BottomTabNavigator from './BottomTabNavigator';
import {
  bottomTabPath,
  communityStackPath,
  paymentStackPath,
  postStackPath,
} from './pathLocations';
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
        <AppStack.Screen
          key={postStackPath}
          name={postStackPath}
          component={PostStackNavigator}
        />
        <AppStack.Screen
          key={communityStackPath}
          name={communityStackPath}
          component={CommunityStackNavigator}
        />
        {/* <AppStack.Screen
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
        <AppStack.Screen
          name={paymentStackPath}
          component={PaymentStackNavigator}
          options={{ headerShown: false }}
        />
      </AppStack.Navigator>
    </>
  );
};

export default AppStackNavigator;
