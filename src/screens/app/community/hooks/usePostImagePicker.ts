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

const MAX_IMAGES = 5;

export const usePostImagePicker = () => {
  const backendApi = useContext(BackendApiContext);
  const { showWarning, showError } = useToast();
  const { openPickerWithAndroidFixes } = useEnhancedImagePicker();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
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
          return await handleBlockedPermission(permission);
        }
        return requestResult;
      }
      case RESULTS.BLOCKED:
        return await handleBlockedPermission(permission);
      case RESULTS.LIMITED:
        return result;
      case RESULTS.GRANTED:
        return result;
      default:
        return result;
    }
  };

  const handleBlockedPermission = async (
    permission: Permission,
  ): Promise<PermissionStatus> => {
    showWarning(
      'Please enable photo library access in your device settings to continue.',
    );
    Linking.openSettings();
    return RESULTS.BLOCKED;
  };

  const uploadImage = async (imagePath: string): Promise<string | null> => {
    if (!imagePath) {
      return null;
    }

    // If it's already a URL, return it
    if (imagePath.includes('https://')) {
      return imagePath;
    }

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', {
        uri: imagePath,
        type: 'image/jpeg',
        name: `post_${Date.now()}.jpg`,
      } as any);
      formData.append('folder', 'posts');

      // Use backendApi mutation to upload the file
      const response = await uploadFileMutation({
        body: formData as any,
      });

      return response.data?.url || null;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const openImagePicker = async (): Promise<void> => {
    if (selectedImages.length >= MAX_IMAGES) {
      showWarning(`You can only upload up to ${MAX_IMAGES} images per post.`);
      return;
    }

    const photoLibraryPermission = await makePermissionsRequest(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
    );

    if (
      photoLibraryPermission !== RESULTS.GRANTED &&
      photoLibraryPermission !== RESULTS.LIMITED
    ) {
      return;
    }

    try {
      const image = await openPickerWithAndroidFixes({
        width: 1200,
        height: 1200,
        cropping: true,
        multiple: false,
        mediaType: 'photo',
        freeStyleCropEnabled: true,
      });

      const imagePath = (image as any).path;
      if (imagePath) {
        setSelectedImages(prev => [...prev, imagePath]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const removeImage = (index: number): void => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAllImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) {
      return [];
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const imagePath = selectedImages[i];
        const url = await uploadImage(imagePath);

        if (!url) {
          showError(`Failed to upload image ${i + 1}. Please try again.`);
          setIsUploading(false);
          return [];
        }

        uploadedUrls.push(url);
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      showError('Failed to upload images. Please try again.');
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const clearImages = () => {
    setSelectedImages([]);
  };

  return {
    selectedImages,
    isUploading,
    openImagePicker,
    removeImage,
    uploadAllImages,
    clearImages,
  };
};
