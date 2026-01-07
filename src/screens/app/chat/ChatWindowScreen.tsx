import { AppButton, AppText, Icon } from '@/components/ui';
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { useToggleCommunity } from '@/hooks/useToggleCommunity';
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
  const { joinCommunity } = useToggleCommunity({
    successMessage: 'Joined chat channel successfully!',
    errorMessage: 'Failed to join chat channel. Please try again.',
  });
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
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
          membership: channelInstance.state.membership,
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
      const membership = channel.state?.membership;
      const isMember = !!membership && Object.keys(membership).length > 0;

      navigation.setOptions({
        title: channelName,
        headerRight: isMember
          ? () => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ChannelDetail', { channelId })
                }
                style={{ padding: 8, marginRight: -8 }}
              >
                <Icon name="Info" className="w-6 h-6 text-foreground" />
              </TouchableOpacity>
            )
          : undefined,
      });
    }
  }, [channel, navigation, user?.id, channelId]);

  const handleChannelLeft = () => {
    navigation.goBack();
  };

  const handleJoinChannel = async () => {
    if (!channel || !user?.id || !client) return;

    setIsJoining(true);
    try {
      // Join the community which will also handle adding user to the channel on backend
      const communityId = (channel.data as any)?.id;
      if (communityId) {
        // Remove the "community_" prefix if it exists
        const cleanCommunityId = communityId.replace(/^community_/, '');

        // Join community (backend handles channel membership)
        joinCommunity(cleanCommunityId);

        // Poll for membership with retries
        const cleanId = channelId.replace('messaging:', '');
        let freshChannel;
        let retries = 0;
        const maxRetries = 10;

        while (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500));

          freshChannel = client.channel('messaging', cleanId);

          await freshChannel.watch({
            state: true,
            presence: true,
          });

          await freshChannel.query({
            messages: { limit: 30 },
            state: true,
          });

          console.log('[ChatWindowScreen] Checking membership after join:', {
            retry: retries + 1,
            hasMembership: !!freshChannel.state.membership,
            membershipKeys: Object.keys(freshChannel.state.membership || {})
              .length,
            members: Object.keys(freshChannel.state.members || {}).length,
          });

          // If membership exists and is not empty, break the loop
          if (
            freshChannel.state.membership &&
            Object.keys(freshChannel.state.membership).length > 0
          ) {
            console.log('[ChatWindowScreen] Membership confirmed!');
            setChannel(freshChannel);
            break;
          }

          retries++;
        }

        if (!freshChannel?.state.membership && retries >= maxRetries) {
          console.warn(
            '[ChatWindowScreen] Membership not confirmed after retries',
          );
          setError('Unable to confirm membership. Please try again.');
        }
      } else {
        setError('Community information not found.');
      }
      setIsJoining(false);
    } catch (error) {
      console.error('[ChatWindowScreen] Error joining channel:', error);
      setIsJoining(false);
      setError('Failed to join channel. Please try again.');
    }
  };

  const handleLeaveChannel = () => {
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
  const membership = channel.state?.membership;
  console.log('[ChatWindowScreen] User membership:', membership);
  const isMember = !!membership && Object.keys(membership).length > 0;
  const channelRole = membership?.channel_role;
  const canSendMessages =
    channelRole === 'moderator_member' || channelRole === 'trusted_member';

  // If user is not a member, show join/leave options
  if (!isMember) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Icon name="MessageCircle" className="w-16 h-16 text-muted mb-4" />
        <AppText variant="heading3" weight="bold" className="mb-2 text-center">
          {channel.data?.name || 'Channel'}
        </AppText>
        <AppText variant="body" color="muted" className="text-center mb-8">
          You are not a member of this channel. Join to see messages and
          participate in the conversation.
        </AppText>

        <View className="flex-row gap-3 w-full max-w-sm">
          <AppButton
            variant="outline"
            onPress={handleLeaveChannel}
            className="flex-1"
          >
            Cancel
          </AppButton>
          <AppButton
            variant="primary"
            onPress={handleJoinChannel}
            loading={isJoining}
            disabled={isJoining}
            className="flex-1"
          >
            Join Channel
          </AppButton>
        </View>
      </View>
    );
  }

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
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatWindowScreen;
