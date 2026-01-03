import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useCallback, useContext, useMemo } from 'react';
import { components } from 'src/schemas/openapi';

type UserProductDto = components['schemas']['UserProductDto'];

interface UseGetShopProductsParams {
  shopId: string;
  limit?: number;
}

export const useGetShopProducts = (params: UseGetShopProductsParams) => {
  const backendApi = useContext(BackendApiContext);

  const { shopId, limit = 20 } = params;

  // Build query params
  const baseQueryParams = useMemo(
    () => ({
      limit,
    }),
    [limit],
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
    '/v1/user/shop/{shopId}/products',
    {
      params: {
        path: { shopId },
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
          'currentPage' in pagingInfo &&
          'totalPages' in pagingInfo
        ) {
          const currentPage = pagingInfo.currentPage as number;
          const totalPages = pagingInfo.totalPages as number;
          return currentPage < totalPages ? currentPage + 1 : undefined;
        }
        return undefined;
      },
    },
  );

  // Flatten all pages into a single products array
  const products = useMemo(() => {
    const allProducts: UserProductDto[] = [];
    data?.pages.forEach((page: any) => {
      const pageProducts = (page?.data as UserProductDto[] | undefined) ?? [];
      allProducts.push(...pageProducts);
    });
    return allProducts;
  }, [data]);

  // Load more handler
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetching, fetchNextPage]);

  // Refresh handler
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const isLoadingMore = isFetching && !isLoading;

  return {
    products,
    isLoading,
    isLoadingMore,
    hasMore: hasNextPage,
    loadMore,
    refresh,
    error,
  };
};
