import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';

export type VerificationType =
  | 'FIND_EMAIL'
  | 'RESET_PASSWORD'
  | 'REGISTER_ACCOUNT'
  | 'UPDATE_PROFILE'
  | 'CHANGE_PASSWORD';

interface VerifyEmailOptions {
  verificationType: VerificationType;
  onSuccess?: (data: any) => void;
  email?: string;
}

export const useVerifyEmail = (options?: VerifyEmailOptions) => {
  const backendApi = useContext(BackendApiContext);
  const { showSuccess, showError } = useToast();
  const navigation = useNavigation();

  if (!backendApi) {
    throw new Error('useVerifyEmail must be used within BackendApiProvider');
  }

  // Handle navigation based on verification type
  const handleVerificationSuccess = (
    data: any,
    verificationType: VerificationType,
    email: string,
  ) => {
    showSuccess('Email verified successfully!');

    // Call custom success handler if provided
    if (options?.onSuccess) {
      options.onSuccess(data);
      return;
    }

    // Default navigation based on verification type
    switch (verificationType) {
      case 'REGISTER_ACCOUNT':
        // Navigate to complete registration or login
        navigation.navigate('SignUp', { email });
        break;
      case 'RESET_PASSWORD':
        // Navigate to set new password screen
        navigation.navigate('ResetPassword', { email });
        break;
      case 'FIND_EMAIL':
        // Navigate to login or show email
        navigation.navigate('SignUp', { email });
        break;
      case 'UPDATE_PROFILE':
      case 'CHANGE_PASSWORD':
        // Navigate back to profile or settings
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
        break;
      default:
        break;
    }
  };

  // Send verification code mutation
  const sendVerificationMutation = backendApi.useMutation(
    'post',
    '/auth/send-verification',
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
    '/auth/confirm-verification',
    {
      onSuccess: (data, variables) => {
        const verificationType = (variables.body as any).verificationType;
        const email = (variables.body as any).email;
        handleVerificationSuccess(data, verificationType, email);
      },
      onError: (error: any) => {
        console.error('Verify email error:', error);
        const errorMessage = error?.message || 'Invalid verification code.';
        showError(errorMessage);
      },
    },
  );

  return {
    sendVerification: (data: {
      email: string;
      verificationType: VerificationType;
    }) => {
      sendVerificationMutation.mutate({
        body: data as any,
      });
    },
    isSendingVerification: sendVerificationMutation.isPending,
    verificationData: sendVerificationMutation.data?.data,
    confirmVerification: (data: {
      email: string;
      code: string;
      verificationType: VerificationType;
    }) => {
      confirmVerificationMutation.mutate({
        body: data as any,
      });
    },
    isConfirmingVerification: confirmVerificationMutation.isPending,
  };
};
