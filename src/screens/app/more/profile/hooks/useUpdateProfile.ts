import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { components } from '@/schemas/openapi';
import { useContext } from 'react';

type UpdateProfileDto = components['schemas']['UpdateProfileDto'];
type UpdateProfileResponseDto =
  components['schemas']['UpdateProfileResponseDto'];

interface UpdateProfileParams {
  username?: string;
  avatarUrl?: string;
  backgroundUrl?: string;
  bio?: string;
}

interface UseUpdateProfileOptions {
  onSuccess?: (data: UpdateProfileResponseDto) => void;
  onError?: (error: any) => void;
}

export const useUpdateProfile = (options?: UseUpdateProfileOptions) => {
  const backendApi = useContext(BackendApiContext);
  const { showSuccess, showError } = useToast();

  const updateProfileMutation = backendApi.useMutation(
    'patch',
    '/v1/user/profile',
    {
      onSuccess: data => {
        if (data.data) {
          const responseData = data.data as UpdateProfileResponseDto;
          showSuccess('Profile updated successfully!');
          options?.onSuccess?.(responseData);
        }
      },
      onError: (error: any) => {
        console.error('Update profile error:', error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update profile';
        showError(errorMessage);
        options?.onError?.(error);
      },
    },
  );

  const updateProfile = async (params: UpdateProfileParams) => {
    const body: UpdateProfileDto = {
      username: params.username,
      avatarUrl: params.avatarUrl,
      backgroundUrl: params.backgroundUrl,
      bio: params.bio,
    };

    await updateProfileMutation.mutateAsync({
      body,
    });
  };

  return {
    updateProfile,
    isUpdating: updateProfileMutation.isPending,
    error: updateProfileMutation.error,
  };
};
