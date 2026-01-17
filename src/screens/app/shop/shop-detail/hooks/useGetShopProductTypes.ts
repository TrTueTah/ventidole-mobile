import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useContext, useMemo } from 'react';
import { components } from 'src/schemas/openapi';

type ShopProductTypeDto = components['schemas']['ShopProductTypeDto'];

interface UseGetShopProductTypesParams {
  shopId: string;
}

export const useGetShopProductTypes = (params: UseGetShopProductTypesParams) => {
  const backendApi = useContext(BackendApiContext);
  const { shopId } = params;

  const { data, isLoading, error, refetch } = backendApi.useQuery(
    'get',
    '/v1/user/shop/{shopId}/product-types',
    {
      params: {
        path: { shopId },
      },
    },
    {
      enabled: !!shopId,
    },
  );

  const productTypes = useMemo(() => {
    return (data?.data as ShopProductTypeDto[] | undefined) ?? [];
  }, [data]);

  return {
    productTypes,
    isLoading,
    error,
    refetch,
  };
};
