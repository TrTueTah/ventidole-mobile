import { AppText, Avatar } from '@/components/ui';
import Icon from '@/components/ui/Icon.tsx';
import MenuList from '@/components/ui/MenuList.tsx';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigation } from '@react-navigation/native';
import { Alert, Text, View } from 'react-native';

const MoreScreen = () => {
  const navigation = useNavigation();
  const theme = useAppStore(state => state.theme);
  const logout = useAuthStore(state => state.logout);

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleComponentsDemo = () => {
    navigation.navigate('ComponentsDemo');
  };

  const handleAbout = () => {
    navigation.navigate('About');
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
        },
      },
    ]);
  };

  return (
    <View className="flex-1 p-4 pt-safe-offset-4">
      <AppText variant={'heading1'}>MORE</AppText>

      <View className={'bg-neutrals1000 flex flex-row p-4 rounded-3xl'}>
        <Avatar text={'John Doe'} size={'xl'} />
        <View className={'flex-1 justify-center ml-4'}>
          <Text className={'text-foreground font-sans-bold text-lg'}>
            John Doe
          </Text>
          <Text className={'text-neutrals500 font-sans-regular text-md'}>
            john@doe.com
          </Text>
        </View>
      </View>
      <View className={'py-4'}>
        <Text className={'section-title'}>General</Text>
      </View>
      <MenuList
        data={[
          {
            icon: () => (
              <Icon name={'SunMoon'} className={'size-22 text-neutrals100'} />
            ),
            title: 'Theme',
            value: (
              <AppText className={'capitalize text-neutrals100'}>
                {theme}
              </AppText>
            ),
            onPress: handleSettings,
          },
          {
            icon: () => (
              <Icon name={'Bell'} className={'size-22 text-neutrals100'} />
            ),
            title: 'Notifications',
          },
        ]}
      />
      <View className={'py-4'}>
        <Text className={'section-title'}>Other</Text>
      </View>
      <MenuList
        data={[
          {
            icon: () => (
              <Icon name={'Settings'} className={'size-22 text-neutrals100'} />
            ),
            title: 'Settings',
            onPress: handleSettings,
          },
          {
            icon: () => (
              <Icon name={'Palette'} className={'size-22 text-neutrals100'} />
            ),
            title: 'Components Demo',
            onPress: handleComponentsDemo,
          },
          {
            icon: () => (
              <Icon name={'Gavel'} className={'size-22 text-neutrals100'} />
            ),
            title: 'Privacy Policy',
          },
          {
            icon: () => (
              <Icon name={'Info'} className={'size-22 text-neutrals100'} />
            ),
            title: 'About',
            onPress: handleAbout,
          },
          {
            icon: () => (
              <Icon name={'LogOut'} className={'size-22 text-error'} />
            ),
            title: 'Logout',
            onPress: handleLogout,
          },
        ]}
      />
    </View>
  );
};

export default MoreScreen;
