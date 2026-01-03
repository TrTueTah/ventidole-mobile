import Logo from '@/components/icons/Logo';
import { Icon } from '@/components/ui';
import { useNavigation } from '@react-navigation/native';
import { Pressable } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface ShopHeaderProps {
  headerVisible: SharedValue<boolean>;
}
const ShopHeader = ({ headerVisible }: ShopHeaderProps) => {
  const navigation = useNavigation();
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

  const handleGoToCart = () => {
    // Navigation logic to go to Cart screen
    navigation.navigate('Cart');
  };

  return (
    <Animated.View
      style={animatedStyle}
      className={
        'px-4 py-2 pt-safe-offset-0 flex-row justify-between items-center bg-background'
      }
    >
      <Logo />
      <Pressable
        className={
          'bg-background border border-neutrals900 w-12 h-12 rounded-full justify-center items-center'
        }
        onPress={handleGoToCart}
      >
        <Icon name={'ShoppingCart'} className={'text-foreground w-6 h-6'} />
      </Pressable>
    </Animated.View>
  );
};

export default ShopHeader;
