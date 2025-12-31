import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { components } from '@/schemas/openapi';
import { useCallback, useContext } from 'react';

type CreateCommentDto = components['schemas']['CreateCommentDto'];
type CommentDto = components['schemas']['CommentDto'];

interface CreateCommentParams {
  postId: string;
  content: string;
  parentId?: string;
}

interface UseCreateCommentOptions {
  onSuccess?: (comment: CommentDto) => void;
  onError?: (error: Error) => void;
}

export const useCreateComment = (options: UseCreateCommentOptions = {}) => {
  const backendApi = useContext(BackendApiContext);
  const { onSuccess, onError } = options;

  const {
    mutate: createCommentMutation,
    isPending: isCreating,
    error,
    data,
    reset,
  } = backendApi.useMutation('post', '/v1/user/comment/{postId}', {
    onSuccess: response => {
      if (response.data) {
        onSuccess?.(response.data);
      }
    },
    onError: err => {
      console.error('Failed to create comment:', err);
      onError?.(err);
    },
  });

  const createComment = useCallback(
    ({ postId, content, parentId }: CreateCommentParams) => {
      const body: CreateCommentDto = {
        content,
        ...(parentId && { parentId }),
      };

      createCommentMutation({
        params: {
          path: { postId },
        },
        body,
      });
    },
    [createCommentMutation],
  );

  return {
    createComment,
    isCreating,
    error,
    data: data?.data,
    reset,
  };
};
