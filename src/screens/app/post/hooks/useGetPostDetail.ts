import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { components } from '@/schemas/openapi';
import { useCallback, useContext, useMemo } from 'react';

type PostDetailDto = components['schemas']['PostDetailDto'];

interface UseGetPostDetailParams {
  postId: string;
  enabled?: boolean;
}

export const useGetPostDetail = ({
  postId,
  enabled = true,
}: UseGetPostDetailParams) => {
  const backendApi = useContext(BackendApiContext);

  // Query for post detail
  const { data, isLoading, error, refetch } = backendApi.useQuery(
    'get',
    '/v1/user/posts/{id}',
    {
      params: {
        path: {
          id: postId,
        },
      },
    },
    {
      enabled: enabled && !!postId,
    },
  );

  // Extract post data from response
  const post = useMemo(() => {
    return (data?.data as PostDetailDto | undefined) ?? null;
  }, [data]);

  // Refresh callback
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    post,
    isLoading,
    error,
    refetch,
    refresh,
  };
};
