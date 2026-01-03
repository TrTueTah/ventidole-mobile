import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { components } from '@/schemas/openapi';
import { useContext, useMemo } from 'react';

type OrderDetailDto = components['schemas']['OrderDetailDto'];

interface UseGetOrderDetailsOptions {
  orderId: string;
  enabled?: boolean;
}

/**
 * Hook to fetch complete order details including items, shipping address, and payment status.
 * This is the API endpoint that should be used in PaymentSuccessScreen and PaymentFailureScreen
 * to display full order information after payment completion.
 *
 * API: GET /v1/orders/{orderId}/details
 */
export const useGetOrderDetails = (options: UseGetOrderDetailsOptions) => {
  const backendApi = useContext(BackendApiContext);
  const { orderId, enabled = true } = options;

  const { data, error, isLoading, refetch } = backendApi.useQuery(
    'get',
    '/v1/orders/{orderId}/details',
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

  const orderDetails = useMemo(() => data?.data, [data]);

  return {
    orderDetails,
    isLoading,
    error,
    refetch,
  };
};
