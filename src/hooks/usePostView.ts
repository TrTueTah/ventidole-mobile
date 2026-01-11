import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useCallback, useContext, useRef } from 'react';

interface UsePostViewOptions {
  onSuccess?: (postId: string) => void;
  onError?: (error: Error) => void;
}

export const usePostView = (options: UsePostViewOptions = {}) => {
  const backendApi = useContext(BackendApiContext);
  const { onSuccess, onError } = options;

  // Track which posts have been viewed in this session to prevent duplicate tracking
  const viewedPostsRef = useRef<Set<string>>(new Set());

  const { mutate: viewPostMutation } = backendApi.useMutation(
    'post',
    '/v1/user/posts/{id}/view',
    {
      onSuccess: (_, variables) => {
        onSuccess?.(variables.params.path.id);
      },
      onError: err => {
        console.error('Failed to track post view:', err);
        onError?.(err);
      },
    },
  );

  const trackPostView = useCallback(
    (postId: string) => {
      // Skip if already viewed in this session
      if (viewedPostsRef.current.has(postId)) {
        return;
      }

      // Mark as viewed
      viewedPostsRef.current.add(postId);

      // Fire-and-forget API call to track the view
      viewPostMutation({
        params: {
          path: {
            id: postId,
          },
        },
      });
    },
    [viewPostMutation],
  );

  const clearViewHistory = useCallback(() => {
    viewedPostsRef.current.clear();
  }, []);

  return {
    trackPostView,
    clearViewHistory,
  };
};
