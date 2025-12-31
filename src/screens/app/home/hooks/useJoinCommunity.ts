import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useContext } from 'react';

export const useJoinCommunity = () => {
  const backendApi = useContext(BackendApiContext);

  return backendApi.useMutation('post', '/v1/user/community/{id}/join');
};
