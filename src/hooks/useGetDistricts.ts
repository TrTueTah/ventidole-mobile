import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { components } from '@/schemas/openapi';
import { useContext, useMemo } from 'react';

type DistrictDto = components['schemas']['DistrictDto'];

interface UseGetDistrictsOptions {
  provinceCode?: number;
  enabled?: boolean;
}

interface UseGetDistrictsResult {
  districts: DistrictDto[] | null;
  isLoading: boolean;
  error: Error | null;
}

export const useGetDistricts = (
  options: UseGetDistrictsOptions,
): UseGetDistrictsResult => {
  const backendApi = useContext(BackendApiContext);
  const { provinceCode, enabled = true } = options;

  const { data, isLoading, error } = backendApi.useQuery(
    'get',
    '/v1/user/addresses/provinces/{provinceCode}/districts',
    {
      params: { path: { provinceCode: String(provinceCode!) } },
    },
    {
      enabled: enabled && !!provinceCode,
    },
  );

  const districts = useMemo(() => {
    return (data?.data as DistrictDto[] | undefined) ?? null;
  }, [data]);

  return {
    districts,
    isLoading,
    error: error as Error | null,
  };
};
