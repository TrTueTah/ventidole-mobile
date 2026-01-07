import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useContext } from 'react';
import { components } from 'src/schemas/openapi';

type AddToCartDto = components['schemas']['AddToCartDto'];
type CartDto = components['schemas']['CartDto'];

interface UseAddToCartOptions {
  onSuccess?: (cart: CartDto) => void;
  onError?: (error: Error) => void;
}

export const useAddToCart = (options: UseAddToCartOptions = {}) => {
  const backendApi = useContext(BackendApiContext);
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  const {
    mutate: addToCartMutation,
    isPending: isAdding,
    error,
    data,
    reset,
  } = backendApi.useMutation('post', '/v1/user/shop/cart', {
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
      console.error('Failed to add to cart:', err);
      onError?.(err);
    },
  });

  const addToCart = useCallback(
    (data: AddToCartDto) => {
      addToCartMutation({
        body: data,
      });
    },
    [addToCartMutation],
  );

  const addToCartAsync = useCallback(
    async (data: AddToCartDto) => {
      return new Promise<CartDto>((resolve, reject) => {
        addToCartMutation(
          { body: data },
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
    [addToCartMutation],
  );

  return {
    addToCart,
    addToCartAsync,
    isLoading: isAdding,
    error,
    data,
    reset,
  };
};
