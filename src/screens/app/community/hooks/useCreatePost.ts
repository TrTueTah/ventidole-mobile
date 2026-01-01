import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useContext } from 'react';
import { components } from 'src/schemas/openapi';

type CreatePostRequest = components['schemas']['CreatePostDto'];
type CreatePostResponse = components['schemas']['PostDto'];

interface UseCreatePostOptions {
  onSuccess?: (response: CreatePostResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreatePost = (options: UseCreatePostOptions = {}) => {
  const backendApi = useContext(BackendApiContext);
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  const {
    mutate: createPost,
    isPending: isCreating,
    error,
    data,
    reset,
  } = backendApi.useMutation('post', '/v1/user/posts', {
    onSuccess: response => {
      // Invalidate posts cache to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['get', '/v1/user/posts'],
      });

      if (response.data) {
        onSuccess?.(response.data);
      }
    },
    onError: err => {
      onError?.(err);
    },
  });

  const submitPost = useCallback(
    (postData: CreatePostRequest) => {
      createPost({
        body: postData,
      });
    },
    [createPost],
  );

  return {
    createPost: submitPost,
    isCreating,
    error,
    data: data?.data,
    reset,
  };
};
