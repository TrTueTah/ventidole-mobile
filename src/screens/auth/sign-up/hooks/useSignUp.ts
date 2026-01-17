import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { components } from '@/schemas/openapi';
import { useAuthStore } from '@/store/authStore';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';

type SignUpRequest = components['schemas']['SignUpRequest'];
type SignInResponse = components['schemas']['SignInResponse'];

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

  const signUpMutation = backendApi.useMutation('post', '/v1/auth/sign-up', {
    onSuccess: data => {
      console.log('✅ Sign up success');
      console.log('Navigating to AuthComplete with type: register');

      navigation.navigate('AuthComplete', {
        type: 'register',
      } as const);

      if (data.data) {
        const { accessToken, refreshToken, id, isChooseCommunity } =
          data.data as SignInResponse;

        // Update auth store
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setUserMetadata({ uid: id });
        // Don't set isLogin here - it will be set after choosing communities
        // This prevents Navigator from resetting AuthStack navigation
        setIsChooseCommunity(isChooseCommunity);

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
    signUp: (credentials: SignUpRequest) => {
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
