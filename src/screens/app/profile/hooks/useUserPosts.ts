import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { components } from '@/schemas/openapi';
import { useContext, useMemo } from 'react';

type PostDto = components['schemas']['PostDto'];

interface UseUserPostsOptions {
  userId: string;
  page?: number;
  limit?: number;
}

export const useUserPosts = ({
  userId,
  page = 1,
  limit = 10,
}: UseUserPostsOptions) => {
  const backendApi = useContext(BackendApiContext);

  const { data, isLoading, error, refetch } = backendApi.useQuery(
    'get',
    '/v1/user/posts/user/{userId}',
    {
      params: {
        path: {
          userId,
        },
        query: {
          page,
          limit,
        },
      },
    },
  );

  const posts = useMemo(() => {
    return (data?.data as PostDto[] | undefined) ?? [];
  }, [data]);

  return {
    posts,
    isLoading,
    error,
    refetch,
  };
};
