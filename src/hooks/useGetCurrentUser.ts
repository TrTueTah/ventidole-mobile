import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useAuthStore } from '@/store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { useContext, useEffect, useRef } from 'react';

export const useGetCurrentUser = () => {
  const backendApi = useContext(BackendApiContext);
  const queryClient = useQueryClient();
  const setUserData = useAuthStore(state => state.setUserData);
  const isLogin = useAuthStore(state => state.isLogin);
  const prevIsLogin = useRef(isLogin);

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = backendApi.useQuery('get', '/auth/me', undefined, {
    enabled: isLogin,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Clear user data when logged out and invalidate cache when logging in
  useEffect(() => {
    if (!isLogin) {
      setUserData(null);
    } else if (!prevIsLogin.current && isLogin) {
      // User just logged in - invalidate cache to force fresh data fetch
      queryClient.invalidateQueries({ queryKey: ['get', '/auth/me'] });
    }
    prevIsLogin.current = isLogin;
  }, [isLogin, setUserData, queryClient]);

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
