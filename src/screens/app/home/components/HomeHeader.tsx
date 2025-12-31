import Logo from '@/components/icons/Logo';
import { Avatar, Icon } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { Pressable, View } from 'react-native';

const HomeHeader = () => {
  const userData = useAuthStore(state => state.userData);

  return (
    <View
      className={
        'px-4 py-2 pt-safe-offset-0 flex-row justify-between items-center'
      }
    >
      <Avatar
        text={userData?.username || 'User'}
        source={
          userData?.avatarUrl
            ? { uri: userData.avatarUrl as unknown as string }
            : undefined
        }
        size={'md'}
      />
      <Logo />
      <Pressable
        className={
          'bg-background border border-neutrals900 w-12 h-12 rounded-full justify-center items-center'
        }
      >
        <Icon name={'Bell'} className={'text-foreground w-6 h-6'} />
      </Pressable>
    </View>
  );
};

export default HomeHeader;
