import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { components } from '@/schemas/openapi';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';

type ResetPasswordRequest = components['schemas']['ResetPasswordDto'];

export const useResetPassword = () => {
  const backendApi = useContext(BackendApiContext);
  const { showSuccess, showError } = useToast();
  const navigation = useNavigation<any>();

  const resetPasswordMutation = backendApi.useMutation(
    'post',
    '/auth/reset-password',
    {
      onSuccess: () => {
        console.log('✅ Reset password success');
        showSuccess('Password reset successfully!');

        // Navigate to sign in screen
        navigation.navigate('SignIn');
      },
      onError: (error: any) => {
        console.error('❌ Reset password error:', error);
        const errorMessage =
          error?.message || 'Failed to reset password. Please try again.';
        showError(errorMessage);
      },
    },
  );

  return {
    resetPassword: (data: ResetPasswordRequest) => {
      resetPasswordMutation.mutate({
        body: data,
      });
    },
    isLoading: resetPasswordMutation.isPending,
    isError: resetPasswordMutation.isError,
    isSuccess: resetPasswordMutation.isSuccess,
    error: resetPasswordMutation.error,
  };
};
