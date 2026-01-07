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

const ProfileSkeleton = () => {
  return (
    <View className="flex-1 bg-background">
      {/* Profile Header Skeleton */}
      <View className="px-4 py-6 bg-background border-b border-neutrals900/10">
        <View className="flex-row items-center mb-4">
          {/* Avatar Skeleton */}
          <SkeletonBox className="w-20 h-20 rounded-full mr-4" />

          {/* User Info Skeleton */}
          <View className="flex-1">
            {/* Username */}
            <SkeletonBox className="w-32 h-6 mb-2" />
            {/* Email */}
            <SkeletonBox className="w-48 h-4 mb-1" />
            {/* Bio */}
            <SkeletonBox className="w-40 h-4" />
          </View>
        </View>
      </View>

      {/* Tab Bar Skeleton */}
      <View className="flex-row bg-background border-b border-neutrals900/10">
        <View className="flex-1 py-4 items-center">
          <SkeletonBox className="w-16 h-5" />
        </View>
        <View className="flex-1 py-4 items-center">
          <SkeletonBox className="w-20 h-5" />
        </View>
      </View>

      {/* Content Area Skeleton - Post Cards */}
      <View className="px-4 py-4">
        {/* Post Card 1 */}
        <View className="mb-4 pb-4 border-b border-neutrals900/10">
          <View className="flex-row items-center mb-3">
            <SkeletonBox className="w-10 h-10 rounded-full mr-3" />
            <View className="flex-1">
              <SkeletonBox className="w-32 h-4 mb-1" />
              <SkeletonBox className="w-24 h-3" />
            </View>
          </View>
          <SkeletonBox className="w-full h-4 mb-2" />
          <SkeletonBox className="w-full h-4 mb-2" />
          <SkeletonBox className="w-3/4 h-4 mb-3" />
          <SkeletonBox className="w-full h-40 rounded-lg mb-3" />
          <View className="flex-row gap-4">
            <SkeletonBox className="w-16 h-8 rounded" />
            <SkeletonBox className="w-16 h-8 rounded" />
            <SkeletonBox className="w-16 h-8 rounded" />
          </View>
        </View>

        {/* Post Card 2 */}
        <View className="mb-4 pb-4 border-b border-neutrals900/10">
          <View className="flex-row items-center mb-3">
            <SkeletonBox className="w-10 h-10 rounded-full mr-3" />
            <View className="flex-1">
              <SkeletonBox className="w-32 h-4 mb-1" />
              <SkeletonBox className="w-24 h-3" />
            </View>
          </View>
          <SkeletonBox className="w-full h-4 mb-2" />
          <SkeletonBox className="w-5/6 h-4 mb-3" />
          <View className="flex-row gap-4">
            <SkeletonBox className="w-16 h-8 rounded" />
            <SkeletonBox className="w-16 h-8 rounded" />
            <SkeletonBox className="w-16 h-8 rounded" />
          </View>
        </View>

        {/* Post Card 3 */}
        <View className="mb-4">
          <View className="flex-row items-center mb-3">
            <SkeletonBox className="w-10 h-10 rounded-full mr-3" />
            <View className="flex-1">
              <SkeletonBox className="w-32 h-4 mb-1" />
              <SkeletonBox className="w-24 h-3" />
            </View>
          </View>
          <SkeletonBox className="w-full h-4 mb-2" />
          <SkeletonBox className="w-full h-4 mb-2" />
          <SkeletonBox className="w-2/3 h-4 mb-3" />
          <View className="flex-row gap-4">
            <SkeletonBox className="w-16 h-8 rounded" />
            <SkeletonBox className="w-16 h-8 rounded" />
            <SkeletonBox className="w-16 h-8 rounded" />
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProfileSkeleton;
