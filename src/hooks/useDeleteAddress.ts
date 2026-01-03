import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useCallback, useContext } from 'react';

interface UseDeleteAddressOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseDeleteAddressResult {
  deleteAddress: (id: string) => void;
  isLoading: boolean;
  error: Error | null;
}

export const useDeleteAddress = (
  options?: UseDeleteAddressOptions,
): UseDeleteAddressResult => {
  const backendApi = useContext(BackendApiContext);

  const {
    mutate: deleteAddressMutation,
    isPending: isLoading,
    error,
  } = backendApi.useMutation('delete', '/v1/user/addresses/{id}', {
    onSuccess: () => {
      options?.onSuccess?.();
    },
    onError: err => {
      console.error('Failed to delete address:', err);
      options?.onError?.(err as Error);
    },
  });

  const deleteAddress = useCallback(
    (id: string) => {
      deleteAddressMutation({
        params: { path: { id } },
      });
    },
    [deleteAddressMutation],
  );

  return {
    deleteAddress,
    isLoading,
    error: error as Error | null,
  };
};
