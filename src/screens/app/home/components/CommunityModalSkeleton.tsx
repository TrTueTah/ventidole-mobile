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
    <View className={cn('bg-neutrals800 overflow-hidden rounded', className)}>
      <Animated.View
        style={[animatedStyle]}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-neutrals700 to-transparent opacity-50 w-full h-full"
      />
    </View>
  );
};

const CommunityModalSkeleton: React.FC = () => {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(index => (
        <View
          key={index}
          className="flex-row items-center px-4 py-4 border-b border-neutrals800"
        >
          {/* Avatar Skeleton */}
          <SkeletonBox className="w-14 h-14 rounded-3xl mr-3" />

          {/* Content Skeleton */}
          <View className="flex-1 justify-center gap-2">
            <SkeletonBox className="w-32 h-4" />
            <SkeletonBox className="w-20 h-3" />
          </View>

          {/* Button Skeleton */}
          <SkeletonBox className="w-20 h-9 rounded-full" />
        </View>
      ))}
    </>
  );
};

export default CommunityModalSkeleton;
