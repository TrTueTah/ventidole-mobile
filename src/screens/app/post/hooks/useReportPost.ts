import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { components } from '@/schemas/openapi';
import { useCallback, useContext } from 'react';

type CreatePostReportDto = components['schemas']['CreatePostReportDto'];
type PostReportDto = components['schemas']['PostReportDto'];

interface UseReportPostOptions {
  onSuccess?: (report: PostReportDto) => void;
  onError?: (error: Error) => void;
}

export const useReportPost = (options: UseReportPostOptions = {}) => {
  const backendApi = useContext(BackendApiContext);
  const { onSuccess, onError } = options;

  const {
    mutate: reportPostMutation,
    isPending: isReporting,
    error,
    data,
    reset,
  } = backendApi.useMutation('post', '/v1/user/posts/report', {
    onSuccess: response => {
      if (response.data) {
        onSuccess?.(response.data);
      }
    },
    onError: err => {
      console.error('Failed to report post:', err);
      onError?.(err);
    },
  });

  const reportPost = useCallback(
    (postId: string, reason?: string) => {
      if (!postId || typeof postId !== 'string') {
        console.error('Invalid postId:', postId);
        onError?.(new Error('Invalid postId'));
        return;
      }

      const body: CreatePostReportDto = {
        postId: postId.trim(),
        ...(reason?.trim() && { reason: reason.trim() }),
      };

      console.log('Reporting post with body:', body);

      reportPostMutation({
        body,
      });
    },
    [reportPostMutation, onError],
  );

  const reportPostAsync = useCallback(
    async (postId: string, reason?: string): Promise<PostReportDto> => {
      return new Promise<PostReportDto>((resolve, reject) => {
        if (!postId || typeof postId !== 'string') {
          const error = new Error('Invalid postId');
          console.error('Invalid postId:', postId);
          reject(error);
          return;
        }

        const body: CreatePostReportDto = {
          postId: postId.trim(),
          ...(reason?.trim() && { reason: reason.trim() }),
        };

        console.log('Reporting post async with body:', body);

        reportPostMutation(
          { body },
          {
            onSuccess: response => {
              if (response.data) {
                resolve(response.data);
              } else {
                reject(new Error('No data returned from report'));
              }
            },
            onError: err => {
              reject(err);
            },
          },
        );
      });
    },
    [reportPostMutation],
  );

  return {
    reportPost,
    reportPostAsync,
    isReporting,
    error,
    data: data?.data,
    reset,
  };
};
