import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';

import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { components } from '@/schemas/openapi';
import { useAuthStore } from '@/store/authStore';

type LoginRequest = components['schemas']['LoginDto'];
type LoginResponse = components['schemas']['AuthResponseDto'];

export const useLogin = () => {
  const backendApi = useContext(BackendApiContext);
  const { showSuccess, showWarning } = useToast();
  const {
    setAccessToken,
    setRefreshToken,
    setIsLogin,
    setUserMetadata,
    setIsChooseCommunity,
  } = useAuthStore();
  const navigation = useNavigation<any>();

  const loginMutation = backendApi.useMutation('post', '/auth/login', {
    onSuccess: data => {
      if (data.data) {
        const { accessToken, refreshToken, user } = data.data as LoginResponse;

        // Update auth store
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setUserMetadata({ id: user.id, email: user.email });
        setIsLogin(true);

        showSuccess('Login successful!');
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      const errorMessage =
        error?.message || 'Login failed. Please check your credentials.';
      showWarning(errorMessage);
    },
  });

  return {
    login: (credentials: LoginRequest) => {
      loginMutation.mutate({
        body: credentials as LoginRequest,
      });
    },
    isLoading: loginMutation.isPending,
    isError: loginMutation.isError,
    isSuccess: loginMutation.isSuccess,
    error: loginMutation.error,
  };
};
