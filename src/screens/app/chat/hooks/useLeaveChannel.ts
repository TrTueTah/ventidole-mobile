import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { useCallback, useState } from 'react';
import { useChatContext } from 'stream-chat-react-native';

export const useLeaveChannel = () => {
  const { client } = useChatContext();
  const { user } = useGetCurrentUser();
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leaveChannel = useCallback(
    async (
      { params }: { params: { path: { channelId: string } } },
      callbacks?: {
        onSuccess?: (data: any) => void;
        onError?: (error: any) => void;
      },
    ) => {
      if (!client || !user?.id) {
        const err = 'Client not connected or user not authenticated';
        setError(err);
        callbacks?.onError?.(new Error(err));
        return;
      }

      try {
        setIsLeaving(true);
        setError(null);

        const channelId = params.path.channelId.replace('messaging:', '');
        const channel = client.channel('messaging', channelId);

        // Remove user from channel
        await channel.removeMembers([user.id]);

        console.log('Left channel successfully:', channelId);
        callbacks?.onSuccess?.({ channelId });
      } catch (err: any) {
        console.error('Error leaving channel:', err);
        setError('Failed to leave channel');
        callbacks?.onError?.(err);
      } finally {
        setIsLeaving(false);
      }
    },
    [client, user?.id],
  );

  return {
    leaveChannel,
    isLeaving,
    error,
    variables: null,
  };
};
