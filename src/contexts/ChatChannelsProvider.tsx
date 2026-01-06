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
        { client: !!client, userId: user?.id, clientUserID: client?.userID },
      );
      setIsLoading(false);
      setIsFetching(false);
      return;
    }

    // CRITICAL: Verify that client.userID matches current user.id
    if (client.userID !== user.id) {
      console.log(
        '[ChatChannelsProvider] Client user mismatch! Waiting for client to reconnect...',
        { clientUserID: client.userID, expectedUserId: user.id },
      );
      setIsLoading(false);
      setIsFetching(false);
      return;
    }

    try {
      setIsFetching(true);
      console.log('[ChatChannelsProvider] Fetching channels from GetStream...');
      console.log('[ChatChannelsProvider] User ID:', user.id);
      console.log('[ChatChannelsProvider] Client User ID:', client.userID);

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
      'currentUserIdRef:',
      currentUserIdRef.current,
    );

    if (!client || !user?.id || !client.userID) {
      console.log('[ChatChannelsProvider] Waiting for client/user...');
      console.log('[ChatChannelsProvider] - client:', !!client);
      console.log('[ChatChannelsProvider] - user.id:', user?.id);
      console.log('[ChatChannelsProvider] - client.userID:', client?.userID);
      return;
    }

    // CRITICAL: Verify client.userID matches current user.id
    if (client.userID !== user.id) {
      console.log(
        '[ChatChannelsProvider] User ID mismatch! Waiting for client to reconnect with new user...',
        { clientUserID: client.userID, expectedUserId: user.id },
      );
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
  }, [client, user?.id, client?.userID, fetchChannelsFromStream]);

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
      console.log('[ChatChannelsProvider] updateChannelInState called:', {
        channelId,
        moveToTop,
      });

      // Extract clean ID from cid format (messaging:xxx -> xxx)
      const cleanId = channelId.replace('messaging:', '');

      setChannels(prev => {
        console.log(
          '[ChatChannelsProvider] Current channels count:',
          prev.length,
        );

        // Find channel by comparing both id and cid
        const channelIndex = prev.findIndex(ch => {
          const chId = ch.id || ch.cid?.replace('messaging:', '');
          const chCid = ch.cid;
          return (
            chId === cleanId ||
            chCid === channelId ||
            ch.id === channelId ||
            ch.cid === channelId
          );
        });

        console.log(
          '[ChatChannelsProvider] Channel found at index:',
          channelIndex,
        );

        if (channelIndex === -1) {
          console.log(
            '[ChatChannelsProvider] Channel not in list, fetching all channels...',
          );
          // Channel not in list - refetch to get it
          fetchChannelsFromStream();
          return prev;
        }

        // Get the existing channel from the list
        const existingChannel = prev[channelIndex];

        // Create new array to trigger re-render
        const newChannels = [...prev];

        if (moveToTop) {
          // Move to top (for new messages)
          console.log('[ChatChannelsProvider] Moving channel to top:', cleanId);
          newChannels.splice(channelIndex, 1);
          newChannels.unshift(existingChannel);
        } else {
          // Update in place (for read events)
          console.log(
            '[ChatChannelsProvider] Updating channel in place:',
            cleanId,
          );
          newChannels[channelIndex] = existingChannel;
        }

        return newChannels;
      });
    };

    // Handle new message - move channel to top
    const handleMessageNew = async (event: any) => {
      const channelId = event?.cid || event?.channel?.cid || event?.channel?.id;
      console.log('[ChatChannelsProvider] message.new event received:', {
        channelId,
        eventCid: event?.cid,
        channelCid: event?.channel?.cid,
        channelId: event?.channel?.id,
      });
      if (channelId) {
        updateChannelInState(channelId, true);
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
        updateChannelInState(channelId, false);
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
      const channelId = event?.channel?.id || event?.channel?.cid || event?.cid;
      if (channelId) {
        console.log(
          '[ChatChannelsProvider] notification.channel_deleted event:',
          channelId,
        );

        // Extract clean ID from cid format (messaging:xxx -> xxx)
        const cleanId = channelId.replace('messaging:', '');

        setChannels(prev => {
          const filtered = prev.filter(ch => {
            const chId = ch.id || ch.cid?.replace('messaging:', '');
            const chCid = ch.cid;
            // Filter out if any match
            return (
              chId !== cleanId &&
              chId !== channelId &&
              chCid !== channelId &&
              ch.id !== channelId &&
              ch.cid !== channelId
            );
          });

          console.log(
            '[ChatChannelsProvider] Channels after deletion:',
            filtered.length,
            'from',
            prev.length,
          );

          return filtered;
        });
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
