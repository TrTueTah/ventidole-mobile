import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { components } from '@/schemas/openapi';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useContext } from 'react';

type UpdatePostDto = components['schemas']['UpdatePostDto'];

interface UseUpdatePostOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useUpdatePost = ({
  onSuccess,
  onError,
}: UseUpdatePostOptions = {}) => {
  const backendApi = useContext(BackendApiContext);
  const queryClient = useQueryClient();

  const { mutate: updatePostMutation, isPending: isUpdating } =
    backendApi.useMutation('patch', '/v1/user/posts/{id}', {
      onSuccess: (response, variables) => {
        // Invalidate the post detail query to refetch updated data
        const postId = variables.params?.path?.id;
        if (postId) {
          queryClient.invalidateQueries({
            queryKey: [
              'get',
              '/v1/user/posts/{id}',
              { params: { path: { id: postId } } },
            ],
          });
        }

        // Also invalidate posts list queries
        queryClient.invalidateQueries({
          queryKey: ['get', '/v1/user/posts'],
        });

        onSuccess?.();
      },
      onError: err => {
        console.error('Failed to update post:', err);
        onError?.(err);
      },
    });

  const updatePost = useCallback(
    (postId: string, data: UpdatePostDto) => {
      console.log('useUpdatePost - Updating post:', { postId, data });

      if (!postId || typeof postId !== 'string' || postId.trim() === '') {
        const error = 'postId should not be empty';
        console.error('useUpdatePost - Validation error:', error);
        onError?.(error);
        throw new Error(error);
      }

      updatePostMutation({
        params: {
          path: {
            id: postId,
          },
        },
        body: data,
      });
    },
    [updatePostMutation, onError],
  );

  const updatePostAsync = useCallback(
    async (
      postId: string,
      content?: string,
      mediaUrls?: string[],
      tags?: string[],
    ) => {
      const data: UpdatePostDto = {};

      if (content !== undefined) {
        data.content = content;
      }

      if (mediaUrls !== undefined) {
        data.mediaUrls = mediaUrls;
      }

      if (tags !== undefined) {
        data.tags = tags;
      }

      return new Promise((resolve, reject) => {
        try {
          updatePost(postId, data);
          // The mutation will call onSuccess or onError
          // For now, we'll resolve immediately
          resolve(true);
        } catch (error) {
          reject(error);
        }
      });
    },
    [updatePost],
  );

  return {
    updatePost,
    updatePostAsync,
    isUpdating,
  };
};
