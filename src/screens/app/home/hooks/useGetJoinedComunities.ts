import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useCallback, useContext } from 'react';

interface UseCommunitiesParams {
  limit?: number;
}

export const useGetJoinedCommunities = (params: UseCommunitiesParams = {}) => {
  const backendApi = useContext(BackendApiContext);

  const { data, isFetching, isLoading, isRefetching, error, refetch } =
    backendApi.useQuery('get', '/user/community/my/followed');
  // Refresh communities
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    communities: data?.data || [],
    isLoading,
    isRefreshing: isRefetching,
    error,
    refresh,
  };
};
