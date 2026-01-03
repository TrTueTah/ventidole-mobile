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

const SkeletonBox: React.FC<{ className?: string; style?: any }> = ({
  className,
  style,
}) => {
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
      className={cn('bg-neutrals800 overflow-hidden rounded', className)}
      style={style}
    >
      <Animated.View
        style={[animatedStyle]}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-neutrals700 to-transparent opacity-50 w-full h-full"
      />
    </View>
  );
};

const CommunitySkeleton = () => {
  return (
    <View className="flex-1 bg-background">
      {/* Cover Image Skeleton */}
      <SkeletonBox className="w-full rounded-none" style={{ height: 240 }} />

      {/* Community Info Skeleton */}
      <View className="px-4 py-4 bg-background border-b border-neutrals900/10">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 pr-3">
            {/* Community Name */}
            <SkeletonBox className="w-48 h-6 mb-2" />
            {/* Member Count */}
            <SkeletonBox className="w-32 h-4" />
          </View>

          {/* Join Button */}
          <SkeletonBox className="w-24 h-9 rounded-md" />
        </View>
      </View>

      {/* Tab Bar Skeleton */}
      <View className="flex-row bg-background border-b border-neutrals900/10">
        <View className="flex-1 py-4 items-center">
          <SkeletonBox className="w-16 h-5" />
        </View>
        <View className="flex-1 py-4 items-center">
          <SkeletonBox className="w-16 h-5" />
        </View>
        <View className="flex-1 py-4 items-center">
          <SkeletonBox className="w-16 h-5" />
        </View>
      </View>

      {/* Content Area Skeleton */}
      <View className="px-4 py-4">
        {/* About Section Skeleton */}
        <SkeletonBox className="w-full h-4 mb-2" />
        <SkeletonBox className="w-full h-4 mb-2" />
        <SkeletonBox className="w-3/4 h-4 mb-4" />

        {/* Stats or Additional Info */}
        <View className="flex-row gap-4 mb-4">
          <SkeletonBox className="flex-1 h-20 rounded-lg" />
          <SkeletonBox className="flex-1 h-20 rounded-lg" />
        </View>

        {/* More Content Lines */}
        <SkeletonBox className="w-full h-4 mb-2" />
        <SkeletonBox className="w-5/6 h-4 mb-2" />
        <SkeletonBox className="w-4/6 h-4" />
      </View>
    </View>
  );
};

export default CommunitySkeleton;
