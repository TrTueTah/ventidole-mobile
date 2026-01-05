import ChatListScreen from '@/screens/app/chat/ChatListScreen';
import ChatWindowScreen from '@/screens/app/chat/ChatWindowScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { chatListPath } from '../pathLocations';
import { ChatStackParamList } from '../types';

const ChatStack = createNativeStackNavigator<ChatStackParamList>();

const ChatStackNavigator = () => {
  return (
    <ChatStack.Navigator initialRouteName={chatListPath}>
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
