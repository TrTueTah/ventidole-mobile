import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useCallback, useContext, useMemo } from 'react';
import { components } from 'src/schemas/openapi';

type CartDto = components['schemas']['CartDto'];

export const useGetCart = () => {
  const backendApi = useContext(BackendApiContext);

  // Query for cart
  const { data, isLoading, error, refetch } = backendApi.useQuery(
    'get',
    '/v1/user/shop/cart',
    {},
  );

  // Extract cart data from response
  const cart = useMemo(() => {
    return (data?.data as CartDto | undefined) ?? null;
  }, [data]);

  // Refresh callback
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    cart,
    isLoading,
    error,
    refetch,
    refresh,
  };
};
