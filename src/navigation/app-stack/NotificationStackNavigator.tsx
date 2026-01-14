import NotificationScreen from '@/screens/app/notification/NotificationScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomScreenHeader from '../components/ScreenHeader';
import { NotificationStackParamList } from '../types';

const NotificationStack =
  createNativeStackNavigator<NotificationStackParamList>();

const NotificationStackNavigator = () => {
  return (
    <NotificationStack.Navigator
      initialRouteName="Notifications"
      screenOptions={{
        title: 'Notifications',
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
