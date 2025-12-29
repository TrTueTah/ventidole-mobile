import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';

interface UseVerifyEmailProps {
  type: 'register' | 'resetPassword';
}

export const useVerifyEmail = ({ type }: UseVerifyEmailProps) => {
  const backendApi = useContext(BackendApiContext);
  const { showSuccess, showError } = useToast();
  const navigation = useNavigation();

  if (!backendApi) {
    throw new Error('useVerifyEmail must be used within BackendApiProvider');
  }

  // Send verification code mutation
  const sendVerificationMutation = backendApi.useMutation(
    'post',
    '/v1/auth/send-verification',
    {
      onSuccess: data => {
        showSuccess('OTP sent successfully!');
      },
      onError: (error: any) => {
        console.error('Send verification error:', error);
        const errorMessage =
          error?.message || 'Failed to send verification code.';
        showError(errorMessage);
      },
    },
  );

  // Confirm verification code mutation
  const confirmVerificationMutation = backendApi.useMutation(
    'post',
    '/v1/auth/verify-email',
    {
      onSuccess: data => {
        showSuccess('Email verified successfully!');

        // Navigate based on type
        if (type === 'register') {
          // Navigate to complete registration or main app
          navigation.navigate('AuthComplete');
        } else if (type === 'resetPassword') {
          // Navigate to reset password screen
          navigation.navigate('ResetPassword');
        }
      },
      onError: (error: any) => {
        console.error('Verify email error:', error);
        const errorMessage = error?.message || 'Invalid verification code.';
        showError(errorMessage);
      },
    },
  );

  return {
    sendVerification: (data: { email: string }) => {
      sendVerificationMutation.mutate({
        body: data as any,
      });
    },
    isSendingVerification: sendVerificationMutation.isPending,
    verificationData: sendVerificationMutation.data?.data,
    confirmVerification: (data: { email: string; code: string }) => {
      confirmVerificationMutation.mutate({
        body: data as any,
      });
    },
    isConfirmingVerification: confirmVerificationMutation.isPending,
  };
};
