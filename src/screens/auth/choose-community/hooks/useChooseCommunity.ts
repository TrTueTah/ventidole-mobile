import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useDebounce } from '@/hooks/useDebounce';
import { components } from '@/schemas/openapi';
import { useAuthStore } from '@/store/authStore';
import { useCallback, useContext, useMemo, useState } from 'react';

type BulkFollowRequest = components['schemas']['BulkFollowCommunitiesDto'];

interface UseChooseCommunityParams {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useChooseCommunity = ({
  onSuccess,
  onError,
}: UseChooseCommunityParams = {}) => {
  const { setIsLogin } = useAuthStore();
  const backendApi = useContext(BackendApiContext);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SOLO' | 'GROUP'>('ALL');

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Build query params
  const queryParams = useMemo(() => {
    const params: any = {
      limit: 20,
      search: debouncedSearchQuery || '',
    };
    if (typeFilter !== 'ALL') {
      params.type = typeFilter;
    }
    return params;
  }, [debouncedSearchQuery, typeFilter]);

  // Fetch communities with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    isRefetching,
  } = backendApi.useInfiniteQuery(
    'get',
    '/user/community',
    {
      params: {
        query: queryParams,
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
    return data.pages.flatMap((page: any) => page.data || []);
  }, [data]);

  // Bulk follow mutation
  const bulkFollowMutation = backendApi.useMutation(
    'post',
    '/user/community/follow/bulk',
    {
      onSuccess: () => {
        onSuccess?.();
        setIsLogin(true);
      },
      onError: (error: any) => {
        console.error('Bulk follow error:', error);
        onError?.(error);
      },
    },
  );

  const toggleCommunity = (communityId: string) => {
    setSelectedCommunities(prev => {
      if (prev.includes(communityId)) {
        return prev.filter(id => id !== communityId);
      }
      return [...prev, communityId];
    });
  };

  const handleBulkFollow = () => {
    bulkFollowMutation.mutate({
      body: {
        communityIds: selectedCommunities,
      } as BulkFollowRequest,
    });
  };

  // Load more communities
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetching, fetchNextPage]);

  return {
    communities,
    isLoading,
    isLoadingMore: isFetching && !isLoading,
    isRefreshing: isRefetching,
    hasMore: hasNextPage,
    selectedCommunities,
    toggleCommunity,
    handleBulkFollow,
    isFollowing: bulkFollowMutation.isPending,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    loadMore,
  };
};
