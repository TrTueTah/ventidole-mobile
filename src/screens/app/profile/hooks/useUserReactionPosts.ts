import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { components } from '@/schemas/openapi';
import { useContext, useMemo } from 'react';

type PostDto = components['schemas']['PostDto'];

interface UseUserReactionPostsOptions {
  userId: string;
  page?: number;
  limit?: number;
}

export const useUserReactionPosts = ({
  userId,
  page = 1,
  limit = 10,
}: UseUserReactionPostsOptions) => {
  const backendApi = useContext(BackendApiContext);

  const { data, isLoading, error, refetch } = backendApi.useQuery(
    'get',
    '/v1/user/posts/reactions/{userId}',
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

  const reactionPosts = useMemo(() => {
    return (data?.data as PostDto[] | undefined) ?? [];
  }, [data]);

  return {
    reactionPosts,
    isLoading,
    error,
    refetch,
  };
};
