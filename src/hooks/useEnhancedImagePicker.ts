import { Platform } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { useAndroidImageCropNavigationBar } from './useAndroidImageCropNavigationBar';

// Android-specific image picker configuration
const getAndroidImagePickerConfig = () => {
  if (Platform.OS !== 'android') return {};

  return {
    // Hide status bar completely
    statusBarColor: '#000000',
    statusBarTranslucent: true,
    statusBarHidden: true,

    // High quality image settings
    compressImageQuality: 0.95,
    compressImageMaxWidth: 2400,
    compressImageMaxHeight: 3200,

    // Android-specific UI fixes
    cropperToolbarColor: '#000000',
    cropperStatusBarColor: '#000000',
    cropperActiveWidgetColor: '#FFFFFF',
    cropperToolbarWidgetColor: '#FFFFFF',

    // Fix button positioning
    cropperToolbarTitle: '',
    showCropGuidelines: true,
    hideBottomControls: false,
    enableRotationGesture: true,

    // Ensure full-screen experience
    useOriginalImage: false,
    includeBase64: false,

    // Force full-screen mode
    forceJpg: true,
    mediaType: 'photo',
  };
};

// iOS-specific image picker configuration for high quality
const getIOSImagePickerConfig = () => {
  if (Platform.OS !== 'ios') return {};

  return {
    // High quality settings for iOS
    compressImageQuality: 0.95,
    compressImageMaxWidth: 2400,
    compressImageMaxHeight: 3200,
    freeStyleCropEnabled: true,
  };
};

// Enhanced image picker functions with Android fixes
export const useEnhancedImagePicker = () => {
  const { hideNavigationBarForCrop, showNavigationBarAfterCrop } =
    useAndroidImageCropNavigationBar();

  const openPickerWithAndroidFixes = async (options: any = {}) => {
    try {
      // Hide navigation bar before opening picker
      hideNavigationBarForCrop();

      const androidConfig = getAndroidImagePickerConfig();
      const iosConfig = getIOSImagePickerConfig();
      const platformConfig =
        Platform.OS === 'android' ? androidConfig : iosConfig;
      const config = {
        width: 1200,
        height: 1600,
        cropping: true,
        multiple: false,
        mediaType: 'photo',
        freeStyleCropEnabled: true,
        ...platformConfig,
        ...options,
      };

      const result = await ImagePicker.openPicker(config);

      // Show navigation bar after picker is closed
      showNavigationBarAfterCrop();

      return result;
    } catch (error) {
      // Always show navigation bar on error
      showNavigationBarAfterCrop();
      throw error;
    }
  };

  const openCameraWithAndroidFixes = async (options: any = {}) => {
    try {
      // Hide navigation bar before opening camera
      hideNavigationBarForCrop();

      const androidConfig = getAndroidImagePickerConfig();
      const iosConfig = getIOSImagePickerConfig();
      const platformConfig =
        Platform.OS === 'android' ? androidConfig : iosConfig;
      const config = {
        width: 1200,
        height: 1600,
        cropping: true,
        mediaType: 'photo',
        includeBase64: false,
        multiple: false,
        useFrontCamera: true,
        cropperCircleOverlay: true,
        showCropFrame: true,
        cropperTintColor: 'white',
        cropperStrokeColor: 'white',
        cropperStrokeWidth: 2,
        cropperActiveOpacity: 0.7,
        freeStyleCropEnabled: true,
        ...platformConfig,
        ...options,
      };

      const result = await ImagePicker.openCamera(config);

      // Show navigation bar after camera is closed
      showNavigationBarAfterCrop();

      return result;
    } catch (error) {
      // Always show navigation bar on error
      showNavigationBarAfterCrop();
      throw error;
    }
  };

  const openCropperWithAndroidFixes = async (
    path: string,
    options: any = {},
  ) => {
    try {
      // Hide navigation bar before opening cropper
      hideNavigationBarForCrop();

      const androidConfig = getAndroidImagePickerConfig();
      const iosConfig = getIOSImagePickerConfig();
      const platformConfig =
        Platform.OS === 'android' ? androidConfig : iosConfig;
      const config = {
        path,
        width: 1200,
        height: 1600,
        cropping: true,
        mediaType: 'photo',
        freeStyleCropEnabled: true,
        ...platformConfig,
        ...options,
      };

      const result = await ImagePicker.openCropper(config);

      // Show navigation bar after cropper is closed
      showNavigationBarAfterCrop();

      return result;
    } catch (error) {
      // Always show navigation bar on error
      showNavigationBarAfterCrop();
      throw error;
    }
  };

  return {
    openPickerWithAndroidFixes,
    openCameraWithAndroidFixes,
    openCropperWithAndroidFixes,
  };
};
