import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useContext } from 'react';

interface UseToggleCommunityOptions {
  onSuccess?: (isJoined: boolean) => void;
  onError?: (error: Error) => void;
}

export const useToggleCommunity = (options: UseToggleCommunityOptions = {}) => {
  const backendApi = useContext(BackendApiContext);
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const { onSuccess, onError } = options;

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

        // Invalidate other community queries to refresh data
        queryClient.invalidateQueries({
          queryKey: ['get', '/v1/user/community'],
        });
        queryClient.invalidateQueries({
          queryKey: ['get', '/v1/user/community/joined'],
        });
        showSuccess('Joined community successfully!');
        onSuccess?.(true);
      },
      onError: err => {
        showError('Failed to join community. Please try again.');
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

        // Invalidate other community queries to refresh data
        queryClient.invalidateQueries({
          queryKey: ['get', '/v1/user/community'],
        });
        queryClient.invalidateQueries({
          queryKey: ['get', '/v1/user/community/joined'],
        });
        showSuccess('Left community successfully!');
        onSuccess?.(false);
      },
      onError: err => {
        showError('Failed to leave community. Please try again.');
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
