import { AppText, Icon } from '@/components/ui';
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { ChatStackParamList } from '@/navigation/types';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Channel as StreamChannel } from 'stream-chat';
import {
  Channel,
  MessageInput,
  MessageList,
  useChatContext,
} from 'stream-chat-react-native';
import ChannelDetailModal, {
  ChannelDetailModalRef,
} from './components/ChannelDetailModal';

type ChatWindowRouteProp = RouteProp<ChatStackParamList, 'ChatWindow'>;
type ChatWindowNavigationProp = NativeStackNavigationProp<
  ChatStackParamList,
  'ChatWindow'
>;

const ChatWindowScreen = () => {
  const route = useRoute<ChatWindowRouteProp>();
  const navigation = useNavigation<ChatWindowNavigationProp>();
  const { channelId } = route.params;
  const { client } = useChatContext();
  const insets = useSafeAreaInsets();
  const { user } = useGetCurrentUser();
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelDetailModalRef = useRef<ChannelDetailModalRef>(null);
  const currentUserIdRef = useRef<string | null>(null);

  // Reset channel when user changes
  useEffect(() => {
    if (user?.id && currentUserIdRef.current !== user.id) {
      console.log('[ChatWindowScreen] User changed, resetting channel...');
      setChannel(null);
      setIsLoading(true);
      setError(null);
      currentUserIdRef.current = user.id;
    } else if (!user?.id && currentUserIdRef.current) {
      console.log('[ChatWindowScreen] User logged out, clearing channel...');
      setChannel(null);
      setIsLoading(true);
      setError(null);
      currentUserIdRef.current = null;
    }
  }, [user?.id]);

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

  // Update header title and right button
  useLayoutEffect(() => {
    if (channel) {
      const channelName =
        (channel.data as any)?.name || channel.data?.name || 'Channel';

      navigation.setOptions({
        title: channelName,
        headerRight: () => (
          <TouchableOpacity
            onPress={() => channelDetailModalRef.current?.open(channel)}
            style={{ padding: 8, marginRight: -8 }}
          >
            <Icon name="Info" className="w-6 h-6 text-foreground" />
          </TouchableOpacity>
        ),
      });
    }
  }, [channel, navigation]);

  const handleChannelLeft = () => {
    navigation.goBack();
  };

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

  // Check user's channel role to determine if they can send messages
  const currentMember = channel.state?.members?.[user?.id || ''];
  const channelRole = currentMember?.channel_role;
  const canSendMessages =
    channelRole === 'moderator_member' || channelRole === 'trusted_member';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-background mb-safe-offset-0">
        <Channel channel={channel}>
          <MessageList />
          {canSendMessages ? (
            <MessageInput />
          ) : (
            <View className="px-4 py-3 bg-muted/20 border-t border-neutrals900">
              <AppText
                variant="bodySmall"
                color="muted"
                className="text-center"
              >
                You can only view messages in this channel
              </AppText>
            </View>
          )}
        </Channel>

        {/* Channel Detail Modal */}
        <ChannelDetailModal
          ref={channelDetailModalRef}
          onChannelLeft={handleChannelLeft}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatWindowScreen;
