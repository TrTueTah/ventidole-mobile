import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';

import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { components } from '@/schemas/openapi';
import { useAuthStore } from '@/store/authStore';

type SignInRequest = components['schemas']['SignInRequest'];
type SignInResponse = components['schemas']['SignInResponse'];

interface LoginCredentials {
  email: string;
  password: string;
}

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

  const loginMutation = backendApi.useMutation('post', '/v1/auth/sign-in', {
    onSuccess: data => {
      if (data.data) {
        const { accessToken, refreshToken, id, role, isChooseCommunity } =
          data.data as SignInResponse;

        // Update auth store
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setUserMetadata({ uid: id });
        setIsLogin(true);
        setIsChooseCommunity(isChooseCommunity);

        showSuccess('Login successful!');

        // Navigate based on community selection status
        if (!isChooseCommunity) {
          navigation.replace('ChooseCommunity');
        }
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
    login: (credentials: LoginCredentials) => {
      loginMutation.mutate({
        body: credentials as SignInRequest,
      });
    },
    isLoading: loginMutation.isPending,
    isError: loginMutation.isError,
    isSuccess: loginMutation.isSuccess,
    error: loginMutation.error,
  };
};
