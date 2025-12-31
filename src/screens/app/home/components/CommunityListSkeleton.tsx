import { cn } from '@/utils';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const SkeletonBox: React.FC<{ className?: string }> = ({ className }) => {
  const shimmerAnimation = useSharedValue(0);

  useEffect(() => {
    shimmerAnimation.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerAnimation.value, [0, 1], [-300, 300]);

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      className={cn('bg-neutrals800 overflow-hidden rounded-3xl', className)}
    >
      <Animated.View
        style={[animatedStyle]}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-neutrals700 to-transparent opacity-50 w-full h-full"
      />
    </View>
  );
};

const CommunityListSkeleton: React.FC = () => {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map(index => (
        <View key={index} className="flex-col items-center gap-2 w-24">
          <SkeletonBox className="w-20 h-20" />
          <SkeletonBox className="w-16 h-3" />
        </View>
      ))}
    </>
  );
};

export default CommunityListSkeleton;
