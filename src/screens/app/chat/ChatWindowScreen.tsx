import { AppText } from '@/components/ui';
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { ChatStackParamList } from '@/navigation/types';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Channel as StreamChannel } from 'stream-chat';
import {
  Channel,
  MessageInput,
  MessageList,
  useChatContext,
} from 'stream-chat-react-native';

type ChatWindowRouteProp = RouteProp<ChatStackParamList, 'ChatWindow'>;

const ChatWindowScreen = () => {
  const route = useRoute<ChatWindowRouteProp>();
  const { channelId } = route.params;
  const { client } = useChatContext();
  const { user } = useGetCurrentUser();
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const MAX_RETRIES = 20; // 10 seconds total (20 * 500ms)

    const initChannel = async () => {
      // Wait for both client and user to be ready
      if (!client) {
        console.log('[ChatWindowScreen] Waiting for client...');
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          retryTimeout = setTimeout(initChannel, 500);
        } else {
          setError('Failed to connect to chat. Please try again.');
          setIsLoading(false);
        }
        return;
      }

      if (!user?.id) {
        console.log('[ChatWindowScreen] Waiting for user data...');
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          retryTimeout = setTimeout(initChannel, 500);
        } else {
          setError('User not authenticated. Please log in again.');
          setIsLoading(false);
        }
        return;
      }

      if (!client.userID || client.userID !== user.id) {
        console.log('[ChatWindowScreen] Waiting for client connection...', {
          clientUserId: client.userID,
          expectedUserId: user.id,
        });
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          retryTimeout = setTimeout(initChannel, 500);
        } else {
          setError('Connection timeout. Please go back and try again.');
          setIsLoading(false);
        }
        return;
      }

      try {
        const cleanId = channelId.replace('messaging:', '');
        console.log('[ChatWindowScreen] Initializing channel:', cleanId);

        const channelInstance = client.channel('messaging', cleanId);

        // Watch the channel to fetch messages and subscribe to events
        await channelInstance.watch({
          state: true,
          presence: true,
        });

        // Query messages separately to ensure they load
        await channelInstance.query({
          messages: { limit: 30 },
          state: true,
        });

        console.log('[ChatWindowScreen] Channel loaded:', channelInstance.id);
        console.log(
          '[ChatWindowScreen] Messages count:',
          channelInstance.state.messages.length,
        );
        console.log('[ChatWindowScreen] Channel state:', {
          members: Object.keys(channelInstance.state.members || {}).length,
          watchers: Object.keys(channelInstance.state.watchers || {}).length,
        });

        if (isMounted) {
          setChannel(channelInstance);
          setIsLoading(false);
          setError(null);
        }
      } catch (error) {
        console.error('[ChatWindowScreen] Error loading channel:', error);
        if (isMounted) {
          setError('Failed to load channel. Please try again.');
          setIsLoading(false);
        }
      }
    };

    initChannel();

    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [client, channelId, user?.id]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
        <AppText variant="bodySmall" color="muted" className="mt-4">
          Connecting to chat...
        </AppText>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <AppText variant="body" className="text-center mb-4">
          {error}
        </AppText>
      </View>
    );
  }

  if (!channel) {
    return null;
  }

  return (
    <View className="flex-1 bg-background">
      <Channel channel={channel}>
        <MessageList />
        <MessageInput />
      </Channel>
    </View>
  );
};

export default ChatWindowScreen;
