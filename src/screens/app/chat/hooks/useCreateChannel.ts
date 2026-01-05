import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { useContext } from 'react';

interface CreateChannelInput {
  name: string;
  description?: string;
  image?: string;
  communityId?: string;
  isCommunityChannel?: boolean;
}

interface CreateChannelCallbacks {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useCreateChannel = () => {
  const backendApi = useContext(BackendApiContext);
  const { user } = useGetCurrentUser();

  // Determine which endpoint to use based on channel type
  const createCommunityChannelMutation = backendApi.useMutation(
    'post',
    '/v1/stream-chat/channels/community',
  );

  const createIdolChannelMutation = backendApi.useMutation(
    'post',
    '/v1/stream-chat/channels/idol',
  );

  const createChannel = (
    input: CreateChannelInput,
    callbacks?: CreateChannelCallbacks,
  ) => {
    const isAdmin = user?.role === 'ADMIN';
    const isCommunityChannel = input.isCommunityChannel === true;

    // Use appropriate mutation based on channel type
    const mutation = isCommunityChannel
      ? createCommunityChannelMutation
      : createIdolChannelMutation;

    if (isCommunityChannel && !isAdmin) {
      callbacks?.onError?.({
        message: 'Only admins can create community channels',
      });
      return;
    }

    if (!isCommunityChannel && user?.role !== 'IDOL') {
      callbacks?.onError?.({
        message: 'Only idols can create idol channels',
      });
      return;
    }

    mutation.mutate(
      {
        body: {
          name: input.name,
          description: input.description,
          image: input.image,
          ...(isCommunityChannel && input.communityId
            ? { communityId: input.communityId }
            : {}),
        },
      } as any,
      {
        onSuccess: response => {
          console.log('Channel created successfully:', response.data);
          callbacks?.onSuccess?.(response.data);
        },
        onError: (error: any) => {
          console.error('Error creating channel:', error);
          callbacks?.onError?.(error);
        },
      },
    );
  };

  const isCreating =
    createCommunityChannelMutation.isPending ||
    createIdolChannelMutation.isPending;
  const error =
    createCommunityChannelMutation.error || createIdolChannelMutation.error;
  const data =
    createCommunityChannelMutation.data || createIdolChannelMutation.data;

  return {
    createChannel,
    isCreating,
    error: error ? 'Failed to create channel' : null,
    channelData: data?.data,
  };
};
