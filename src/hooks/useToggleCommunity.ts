import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { toast } from '@/components/ui/ToastProvider';
import { ChatChannelsContext } from '@/contexts/ChatChannelsContext';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useContext } from 'react';

interface UseToggleCommunityOptions {
  onSuccess?: (isJoined: boolean) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export const useToggleCommunity = (options: UseToggleCommunityOptions = {}) => {
  const backendApi = useContext(BackendApiContext);
  const queryClient = useQueryClient();
  const chatChannelsContext = useContext(ChatChannelsContext);
  const { onSuccess, onError, successMessage, errorMessage } = options;

  const { mutate: joinMutation, isPending: isJoining } = backendApi.useMutation(
    'post',
    '/v1/user/community/{id}/join',
    {
      onSuccess: (_data, variables) => {
        const communityId = variables.params?.path?.id;

        // Optimistically update the community detail cache
        if (communityId) {
          const queryKey = [
            'get',
            '/v1/user/community/{id}',
            { params: { path: { id: communityId } } },
          ];

          queryClient.setQueryData(queryKey, (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              data: {
                ...oldData.data,
                isJoined: true,
                totalMember: (oldData.data?.totalMember || 0) + 1,
              },
            };
          });
        }

        // Mark queries as stale without triggering immediate refetch (prevents AbortError)
        queryClient.invalidateQueries({
          queryKey: ['get', '/v1/user/community'],
          refetchType: 'none',
        });
        queryClient.invalidateQueries({
          queryKey: ['get', '/v1/user/community/joined'],
          refetchType: 'none',
        });

        // Refetch chat channels to show the new community channel (only if context is available)
        chatChannelsContext?.refetch?.();

        toast.success(successMessage || 'Joined community successfully!');
        onSuccess?.(true);
      },
      onError: err => {
        // Ignore AbortError as it's expected when component unmounts
        if (err?.name === 'AbortError') {
          return;
        }
        toast.error(
          errorMessage || 'Failed to join community. Please try again.',
        );
        onError?.(err);
      },
    },
  );

  const { mutate: leaveMutation, isPending: isLeaving } =
    backendApi.useMutation('delete', '/v1/user/community/{id}/leave', {
      onSuccess: (_data, variables) => {
        const communityId = variables.params?.path?.id;

        // Optimistically update the community detail cache
        if (communityId) {
          const queryKey = [
            'get',
            '/v1/user/community/{id}',
            { params: { path: { id: communityId } } },
          ];

          queryClient.setQueryData(queryKey, (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              data: {
                ...oldData.data,
                isJoined: false,
                totalMember: Math.max((oldData.data?.totalMember || 0) - 1, 0),
              },
            };
          });
        }

        // Mark queries as stale without triggering immediate refetch (prevents AbortError)
        queryClient.invalidateQueries({
          queryKey: ['get', '/v1/user/community'],
          refetchType: 'none',
        });
        queryClient.invalidateQueries({
          queryKey: ['get', '/v1/user/community/joined'],
          refetchType: 'none',
        });

        // Refetch chat channels to update the chat list (only if context is available)
        chatChannelsContext?.refetch?.();

        toast.success('Left community successfully!');
        onSuccess?.(false);
      },
      onError: err => {
        // Ignore AbortError as it's expected when component unmounts
        if (err?.name === 'AbortError') {
          return;
        }
        toast.error('Failed to leave community. Please try again.');
        onError?.(err);
      },
    });

  const joinCommunity = useCallback(
    (communityId: string) => {
      joinMutation({
        params: {
          path: { id: communityId },
        },
      });
    },
    [joinMutation],
  );

  const leaveCommunity = useCallback(
    (communityId: string) => {
      leaveMutation({
        params: {
          path: { id: communityId },
        },
      });
    },
    [leaveMutation],
  );

  const toggleCommunity = useCallback(
    (communityId: string, isCurrentlyJoined: boolean) => {
      if (isCurrentlyJoined) {
        leaveCommunity(communityId);
      } else {
        joinCommunity(communityId);
      }
    },
    [joinCommunity, leaveCommunity],
  );

  return {
    joinCommunity,
    leaveCommunity,
    toggleCommunity,
    isJoining,
    isLeaving,
    isLoading: isJoining || isLeaving,
  };
};
