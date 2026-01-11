import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { components } from '@/schemas/openapi';
import { useContext } from 'react';

export type Banner = components['schemas']['UserBannerDto'];

export const useGetActiveBanners = () => {
  const backendApi = useContext(BackendApiContext);

  const { data, isLoading, error, refetch, isRefetching } = backendApi.useQuery(
    'get',
    '/v1/user/banner/active',
    {},
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  );

  const banners = data?.data as Banner[] | undefined;

  return {
    banners: banners || [],
    isLoading,
    error,
    refetch,
    isRefetching,
  };
};
