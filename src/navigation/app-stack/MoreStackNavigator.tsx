import MoreMainScreen from '@/screens/app/more/MoreMainScreen';
import OrderDetailsScreen from '@/screens/app/more/order/OrderDetailsScreen';
import OrdersScreen from '@/screens/app/more/order/OrdersScreen';
import PrivacyScreen from '@/screens/app/more/PrivacyScreen';
import ProfileScreen from '@/screens/app/more/profile/ProfileScreen';
import SettingsScreen from '@/screens/app/more/SettingsScreen';
import TermsScreen from '@/screens/app/more/TermsScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import CustomScreenHeader from '../components/ScreenHeader';
import { MoreStackParamList } from '../types';

const MoreStack = createNativeStackNavigator<MoreStackParamList>();

const MoreStackNavigator = () => {
  const { t } = useTranslation();
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
          title: t('HEADER.PROFILE'),
        }}
      />
      <MoreStack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: t('HEADER.ORDERS'),
        }}
      />
      <MoreStack.Screen
        name="OrderDetailsScreen"
        component={OrderDetailsScreen}
        options={{
          title: t('HEADER.ORDER_DETAILS'),
        }}
      />
      <MoreStack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{
          title: t('HEADER.PRIVACY_POLICY'),
        }}
      />
      <MoreStack.Screen
        name="Terms"
        component={TermsScreen}
        options={{
          title: t('HEADER.TERMS_OF_SERVICE'),
        }}
      />
      <MoreStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('HEADER.SETTINGS'),
        }}
      />
    </MoreStack.Navigator>
  );
};

export default MoreStackNavigator;
