import ChannelDetailScreen from '@/screens/app/chat/ChannelDetailScreen';
import ChatListScreen from '@/screens/app/chat/ChatListScreen';
import ChatWindowScreen from '@/screens/app/chat/ChatWindowScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import CustomScreenHeader from '../components/ScreenHeader';
import { chatListPath } from '../pathLocations';
import { ChatStackParamList } from '../types';

const ChatStack = createNativeStackNavigator<ChatStackParamList>();

const ChatStackNavigator = () => {
  const { t } = useTranslation();
  return (
    <ChatStack.Navigator
      initialRouteName={chatListPath}
      screenOptions={{
        header: props => <CustomScreenHeader {...props} />,
      }}
    >
      <ChatStack.Screen
        name={chatListPath}
        component={ChatListScreen}
        options={{
          headerShown: false,
        }}
      />
      <ChatStack.Screen
        name="ChatWindow"
        component={ChatWindowScreen}
        options={{
          headerShown: true,
          title: t('HEADER.CHAT_WINDOW'),
        }}
      />
      <ChatStack.Screen
        name="ChannelDetail"
        component={ChannelDetailScreen}
        options={{
          headerShown: true,
          title: t('HEADER.CHANNEL_DETAILS'),
        }}
      />
    </ChatStack.Navigator>
  );
};

export default ChatStackNavigator;
