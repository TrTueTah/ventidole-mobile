import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useCallback, useContext, useMemo } from 'react';

interface UsePostsParams {
  limit?: number;
  communityId?: string;
  filter?: string;
}

export const useRecommendPosts = (params: UsePostsParams = {}) => {
  const backendApi = useContext(BackendApiContext);

  const { limit = 20, communityId, filter } = params;

  // Build query params
  const baseQueryParams = useMemo(() => {
    const params: any = {
      limit,
    };

    if (communityId !== undefined) params.communityId = communityId;
    if (filter !== undefined) params.filter = filter;

    return params;
  }, [limit, communityId, filter]);

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
    '/v1/user/posts/recommendations',
    {
      params: {
        query: baseQueryParams,
      },
    },
    {
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

    const allPosts = data.pages.flatMap((page: any) => {
      return page.data || [];
    });

    return allPosts;
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

  return {
    posts,
    isLoading,
    isLoadingMore: isFetching && !isLoading,
    isRefreshing: isRefetching,
    error,
    hasMore: hasNextPage,
    loadMore,
    refresh,
  };
};
