import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { components } from '@/schemas/openapi';
import { useContext, useMemo } from 'react';

type ProvinceDto = components['schemas']['ProvinceDto'];

interface UseGetProvincesResult {
  provinces: ProvinceDto[] | null;
  isLoading: boolean;
  error: Error | null;
}

export const useGetProvinces = (): UseGetProvincesResult => {
  const backendApi = useContext(BackendApiContext);

  const { data, isLoading, error } = backendApi.useQuery(
    'get',
    '/v1/user/addresses/provinces',
    {},
  );

  const provinces = useMemo(() => {
    return (data?.data as ProvinceDto[] | undefined) ?? null;
  }, [data]);

  return {
    provinces,
    isLoading,
    error: error as Error | null,
  };
};
