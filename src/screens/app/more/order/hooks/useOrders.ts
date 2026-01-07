import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useContext } from 'react';
import { components } from 'src/schemas/openapi';

type OrderListDto = components['schemas']['OrderListDto'];
type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PAID'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELED'
  | 'EXPIRED';

interface UseOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export const useOrders = (params?: UseOrdersParams) => {
  const backendApi = useContext(BackendApiContext);

  const { data, isLoading, error, refetch } = backendApi.useQuery(
    'get',
    '/v1/orders',
    {
      params: {
        query: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          ...(params?.status && { status: params.status }),
        },
      },
    },
  );

  const orders = (data?.data as OrderListDto[]) || [];

  return {
    orders,
    isLoading,
    error: error ? 'Failed to fetch orders' : null,
    refetch,
  };
};
