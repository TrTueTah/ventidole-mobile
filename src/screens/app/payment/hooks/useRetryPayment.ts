import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { components } from '@/schemas/openapi';
import { useContext } from 'react';

type OrderResponseDto = components['schemas']['OrderResponseDto'];

/**
 * Hook to retry payment for a failed order.
 * Creates a new payment transaction with new orderCode and PayOS link.
 * Only works for CREDIT orders in PENDING_PAYMENT status.
 *
 * API: POST /v1/orders/{orderId}/retry-payment
 */
export const useRetryPayment = () => {
  const backendApi = useContext(BackendApiContext);

  const { mutateAsync: retryPaymentAsync, isPending } = backendApi.useMutation(
    'post',
    '/v1/orders/{orderId}/retry-payment',
  );

  const retryPayment = async (orderId: string): Promise<OrderResponseDto> => {
    const response = await retryPaymentAsync({
      params: {
        path: {
          orderId,
        },
      },
    });

    if (!response.data) {
      throw new Error('Failed to retry payment');
    }

    return response.data;
  };

  return {
    retryPayment,
    isRetrying: isPending,
  };
};
