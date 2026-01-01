import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useContext } from 'react';

export const useLeaveCommunity = () => {
  const backendApi = useContext(BackendApiContext);

  return backendApi.useMutation('delete', '/v1/user/community/{id}/leave');
};
