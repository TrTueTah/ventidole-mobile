import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { useEnhancedImagePicker } from '@/hooks/useEnhancedImagePicker';
import { useContext, useState } from 'react';
import { Linking, Platform } from 'react-native';
import {
  check,
  Permission,
  PERMISSIONS,
  PermissionStatus,
  request,
  RESULTS,
} from 'react-native-permissions';

export const useAvatarPicker = () => {
  const backendApi = useContext(BackendApiContext);
  const { showWarning, showError } = useToast();
  const { openPickerWithAndroidFixes } = useEnhancedImagePicker();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { mutateAsync: uploadFileMutation } = backendApi.useMutation(
    'post',
    '/v1/file/upload',
  );

  const makePermissionsRequest = async (
    permission: Permission,
  ): Promise<PermissionStatus> => {
    const result = await check(permission);

    switch (result) {
      case RESULTS.DENIED: {
        const requestResult = await request(permission);
        if (requestResult === RESULTS.BLOCKED) {
          return await handleBlockedPermission();
        }
        return requestResult;
      }
      case RESULTS.BLOCKED:
        return await handleBlockedPermission();
      case RESULTS.LIMITED:
        return result;
      case RESULTS.GRANTED:
        return result;
      default:
        return result;
    }
  };

  const handleBlockedPermission = async (): Promise<PermissionStatus> => {
    showWarning(
      'Please enable photo library access in your device settings to continue.',
    );
    Linking.openSettings();
    return RESULTS.BLOCKED;
  };

  const uploadAvatar = async (imagePath: string): Promise<string | null> => {
    if (!imagePath) {
      return null;
    }

    // If it's already a URL, return it
    if (imagePath.includes('https://')) {
      return imagePath;
    }

    setIsUploading(true);

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', {
        uri: imagePath,
        type: 'image/jpeg',
        name: `avatar_${Date.now()}.jpg`,
      } as any);
      formData.append('folder', 'avatars');

      // Use backendApi mutation to upload the file
      const response = await uploadFileMutation({
        body: formData as any,
      });

      return response.data?.url || null;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showError('Failed to upload avatar. Please try again.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const openAvatarPicker = async (): Promise<string | null> => {
    const photoLibraryPermission = await makePermissionsRequest(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
    );

    if (
      photoLibraryPermission !== RESULTS.GRANTED &&
      photoLibraryPermission !== RESULTS.LIMITED
    ) {
      return null;
    }

    try {
      const image = await openPickerWithAndroidFixes({
        width: 500,
        height: 500,
        cropping: true,
        cropperCircleOverlay: true,
        multiple: false,
        mediaType: 'photo',
      });

      const imagePath = (image as any).path;
      if (imagePath) {
        setSelectedAvatar(imagePath);
        return imagePath;
      }
      return null;
    } catch (error) {
      console.error('Error picking avatar:', error);
      return null;
    }
  };

  const pickAndUploadAvatar = async (): Promise<string | null> => {
    const imagePath = await openAvatarPicker();
    if (!imagePath) {
      return null;
    }

    const uploadedUrl = await uploadAvatar(imagePath);
    return uploadedUrl;
  };

  const clearAvatar = () => {
    setSelectedAvatar(null);
  };

  return {
    selectedAvatar,
    setSelectedAvatar,
    isUploading,
    openAvatarPicker,
    uploadAvatar,
    pickAndUploadAvatar,
    clearAvatar,
  };
};
