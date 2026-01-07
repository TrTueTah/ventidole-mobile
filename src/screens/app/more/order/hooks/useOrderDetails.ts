import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useContext } from 'react';
import { components } from 'src/schemas/openapi';

type OrderDetailDto = components['schemas']['OrderDetailDto'];

export const useOrderDetails = (orderId: string | null) => {
  const backendApi = useContext(BackendApiContext);

  const { data, isLoading, error, refetch } = backendApi.useQuery(
    'get',
    '/v1/orders/{orderId}/details',
    {
      params: {
        path: {
          orderId: orderId || '',
        },
      },
    },
    {
      enabled: !!orderId,
    },
  );

  const orderDetails = data?.data as OrderDetailDto | undefined;

  return {
    orderDetails,
    isLoading,
    error: error ? 'Failed to fetch order details' : null,
    refetch,
  };
};
