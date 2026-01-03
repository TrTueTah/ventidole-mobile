import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { components } from '@/schemas/openapi';
import { useCallback, useContext } from 'react';

type UpdateAddressDto = components['schemas']['UpdateAddressDto'];
type AddressDto = components['schemas']['AddressDto'];

interface UseUpdateAddressOptions {
  onSuccess?: (address: AddressDto) => void;
  onError?: (error: Error) => void;
}

interface UseUpdateAddressResult {
  updateAddress: (id: string, data: UpdateAddressDto) => void;
  isLoading: boolean;
  error: Error | null;
}

export const useUpdateAddress = (
  options?: UseUpdateAddressOptions,
): UseUpdateAddressResult => {
  const backendApi = useContext(BackendApiContext);

  const {
    mutate: updateAddressMutation,
    isPending: isLoading,
    error,
  } = backendApi.useMutation('patch', '/v1/user/addresses/{id}', {
    onSuccess: response => {
      if (response.data && options?.onSuccess) {
        options.onSuccess(response.data as AddressDto);
      }
    },
    onError: err => {
      console.error('Failed to update address:', err);
      options?.onError?.(err as Error);
    },
  });

  const updateAddress = useCallback(
    (id: string, addressData: UpdateAddressDto) => {
      updateAddressMutation({
        params: { path: { id } },
        body: addressData,
      });
    },
    [updateAddressMutation],
  );

  return {
    updateAddress,
    isLoading,
    error: error as Error | null,
  };
};
