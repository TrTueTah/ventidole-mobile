import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { ChatChannelsContext } from '@/contexts/ChatChannelsContext';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useContext, useState } from 'react';

interface LeaveChannelCallbacks {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useLeaveChannel = () => {
  const backendApi = useContext(BackendApiContext);
  const chatChannelsContext = useContext(ChatChannelsContext);
  const queryClient = useQueryClient();
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: leaveCommunityMutation } = backendApi.useMutation(
    'delete',
    '/v1/user/community/{id}/leave',
  );

  const leaveChannel = useCallback(
    async (communityId: string, callbacks?: LeaveChannelCallbacks) => {
      if (!communityId) {
        const err = 'Community ID is required';
        setError(err);
        callbacks?.onError?.(new Error(err));
        return;
      }

      try {
        setIsLeaving(true);
        setError(null);

        await leaveCommunityMutation({
          params: {
            path: { id: communityId },
          },
        });

        console.log('Left community successfully:', communityId);

        // Invalidate community queries to refetch data
        queryClient.invalidateQueries({
          queryKey: ['get', '/v1/user/community'],
        });
        queryClient.invalidateQueries({
          queryKey: ['get', '/v1/user/community/joined'],
        });

        // Refetch chat channels to update the list
        chatChannelsContext?.refetch?.();

        callbacks?.onSuccess?.({ communityId });
      } catch (err: any) {
        console.error('Error leaving community:', err);
        setError('Failed to leave community');
        callbacks?.onError?.(err);
      } finally {
        setIsLeaving(false);
      }
    },
    [leaveCommunityMutation, chatChannelsContext, queryClient],
  );

  return {
    leaveChannel,
    isLeaving,
    error,
  };
};
