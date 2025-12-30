import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import type { RootStackScreenProps } from '@/navigation/types';
import { useNavigation, useRoute } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { Check } from 'lucide-react-native';
import { View } from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const successAnimation = require('../../../../assets/animations/success.json');

type AuthCompleteRouteParams =
  RootStackScreenProps<'AuthComplete'>['route']['params'];

const AuthCompleteScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = route.params as AuthCompleteRouteParams;
  const { type } = params || {};

  const isRegister = type === 'register';

  const title = isRegister
    ? 'Registration Complete!'
    : 'Password Reset Complete!';
  const subtitle = isRegister
    ? 'Welcome to Ventidole! Your account has been successfully created.'
    : 'Your password has been successfully reset. You can now sign in with your new password.';
  const buttonText = isRegister ? 'Get Started' : 'Back to Login';

  const handleOnPress = () => {
    if (isRegister) {
      navigation.navigate('ChooseCommunity');
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    }
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Background Animation */}
      <View className="absolute inset-0">
        <LottieView
          source={successAnimation}
          autoPlay
          loop={false}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
        />
      </View>

      {/* Content */}
      <Animated.View
        entering={SlideInRight.delay(200)}
        className="flex-1 justify-center items-center px-6 gap-6"
      >
        {/* Success Icon */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          className="w-40 h-40 bg-success/10 rounded-full items-center justify-center"
        >
          <View className="w-32 h-32 bg-success/20 rounded-full items-center justify-center">
            <View className="w-24 h-24 bg-success rounded-full items-center justify-center">
              <Check size={48} color="white" strokeWidth={3} />
            </View>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View
          entering={FadeInDown.delay(600)}
          className="items-center"
        >
          <AppText className="text-foreground font-sans-bold text-2xl text-center">
            {title}
          </AppText>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View
          entering={FadeInDown.delay(800)}
          className="items-center"
        >
          <AppText className="text-neutrals300 font-sans-light-italic text-lg text-center max-w-sm">
            {subtitle}
          </AppText>
        </Animated.View>

        {/* Button */}
        <Animated.View entering={FadeInDown.delay(1000)} className="w-full">
          <AppButton variant="primary" onPress={handleOnPress}>
            {buttonText}
          </AppButton>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default AuthCompleteScreen;
