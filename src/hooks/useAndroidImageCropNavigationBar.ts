import { Platform, StatusBar } from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';

// Hook to manage Android navigation bar and status bar during image crop operations
export const useAndroidImageCropNavigationBar = () => {
  const hideNavigationBarForCrop = () => {
    if (Platform.OS === 'android') {
      // Hide navigation bar and status bar before opening image crop
      SystemNavigationBar.navigationHide();
      SystemNavigationBar.immersive();

      // Hide status bar
      StatusBar.setHidden(true, 'fade');
    }
  };

  const showNavigationBarAfterCrop = () => {
    if (Platform.OS === 'android') {
      // Keep navigation bar hidden (we want it hidden permanently)
      SystemNavigationBar.navigationHide();
      SystemNavigationBar.immersive();

      // Show status bar again
      StatusBar.setHidden(false, 'fade');
    }
  };

  return {
    hideNavigationBarForCrop,
    showNavigationBarAfterCrop,
  };
};
