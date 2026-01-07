import MoreMainScreen from '@/screens/app/more/MoreMainScreen';
import OrderDetailsScreen from '@/screens/app/more/order/OrderDetailsScreen';
import OrdersScreen from '@/screens/app/more/order/OrdersScreen';
import PrivacyScreen from '@/screens/app/more/PrivacyScreen';
import ProfileScreen from '@/screens/app/more/profile/ProfileScreen';
import SettingsScreen from '@/screens/app/more/SettingsScreen';
import TermsScreen from '@/screens/app/more/TermsScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomScreenHeader from '../components/ScreenHeader';
import { MoreStackParamList } from '../types';

const MoreStack = createNativeStackNavigator<MoreStackParamList>();

const MoreStackNavigator = () => {
  return (
    <MoreStack.Navigator
      initialRouteName="MoreMain"
      screenOptions={{
        header: props => <CustomScreenHeader {...props} />,
      }}
    >
      <MoreStack.Screen
        name="MoreMain"
        component={MoreMainScreen}
        options={{
          headerShown: false,
        }}
      />
      <MoreStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
      <MoreStack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: 'My Orders',
        }}
      />
      <MoreStack.Screen
        name="OrderDetailsScreen"
        component={OrderDetailsScreen}
        options={{
          title: 'Order Details',
        }}
      />
      <MoreStack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{
          title: 'Privacy Policy',
        }}
      />
      <MoreStack.Screen
        name="Terms"
        component={TermsScreen}
        options={{
          title: 'Terms of Service',
        }}
      />
      <MoreStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </MoreStack.Navigator>
  );
};

export default MoreStackNavigator;
