import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useContext } from 'react';
import { components } from 'src/schemas/openapi';

type ConfirmOrderDto = components['schemas']['ConfirmOrderDto'];
type OrderResponseDto = components['schemas']['OrderResponseDto'];

interface UseConfirmOrderOptions {
  onSuccess?: (order: OrderResponseDto) => void;
  onError?: (error: Error) => void;
}

export const useConfirmOrder = (options: UseConfirmOrderOptions = {}) => {
  const backendApi = useContext(BackendApiContext);
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  const {
    mutate: confirmOrderMutation,
    isPending: isConfirming,
    error,
    data,
    reset,
  } = backendApi.useMutation('post', '/v1/orders/confirm', {
    onSuccess: response => {
      if (response.data) {
        // Invalidate cart query to refetch cart data
        queryClient.invalidateQueries({
          queryKey: ['get', '/v1/user/shop/cart'],
        });
        onSuccess?.(response.data);
      }
    },
    onError: err => {
      console.error('Failed to confirm order:', err);
      onError?.(err as Error);
    },
  });

  const confirmOrder = useCallback(
    (orderData: ConfirmOrderDto) => {
      confirmOrderMutation({
        body: orderData,
      });
    },
    [confirmOrderMutation],
  );

  const confirmOrderAsync = useCallback(
    async (orderData: ConfirmOrderDto): Promise<OrderResponseDto> => {
      return new Promise<OrderResponseDto>((resolve, reject) => {
        confirmOrderMutation(
          { body: orderData },
          {
            onSuccess: response => {
              if (response.data) {
                resolve(response.data);
              } else {
                reject(new Error('No data returned from order confirmation'));
              }
            },
            onError: err => {
              reject(err);
            },
          },
        );
      });
    },
    [confirmOrderMutation],
  );

  return {
    confirmOrder,
    confirmOrderAsync,
    isLoading: isConfirming,
    error,
    data: data?.data,
    reset,
  };
};
