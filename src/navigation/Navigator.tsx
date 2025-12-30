import { useAuthStore } from '@/store/authStore';
import AppStackNavigator from './AppStackNavigator';
import AuthStackNavigator from './AuthStackNavigator';

const Navigator = () => {
  const { isLogin, isChooseCommunity } = useAuthStore();

  // Show AppStack only if user is logged in AND has chosen communities
  const shouldShowApp = isLogin && isChooseCommunity;

  return shouldShowApp ? <AppStackNavigator /> : <AuthStackNavigator />;
};

export default Navigator;
