import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { components } from '@/schemas/openapi';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useContext, useMemo } from 'react';

type PostDto = components['schemas']['PostDto'];

interface UseCommunityPostsParams {
  communityId?: string;
  limit?: number;
  enabled?: boolean;
  authorFilter?: 'all' | 'idol' | 'fan';
}

export const useCommunityPosts = (params: UseCommunityPostsParams) => {
  const backendApi = useContext(BackendApiContext);
  const queryClient = useQueryClient();

  const { communityId, limit = 20, enabled = true, authorFilter } = params;

  // Build query params
  const baseQueryParams = useMemo(() => {
    const params: Record<string, any> = {
      limit,
    };

    if (authorFilter && authorFilter !== 'all') {
      params.filter = authorFilter.toUpperCase();
    }

    if (communityId) {
      params.communityId = communityId;
    }

    return params;
  }, [limit, authorFilter, communityId]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = backendApi.useInfiniteQuery(
    'get',
    '/v1/user/posts',
    {
      params: {
        query: baseQueryParams,
      },
    },
    {
      enabled: enabled && !!communityId,
      initialPageParam: 1,
      pageParamName: 'page',
      getNextPageParam: (lastPage: any) => {
        const pagingInfo = lastPage?.paging;
        if (
          pagingInfo &&
          typeof pagingInfo === 'object' &&
          'totalPages' in pagingInfo &&
          'page' in pagingInfo
        ) {
          const nextPage = pagingInfo.page + 1;
          return nextPage <= pagingInfo.totalPages ? nextPage : undefined;
        }
        return undefined;
      },
    },
  );

  // Flatten all pages into posts array
  const posts = useMemo(() => {
    if (!data?.pages) {
      return [];
    }

    return data.pages.flatMap((page: any) => page.data || []);
  }, [data]);

  // Load more posts
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetching, fetchNextPage]);

  // Refresh posts
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Invalidate query to force refresh
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['get', '/v1/user/posts'],
    });
  }, [queryClient]);

  return {
    posts,
    isLoading,
    isLoadingMore: isFetching && !isLoading,
    isRefreshing: isRefetching,
    error,
    hasMore: hasNextPage,
    loadMore,
    refresh,
    invalidate,
  };
};
