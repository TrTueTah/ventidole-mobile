import { useAuthStore } from '@/store/authStore';
import AppStackNavigator from './AppStackNavigator';
import AuthStackNavigator from './AuthStackNavigator';

const Navigator = () => {
  const { isLogin } = useAuthStore();
  return isLogin ? <AppStackNavigator /> : <AuthStackNavigator />;
};

export default Navigator;
