import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { useContext } from 'react';

interface CreateChannelInput {
  name: string;
  description?: string;
  image?: string;
  type?: string;
}

interface CreateChannelCallbacks {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useCreateChannel = () => {
  const backendApi = useContext(BackendApiContext);
  const { user } = useGetCurrentUser();

  const createIdolChannelMutation = backendApi.useMutation(
    'post',
    '/v1/stream-chat/channels/idol',
  );

  const createChannel = (
    input: CreateChannelInput,
    callbacks?: CreateChannelCallbacks,
  ) => {
    if (user?.role !== 'IDOL') {
      callbacks?.onError?.({
        message: 'Only idols can create channels',
      });
      return;
    }

    createIdolChannelMutation.mutate(
      {
        body: {
          name: input.name,
          description: input.description,
          image: input.image,
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

  const isCreating = createIdolChannelMutation.isPending;
  const error = createIdolChannelMutation.error;
  const data = createIdolChannelMutation.data;

  return {
    createChannel,
    isCreating,
    error: error ? 'Failed to create channel' : null,
    channelData: data?.data,
  };
};
