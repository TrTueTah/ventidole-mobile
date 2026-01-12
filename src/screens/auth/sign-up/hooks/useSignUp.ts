import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { components } from '@/schemas/openapi';
import { useAuthStore } from '@/store/authStore';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';

type RegisterRequest = components['schemas']['RegisterDto'];
type RegisterResponse = components['schemas']['AuthResponseDto'];

export const useSignUp = () => {
  const backendApi = useContext(BackendApiContext);
  const { showSuccess, showWarning } = useToast();
  const {
    setAccessToken,
    setRefreshToken,
    setIsLogin,
    setUserMetadata,
    setIsChooseCommunity,
  } = useAuthStore();
  const navigation = useNavigation();

  const signUpMutation = backendApi.useMutation('post', '/auth/register', {
    onSuccess: data => {
      console.log('✅ Sign up success');

      navigation.navigate('AuthComplete', {
        type: 'register',
      });

      if (data.data) {
        const { accessToken, refreshToken, user } =
          data.data as RegisterResponse;

        // Update auth store
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setUserMetadata({ id: user.id, email: user.email });
        showSuccess('Account created successfully!');
      }
    },
    onError: (error: any) => {
      console.error('❌ Sign up error:', error);
      const errorMessage =
        error?.message || 'Sign up failed. Please try again.';
      showWarning(errorMessage);
      navigation.navigate('VerifyEmail', { type: 'register' });
    },
  });

  return {
    signUp: (credentials: RegisterRequest) => {
      signUpMutation.mutate({
        body: credentials,
      });
    },
    isLoading: signUpMutation.isPending,
    isError: signUpMutation.isError,
    isSuccess: signUpMutation.isSuccess,
    error: signUpMutation.error,
  };
};
