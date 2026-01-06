import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { useCallback, useEffect, useState } from 'react';
import { Channel } from 'stream-chat';
import { useChatContext } from 'stream-chat-react-native';

interface UseGetAllChannelsOptions {
  limit?: number;
  search?: string;
}

export const useGetAllChannels = ({
  limit = 20,
  search = '',
}: UseGetAllChannelsOptions = {}) => {
  const { client } = useChatContext();
  const { user } = useGetCurrentUser();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      if (!client || !user?.id || !client.userID) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Query all discoverable channels
        const filter = {
          // discoverable: true,
          member: { $in: ['admin'] },
          ...(search.trim() && { name: { $autocomplete: search } }),
        };
        const sort = [{ member_count: -1 as const }];
        const channelsResponse = await client.queryChannels(filter, sort, {
          watch: false,
          state: true,
          limit,
        });

        setChannels(channelsResponse);
      } catch (err) {
        console.error('[useGetAllChannels] Error fetching channels:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, [client, user?.id, search, limit]);

  const loadMore = useCallback(() => {
    // Pagination can be implemented here if needed
  }, []);

  const refresh = useCallback(async () => {
    // Re-run the effect by updating state
    setIsLoading(true);
  }, []);

  return {
    channels,
    isLoading,
    isLoadingMore: false,
    hasMore: false,
    loadMore,
    refresh,
  };
};
