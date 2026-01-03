import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { components } from '@/schemas/openapi';
import { useCallback, useContext } from 'react';

type CreateAddressDto = components['schemas']['CreateAddressDto'];
type AddressDto = components['schemas']['AddressDto'];

interface UseCreateAddressOptions {
  onSuccess?: (address: AddressDto) => void;
  onError?: (error: Error) => void;
}

interface UseCreateAddressResult {
  createAddress: (data: CreateAddressDto) => void;
  isLoading: boolean;
  error: Error | null;
}

export const useCreateAddress = (
  options?: UseCreateAddressOptions,
): UseCreateAddressResult => {
  const backendApi = useContext(BackendApiContext);

  const {
    mutate: createAddressMutation,
    isPending: isLoading,
    error,
  } = backendApi.useMutation('post', '/v1/user/addresses', {
    onSuccess: response => {
      if (response.data && options?.onSuccess) {
        options.onSuccess(response.data as AddressDto);
      }
    },
    onError: err => {
      console.error('Failed to create address:', err);
      options?.onError?.(err as Error);
    },
  });

  const createAddress = useCallback(
    (addressData: CreateAddressDto) => {
      createAddressMutation({
        body: addressData,
      });
    },
    [createAddressMutation],
  );

  return {
    createAddress,
    isLoading,
    error: error as Error | null,
  };
};
