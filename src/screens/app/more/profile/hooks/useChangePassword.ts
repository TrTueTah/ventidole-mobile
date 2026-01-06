import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { useContext, useState } from 'react';
import { components } from 'src/schemas/openapi';

type ChangePasswordRequest = components['schemas']['ChangePasswordRequest'];

interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UseChangePasswordOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useChangePassword = (options?: UseChangePasswordOptions) => {
  const backendApi = useContext(BackendApiContext);
  const { showSuccess } = useToast();
  const [passwordError, setPasswordError] = useState('');

  const changePasswordMutation = backendApi.useMutation(
    'post',
    '/v1/auth/change-password',
  );

  const validatePassword = (params: ChangePasswordParams): string | null => {
    if (!params.oldPassword || !params.newPassword || !params.confirmPassword) {
      return 'All fields are required';
    }

    if (params.newPassword !== params.confirmPassword) {
      return 'New passwords do not match';
    }

    if (params.newPassword.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(params.newPassword)) {
      return 'Password must contain uppercase, lowercase, number, and special character';
    }

    return null;
  };

  const changePassword = (params: ChangePasswordParams) => {
    // Validate
    const validationError = validatePassword(params);
    if (validationError) {
      setPasswordError(validationError);
      options?.onError?.(validationError);
      return;
    }

    setPasswordError('');

    changePasswordMutation.mutate(
      {
        body: {
          oldPassword: params.oldPassword,
          password: params.newPassword,
        } as ChangePasswordRequest,
      },
      {
        onSuccess: () => {
          showSuccess('Password changed successfully!');
          options?.onSuccess?.();
        },
        onError: (error: any) => {
          const errorMessage = error?.message || 'Failed to change password';
          setPasswordError(errorMessage);
          options?.onError?.(errorMessage);
        },
      },
    );
  };

  return {
    changePassword,
    isChangingPassword: changePasswordMutation.isPending,
    passwordError,
    setPasswordError,
    validatePassword,
  };
};
