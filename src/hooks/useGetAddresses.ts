import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { components } from '@/schemas/openapi';
import { useCallback, useContext, useMemo } from 'react';

type AddressDto = components['schemas']['AddressDto'];

interface UseGetAddressesResult {
  addresses: AddressDto[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useGetAddresses = (): UseGetAddressesResult => {
  const backendApi = useContext(BackendApiContext);

  const { data, isLoading, error, refetch } = backendApi.useQuery(
    'get',
    '/v1/user/addresses',
    {},
  );

  const addresses = useMemo(() => {
    return (data?.data as AddressDto[] | undefined) ?? null;
  }, [data]);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    addresses,
    isLoading,
    error: error as Error | null,
    refetch: refresh,
  };
};
