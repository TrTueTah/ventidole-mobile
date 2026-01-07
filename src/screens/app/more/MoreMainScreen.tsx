import { AppText, Avatar, Icon } from '@/components/ui';
import MenuList from '@/components/ui/MenuList';
import { useToast } from '@/components/ui/ToastProvider';
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { MoreStackParamList, RootStackParamList } from '@/navigation/types';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, ScrollView, View } from 'react-native';

const MoreMainScreen = () => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList & MoreStackParamList>
    >();
  const { user } = useGetCurrentUser();
  const { showSuccess } = useToast();
  const theme = useAppStore(state => state.theme);
  const logout = useAuthStore(state => state.logout);

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  const handleOrders = () => {
    navigation.navigate('Orders');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handlePrivacy = () => {
    navigation.navigate('Privacy');
  };

  const handleTerms = () => {
    navigation.navigate('Terms');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          showSuccess('Logged out successfully');
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 pt-safe-offset-4">
        <AppText variant="heading1" className="mb-6">
          MORE
        </AppText>

        {/* Profile Card */}
        <View className="bg-neutrals1000 flex-row p-4 rounded-3xl mb-6">
          <Avatar
            source={
              user?.avatarUrl ? { uri: String(user.avatarUrl) } : undefined
            }
            text={user?.username || user?.email || 'User'}
            size="xl"
          />
          <View className="flex-1 justify-center ml-4">
            <AppText variant="heading3" weight="bold" className="mb-1">
              {user?.username || 'User'}
            </AppText>
            <AppText variant="heading5" color="muted">
              {user?.email}
            </AppText>
          </View>
        </View>

        {/* Account Section */}
        <View className="py-2">
          <AppText variant="labelSmall" color="muted" className="mb-2 px-2">
            ACCOUNT
          </AppText>
        </View>
        <MenuList
          data={[
            {
              icon: () => (
                <Icon name="User" className="w-6 h-6 text-neutrals100" />
              ),
              title: 'Profile',
              onPress: handleProfile,
            },
            {
              icon: () => (
                <Icon name="ShoppingBag" className="w-6 h-6 text-neutrals100" />
              ),
              title: 'My Orders',
              onPress: handleOrders,
            },
          ]}
        />

        {/* Support Section */}
        <View className="py-4">
          <AppText variant="labelSmall" color="muted" className="mb-2 px-2">
            SUPPORT
          </AppText>
        </View>
        <MenuList
          data={[
            {
              icon: () => (
                <Icon name="Settings" className="w-6 h-6 text-neutrals100" />
              ),
              title: 'Settings',
              onPress: handleSettings,
            },
            {
              icon: () => (
                <Icon name="Shield" className="w-6 h-6 text-neutrals100" />
              ),
              title: 'Privacy Policy',
              onPress: handlePrivacy,
            },
            {
              icon: () => (
                <Icon name="FileText" className="w-6 h-6 text-neutrals100" />
              ),
              title: 'Terms of Service',
              onPress: handleTerms,
            },
            {
              icon: () => <Icon name="LogOut" className="w-6 h-6 text-error" />,
              title: 'Logout',
              onPress: handleLogout,
            },
          ]}
        />

        <View className="pb-safe-offset-8" />
      </View>
    </ScrollView>
  );
};

export default MoreMainScreen;
