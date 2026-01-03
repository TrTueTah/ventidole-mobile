import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { components } from '@/schemas/openapi';
import { useContext, useMemo } from 'react';

type OrderResponseDto = components['schemas']['OrderResponseDto'];

interface UseGetOrderStatusOptions {
  orderId: string;
  enabled?: boolean;
}

export const useGetOrderStatus = (options: UseGetOrderStatusOptions) => {
  const backendApi = useContext(BackendApiContext);
  const { orderId, enabled = true } = options;

  const { data, error, isLoading, refetch } = backendApi.useQuery(
    'get',
    '/v1/orders/{orderId}',
    {
      params: {
        path: {
          orderId,
        },
      },
    },
    {
      enabled,
    },
  );

  const order = useMemo(() => data?.data, [data]);

  return {
    order,
    isLoading,
    error,
    refetch,
  };
};
