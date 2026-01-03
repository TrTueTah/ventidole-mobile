import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useCallback, useContext } from 'react';
import { components } from 'src/schemas/openapi';

type CartDto = components['schemas']['CartDto'];

interface UseRemoveFromCartOptions {
  onSuccess?: (cart: CartDto) => void;
  onError?: (error: Error) => void;
}

export const useRemoveFromCart = (options: UseRemoveFromCartOptions = {}) => {
  const backendApi = useContext(BackendApiContext);
  const { onSuccess, onError } = options;

  const {
    mutate: removeFromCartMutation,
    isPending: isRemoving,
    error,
    data,
    reset,
  } = backendApi.useMutation('delete', '/v1/user/shop/cart/{cartItemId}', {
    onSuccess: response => {
      if (response.data) {
        onSuccess?.(response.data);
      }
    },
    onError: err => {
      console.error('Failed to remove from cart:', err);
      onError?.(err);
    },
  });

  const removeFromCart = useCallback(
    (cartItemId: string) => {
      removeFromCartMutation({
        params: {
          path: {
            cartItemId,
          },
        },
      });
    },
    [removeFromCartMutation],
  );

  const removeFromCartAsync = useCallback(
    async (cartItemId: string) => {
      return new Promise<CartDto>((resolve, reject) => {
        removeFromCartMutation(
          {
            params: {
              path: {
                cartItemId,
              },
            },
          },
          {
            onSuccess: response => {
              if (response.data) {
                resolve(response.data);
              } else {
                reject(new Error('No data returned'));
              }
            },
            onError: err => {
              reject(err);
            },
          },
        );
      });
    },
    [removeFromCartMutation],
  );

  return {
    removeFromCart,
    removeFromCartAsync,
    isLoading: isRemoving,
    error,
    data,
    reset,
  };
};
