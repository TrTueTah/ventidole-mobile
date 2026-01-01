import { AppText, Icon } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { useNavigation } from '@react-navigation/native';
import { Animated, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CommunityHeaderProps {
  scrollY: Animated.Value;
  title?: string;
}

const CommunityHeader = ({ scrollY, title }: CommunityHeaderProps) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const colors = useColors();

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const backgroundColor = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: ['transparent', colors.background],
    extrapolate: 'clamp',
  });

  const borderBottomColor = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: ['transparent', colors.border],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 100, 150],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        paddingTop: insets.top,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor,
        borderBottomColor,
        borderBottomWidth: 1,
      }}
    >
      <View className="flex-row items-center justify-between w-full">
        <TouchableOpacity
          onPress={handleGoBack}
          className="w-10 h-10 items-center justify-center rounded-full"
          activeOpacity={0.7}
        >
          <Icon name="ChevronLeft" className="w-8 h-8 text-foreground" />
        </TouchableOpacity>

        <Animated.View style={{ opacity: titleOpacity }}>
          <AppText>{title}</AppText>
        </Animated.View>

        <View className="w-10 h-10" />
      </View>
    </Animated.View>
  );
};

export default CommunityHeader;
