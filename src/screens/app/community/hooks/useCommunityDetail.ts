import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useContext } from 'react';
import { components } from 'src/schemas/openapi';

type CommunityDetail = components['schemas']['CommunityResponseDto'];

interface UseCommunityDetailParams {
  communityId?: string;
  enabled?: boolean;
}

export const useCommunityDetail = ({
  communityId,
  enabled = true,
}: UseCommunityDetailParams) => {
  const backendApi = useContext(BackendApiContext);

  const { data, isLoading, error, refetch } = backendApi.useQuery(
    'get',
    '/user/community/{communityId}',
    {
      params: {
        path: {
          communityId: communityId || '',
        },
      },
    },
    {
      enabled: enabled && !!communityId,
    },
  );

  return {
    community: data?.data as CommunityDetail | undefined,
    isLoading,
    error,
    refetch,
  };
};
