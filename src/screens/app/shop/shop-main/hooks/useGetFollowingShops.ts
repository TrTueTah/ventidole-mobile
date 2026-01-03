import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useCallback, useContext, useMemo } from 'react';

import { components } from 'src/schemas/openapi';

type ShopListDto = components['schemas']['ShopListDto'];

export const useGetFollowingShops = () => {
  const backendApi = useContext(BackendApiContext);

  // Query for following shops
  const { data, isLoading, error, refetch } = backendApi.useQuery(
    'get',
    '/v1/user/shop/following',
    {},
    {
      enabled: true,
    },
  );

  // Extract shops data from response
  const shops = useMemo(() => {
    return (data?.data as ShopListDto[] | undefined) ?? [];
  }, [data]);

  // Refresh callback
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    shops,
    isLoading,
    error,
    refetch,
    refresh,
  };
};
