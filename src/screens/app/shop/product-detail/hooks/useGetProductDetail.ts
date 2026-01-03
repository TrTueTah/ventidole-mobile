import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useCallback, useContext, useMemo } from 'react';
import { components } from 'src/schemas/openapi';

type UserProductDetailDto = components['schemas']['UserProductDetailDto'];

interface UseGetProductDetailParams {
  productId: string;
  enabled?: boolean;
}

export const useGetProductDetail = ({
  productId,
  enabled = true,
}: UseGetProductDetailParams) => {
  const backendApi = useContext(BackendApiContext);

  // Query for product detail
  const { data, isLoading, error, refetch } = backendApi.useQuery(
    'get',
    '/v1/user/shop/products/{id}',
    {
      params: {
        path: {
          id: productId,
        },
      },
    },
    {
      enabled: enabled && !!productId,
    },
  );

  // Extract product data from response
  const product = useMemo(() => {
    return (data?.data as UserProductDetailDto | undefined) ?? null;
  }, [data]);

  // Refresh callback
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    product,
    isLoading,
    error,
    refetch,
    refresh,
  };
};
