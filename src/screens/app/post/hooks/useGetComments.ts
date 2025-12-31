import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { components } from '@/schemas/openapi';
import { useCallback, useContext, useMemo } from 'react';

type CommentDto = components['schemas']['CommentDto'];

interface UseGetCommentsParams {
  postId: string;
  limit?: number;
}

export const useGetComments = (params: UseGetCommentsParams) => {
  const backendApi = useContext(BackendApiContext);

  const { postId, limit = 20 } = params;

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
    '/v1/user/comment/{postId}',
    {
      params: {
        path: { postId },
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
      enabled: !!postId,
    },
  );

  // Flatten all pages into comments array
  const comments = useMemo(() => {
    if (!data?.pages) {
      return [];
    }

    const allComments = data.pages.flatMap((page: any) => {
      return page.data || [];
    });
    return allComments as CommentDto[];
  }, [data]);

  // Load more comments (for infinite scroll)
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetching, fetchNextPage]);

  // Refresh comments (pull to refresh)
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Get total comments count from first page
  const totalComments = useMemo(() => {
    return data?.pages?.[0]?.paging?.total ?? 0;
  }, [data]);

  return {
    comments,
    isLoading,
    isLoadingMore: isFetching && !isLoading,
    error,
    hasMore: hasNextPage ?? false,
    loadMore,
    refresh,
    refetch,
    totalComments,
  };
};
