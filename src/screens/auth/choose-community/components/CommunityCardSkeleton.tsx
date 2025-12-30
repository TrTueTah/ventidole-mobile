import { useColors } from '@/hooks/useColors';
import { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const CommunityCardSkeleton = () => {
  const colors = useColors();
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 48) / 2; // 48 = padding (16*2) + gap (16)
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View
      className="rounded-2xl mb-4 bg-background"
      style={{
        width: itemWidth,
        shadowColor: colors.neutrals400,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="p-3">
        {/* Avatar Skeleton */}
        <View className="items-center mb-3">
          <Animated.View
            style={[animatedStyle, { backgroundColor: colors.neutrals200 }]}
            className="w-20 h-20 rounded-full"
          />
        </View>

        {/* Info Skeleton */}
        <View className="items-center gap-2">
          <Animated.View
            style={[animatedStyle, { backgroundColor: colors.neutrals200 }]}
            className="w-24 h-4 rounded"
          />
          <Animated.View
            style={[animatedStyle, { backgroundColor: colors.neutrals200 }]}
            className="w-16 h-3 rounded"
          />
        </View>
      </View>
    </View>
  );
};

export default CommunityCardSkeleton;
