import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useCallback, useContext, useMemo } from 'react';
import { components } from 'src/schemas/openapi';

type ShopDto = components['schemas']['ShopDto'];

interface UseGetShopsParams {
  limit?: number;
  search?: string;
}

export const useGetShops = (params: UseGetShopsParams = {}) => {
  const backendApi = useContext(BackendApiContext);

  const { limit = 20, search } = params;

  // Build query params
  const baseQueryParams = useMemo(
    () => ({
      limit,
      ...(search && { search }),
    }),
    [limit, search],
  );

  // Use openapi-react-query's useInfiniteQuery
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    error,
    refetch,
  } = backendApi.useInfiniteQuery(
    'get',
    '/v1/user/shop',
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
      enabled: true,
    },
  );

  // Flatten all pages into shops array
  const shops = useMemo(() => {
    if (!data?.pages) {
      return [];
    }

    const allShops = data.pages.flatMap((page: any) => {
      return page.data || [];
    });
    return allShops as ShopDto[];
  }, [data]);

  // Load more shops (for infinite scroll)
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetching, fetchNextPage]);

  // Refresh shops (pull to refresh)
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Get total shops count from first page
  const totalShops = useMemo(() => {
    return data?.pages?.[0]?.paging?.total ?? 0;
  }, [data]);

  return {
    shops,
    isLoading,
    isLoadingMore: isFetching && !isLoading,
    error,
    hasMore: hasNextPage ?? false,
    loadMore,
    refresh,
    refetch,
    totalShops,
  };
};
