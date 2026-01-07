import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { components } from '@/schemas/openapi';
import { useContext, useMemo } from 'react';

type UserProfileDto = components['schemas']['UserProfileDto'];

interface UseUserProfileOptions {
  userId: string;
}

export const useUserProfile = ({ userId }: UseUserProfileOptions) => {
  const backendApi = useContext(BackendApiContext);

  const { data, isLoading, error, refetch } = backendApi.useQuery(
    'get',
    '/v1/user/profile/{userId}',
    {
      params: {
        path: {
          userId,
        },
      },
    },
  );

  const userProfile = useMemo(() => {
    return (data?.data as UserProfileDto | undefined) ?? null;
  }, [data]);

  return {
    userProfile,
    isLoading,
    error,
    refetch,
  };
};
