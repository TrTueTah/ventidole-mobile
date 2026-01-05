import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { useCallback, useState } from 'react';
import { useChatContext } from 'stream-chat-react-native';

export const useJoinChannel = () => {
  const { client } = useChatContext();
  const { user } = useGetCurrentUser();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinChannel = useCallback(
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
        setIsJoining(true);
        setError(null);

        const channelId = params.path.channelId.replace('messaging:', '');
        const channel = client.channel('messaging', channelId);

        // Add user as member (readonly by default as per BACKEND_CHAT_TODO.md)
        await channel.addMembers([
          { user_id: user.id, channel_role: 'channel_member' },
        ]);

        console.log('Joined channel successfully:', channelId);
        callbacks?.onSuccess?.({ channelId });
      } catch (err: any) {
        console.error('Error joining channel:', err);
        setError('Failed to join channel');
        callbacks?.onError?.(err);
      } finally {
        setIsJoining(false);
      }
    },
    [client, user?.id],
  );

  return {
    joinChannel,
    isJoining,
    error,
    variables: null,
  };
};
