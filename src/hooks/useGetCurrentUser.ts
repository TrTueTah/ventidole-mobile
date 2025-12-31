import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useAuthStore } from '@/store/authStore';
import { useContext, useEffect } from 'react';

export const useGetCurrentUser = () => {
  const backendApi = useContext(BackendApiContext);
  const setUserData = useAuthStore(state => state.setUserData);
  const isLogin = useAuthStore(state => state.isLogin);

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = backendApi.useQuery('get', '/v1/user/me', undefined, {
    enabled: isLogin,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update store when user data is fetched
  useEffect(() => {
    if (response?.data) {
      setUserData(response.data);
    }
  }, [response?.data, setUserData]);

  return {
    user: response?.data,
    isLoading,
    error,
    refetch,
  };
};
