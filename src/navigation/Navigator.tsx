import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { useAuthStore } from '@/store/authStore';
import AppStackNavigator from './AppStackNavigator';
import AuthStackNavigator from './AuthStackNavigator';

const Navigator = () => {
  const { isLogin } = useAuthStore();

  // Fetch current user data when logged in
  useGetCurrentUser();

  // Show AppStack only if user is logged in AND has chosen communities
  const shouldShowApp = isLogin;

  return shouldShowApp ? <AppStackNavigator /> : <AuthStackNavigator />;
};

export default Navigator;
