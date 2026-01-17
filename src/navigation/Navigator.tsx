import { useAuthStore } from '@/store/authStore';
import AppStackNavigator from './AppStackNavigator';
import AuthStackNavigator from './AuthStackNavigator';

const Navigator = () => {
  const { isLogin, isChooseCommunity } = useAuthStore();

  // Show AppStack only if user is logged in AND has chosen communities
  const shouldShowApp = isLogin && isChooseCommunity;

  console.log(
    '[Navigator] Render - isLogin:',
    isLogin,
    'isChooseCommunity:',
    isChooseCommunity,
    'shouldShowApp:',
    shouldShowApp,
  );

  return shouldShowApp ? <AppStackNavigator /> : <AuthStackNavigator />;
};

export default Navigator;
