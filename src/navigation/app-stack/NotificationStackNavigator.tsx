import NotificationScreen from '@/screens/app/notification/NotificationScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import CustomScreenHeader from '../components/ScreenHeader';
import { NotificationStackParamList } from '../types';

const NotificationStack =
  createNativeStackNavigator<NotificationStackParamList>();

const NotificationStackNavigator = () => {
  const { t } = useTranslation();
  return (
    <NotificationStack.Navigator
      initialRouteName="Notifications"
      screenOptions={{
        title: t('HEADER.NOTIFICATIONS'),
        header: props => <CustomScreenHeader {...props} />,
      }}
    >
      <NotificationStack.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          headerShown: true,
        }}
      />
    </NotificationStack.Navigator>
  );
};

export default NotificationStackNavigator;
