import ChatListScreen from '@/screens/app/chat/ChatListScreen';
import ChatWindowScreen from '@/screens/app/chat/ChatWindowScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomScreenHeader from '../components/ScreenHeader';
import { chatListPath } from '../pathLocations';
import { ChatStackParamList } from '../types';

const ChatStack = createNativeStackNavigator<ChatStackParamList>();

const ChatStackNavigator = () => {
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
          title: 'Chat',
        }}
      />
    </ChatStack.Navigator>
  );
};

export default ChatStackNavigator;
