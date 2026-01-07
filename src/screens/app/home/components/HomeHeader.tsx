import Logo from '@/components/icons/Logo';
import { Avatar, Icon } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useNavigation } from '@react-navigation/native';
import { Pressable, TouchableOpacity } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface HomeHeaderProps {
  headerVisible: SharedValue<boolean>;
}

const HomeHeader = ({ headerVisible }: HomeHeaderProps) => {
  const userData = useAuthStore(state => state.userData);
  const navigation = useNavigation();

  const handleProfilePress = () => {
    // Navigate to profile screen
    navigation.navigate('ProfileStack', { userId: userData?.id || '' });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      transform: [
        {
          translateY: withTiming(headerVisible.value ? 0 : -100, {
            duration: 300,
          }),
        },
      ],
      opacity: withTiming(headerVisible.value ? 1 : 0, {
        duration: 300,
      }),
    };
  });

  return (
    <Animated.View
      style={animatedStyle}
      className={
        'px-4 py-2 pt-safe-offset-0 flex-row justify-between items-center bg-background'
      }
    >
      <TouchableOpacity onPress={handleProfilePress}>
        <Avatar
          text={userData?.username || 'User'}
          source={
            userData?.avatarUrl
              ? { uri: userData.avatarUrl as unknown as string }
              : undefined
          }
          size={'md'}
        />
      </TouchableOpacity>
      <Logo />
      <Pressable
        className={
          'bg-background border border-neutrals900 w-12 h-12 rounded-full justify-center items-center'
        }
      >
        <Icon name={'Bell'} className={'text-foreground w-6 h-6'} />
      </Pressable>
    </Animated.View>
  );
};

export default HomeHeader;
