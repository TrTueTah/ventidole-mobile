import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useCallback, useContext, useMemo } from 'react';

interface UseCommunitiesListParams {
  limit?: number;
  search?: string;
  type?: 'ALL' | 'SOLO' | 'GROUP';
}

export const useGetCommunitiesList = (
  params: UseCommunitiesListParams = {},
) => {
  const backendApi = useContext(BackendApiContext);

  const { limit = 20, search, type } = params;

  // Build query params
  const baseQueryParams = useMemo(() => {
    const params: any = { limit };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    if (type && type !== 'ALL') {
      params.type = type;
    }
    return params;
  }, [limit, search, type]);

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
    '/user/community',
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

  // Flatten all pages into communities array
  const communities = useMemo(() => {
    if (!data?.pages) {
      return [];
    }

    const allCommunities = data.pages.flatMap((page: any) => {
      return page.data || [];
    });
    return allCommunities;
  }, [data]);

  // Load more communities
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetching, fetchNextPage]);

  // Refresh communities
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    communities,
    isLoading,
    isLoadingMore: isFetching && !isLoading,
    isRefreshing: isRefetching,
    error,
    hasMore: hasNextPage,
    loadMore,
    refresh,
  };
};
