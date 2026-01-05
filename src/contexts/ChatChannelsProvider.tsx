import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Channel as ChannelType } from 'stream-chat';
import { useChatContext } from 'stream-chat-react-native';
import {
  ChatChannelsContext,
  ChatChannelsContextValue,
} from './ChatChannelsContext';

interface ChatChannelsProviderProps extends PropsWithChildren {
  enableRealtimeListeners?: boolean;
}

export const ChatChannelsProvider: React.FC<ChatChannelsProviderProps> = ({
  children,
  enableRealtimeListeners = true,
}) => {
  const { client } = useChatContext();
  const { user } = useGetCurrentUser();

  console.log(
    '[ChatChannelsProvider] RENDER - client:',
    !!client,
    'user:',
    !!user,
    'user.id:',
    user?.id,
    'client.userID:',
    client?.userID,
  );

  const [channels, setChannels] = useState<ChannelType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<any>(null);
  const hasBootstrappedRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);

  // Clear channels when user changes
  useEffect(() => {
    if (user?.id && currentUserIdRef.current !== user.id) {
      console.log(
        '[ChatChannelsProvider] User changed, clearing old channels...',
      );
      setChannels([]);
      hasBootstrappedRef.current = false;
      currentUserIdRef.current = user.id;
    } else if (!user?.id && currentUserIdRef.current) {
      console.log(
        '[ChatChannelsProvider] User logged out, clearing all channels...',
      );
      setChannels([]);
      hasBootstrappedRef.current = false;
      currentUserIdRef.current = null;
    }
  }, [user?.id]);

  // Fetch channels from GetStream SDK directly
  const fetchChannelsFromStream = useCallback(async () => {
    if (!client || !user?.id || !client.userID) {
      console.log(
        '[ChatChannelsProvider] Cannot fetch: client or user not ready',
      );
      setIsLoading(false);
      setIsFetching(false);
      return;
    }

    try {
      setIsFetching(true);
      console.log('[ChatChannelsProvider] Fetching channels from GetStream...');
      console.log('[ChatChannelsProvider] User ID:', user.id);

      // Query channels where user is a member
      const filter = { members: { $in: [user.id] } };
      const sort = [{ last_message_at: -1 as const }];

      console.log(
        '[ChatChannelsProvider] Query filter:',
        JSON.stringify(filter),
      );

      const channelsResponse = await client.queryChannels(filter, sort, {
        watch: true,
        state: true,
      });

      console.log(
        '[ChatChannelsProvider] Fetched channels:',
        channelsResponse.length,
      );
      console.log(
        '[ChatChannelsProvider] Channel details:',
        channelsResponse.map(ch => ({
          id: ch.id,
          cid: ch.cid,
          type: ch.type,
          memberCount: Object.keys(ch.state?.members || {}).length,
          members: Object.keys(ch.state?.members || {}),
        })),
      );

      setChannels(channelsResponse);
      setError(null);
      hasBootstrappedRef.current = true;
    } catch (err: any) {
      console.error(
        '[ChatChannelsProvider] Error fetching channels from Stream:',
        err,
      );
      setError(err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [client, user?.id]);

  // Fetch channels on mount
  useEffect(() => {
    console.log(
      '[ChatChannelsProvider] useEffect triggered - client:',
      !!client,
      'user.id:',
      user?.id,
      'client.userID:',
      client?.userID,
      'hasBootstrapped:',
      hasBootstrappedRef.current,
    );

    if (!client || !user?.id || !client.userID) {
      console.log('[ChatChannelsProvider] Waiting for client/user...');
      console.log('[ChatChannelsProvider] - client:', !!client);
      console.log('[ChatChannelsProvider] - user.id:', user?.id);
      console.log('[ChatChannelsProvider] - client.userID:', client?.userID);
      return;
    }

    if (!hasBootstrappedRef.current) {
      console.log(
        '[ChatChannelsProvider] Bootstrapping - calling fetchChannelsFromStream...',
      );
      fetchChannelsFromStream();
    } else {
      console.log(
        '[ChatChannelsProvider] Already bootstrapped, skipping fetch',
      );
    }
  }, [client, user?.id, client?.userID]);

  // Real-time event handlers (GetStream events only - no queries)
  useEffect(() => {
    if (!client || !user?.id || !enableRealtimeListeners || !client.userID) {
      return;
    }

    console.log(
      '[ChatChannelsProvider] Attaching GetStream event listeners for real-time updates',
    );

    // Update channel in state when events occur
    const updateChannelInState = async (
      channelId: string,
      moveToTop: boolean = false,
    ) => {
      // Find existing channel or create new one
      const cleanId = channelId.replace('messaging:', '');
      const channel = client.channel('messaging', cleanId);

      // Query to get latest state
      try {
        await channel.query({
          messages: { limit: 1 },
          state: true,
        });
      } catch (error) {
        console.error('[ChatChannelsProvider] Error querying channel:', error);
        return;
      }

      setChannels(prev => {
        const channelIndex = prev.findIndex(
          ch => (ch.id || ch.cid) === channelId,
        );

        if (channelIndex === -1) {
          // New channel - add to top
          return [channel, ...prev];
        }

        // Create new array to trigger re-render
        const newChannels = [...prev];

        if (moveToTop) {
          // Move to top (for new messages)
          newChannels.splice(channelIndex, 1);
          newChannels.unshift(channel);
        } else {
          // Update in place (for read events)
          newChannels[channelIndex] = channel;
        }

        return newChannels;
      });
    };

    // Handle new message - move channel to top
    const handleMessageNew = async (event: any) => {
      const channelId = event?.cid || event?.channel?.cid || event?.channel?.id;
      if (channelId) {
        console.log('[ChatChannelsProvider] message.new event:', channelId);
        await updateChannelInState(channelId, true);
      }
    };

    // Handle message read - update unread count
    const handleNotificationMarkRead = async (event: any) => {
      const channelId = event?.cid || event?.channel?.cid || event?.channel?.id;
      if (channelId) {
        console.log(
          '[ChatChannelsProvider] notification.mark_read event:',
          channelId,
        );
        await updateChannelInState(channelId, false);
      }
    };

    // Handle added to channel - refetch from GetStream
    const handleAddedToChannel = () => {
      console.log('[ChatChannelsProvider] notification.added_to_channel event');
      // Refetch channels from GetStream
      fetchChannelsFromStream();
    };

    // Handle channel deleted - remove from state
    const handleChannelDeleted = (event: any) => {
      const channelId = event?.channel?.id || event?.channel?.cid;
      if (channelId) {
        console.log(
          '[ChatChannelsProvider] notification.channel_deleted event:',
          channelId,
        );
        setChannels(prev =>
          prev.filter(ch => ch.id !== channelId && ch.cid !== channelId),
        );
      }
    };

    // Attach event listeners
    client.on('message.new', handleMessageNew);
    client.on('notification.mark_read', handleNotificationMarkRead);
    client.on('notification.added_to_channel', handleAddedToChannel);
    client.on('notification.channel_deleted', handleChannelDeleted);

    return () => {
      // Detach event listeners
      client.off('message.new', handleMessageNew);
      client.off('notification.mark_read', handleNotificationMarkRead);
      client.off('notification.added_to_channel', handleAddedToChannel);
      client.off('notification.channel_deleted', handleChannelDeleted);
    };
  }, [client, user?.id, enableRealtimeListeners, fetchChannelsFromStream]);

  const refetch = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setIsFetching(true);
      }
      await fetchChannelsFromStream();
    },
    [fetchChannelsFromStream],
  );

  const contextValue: ChatChannelsContextValue = useMemo(
    () => ({
      channels,
      isLoading,
      isFetching,
      error,
      refetch,
    }),
    [channels, isLoading, isFetching, error, refetch],
  );

  return (
    <ChatChannelsContext.Provider value={contextValue}>
      {children}
    </ChatChannelsContext.Provider>
  );
};
