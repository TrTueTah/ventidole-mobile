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

interface PostCardSkeletonProps {
  className?: string;
  showImage?: boolean;
}

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

const PostCardSkeleton: React.FC<PostCardSkeletonProps> = ({
  className,
  showImage = true,
}) => {
  return (
    <View
      className={cn(
        'bg-background py-3 gap-2 shadow-md shadow-neutrals900/20',
        className,
      )}
    >
      {/* Post Header Skeleton */}
      <View className="px-3 flex-row gap-2">
        {/* Avatar Skeleton */}
        <SkeletonBox className="w-12 h-12 rounded-full" />

        <View className="flex-col justify-between py-0.5 flex-1">
          {/* Username Skeleton */}
          <SkeletonBox className="w-32 h-4 mb-1" />
          {/* Date Skeleton */}
          <SkeletonBox className="w-20 h-3" />
        </View>
      </View>

      {/* Post Content Skeleton */}
      <View className="px-3 gap-1">
        <SkeletonBox className="w-full h-3" />
        <SkeletonBox className="w-5/6 h-3" />
        <SkeletonBox className="w-4/6 h-3" />
      </View>

      {/* Post Image Skeleton */}
      {showImage && <SkeletonBox className="w-full h-[200px] rounded-none" />}

      {/* Post Footer Skeleton */}
      <View className="px-3 flex-row gap-4">
        <View className="flex-row items-center gap-1">
          <SkeletonBox className="w-5 h-5 rounded" />
          <SkeletonBox className="w-8 h-3" />
        </View>
        <View className="flex-row items-center gap-1">
          <SkeletonBox className="w-5 h-5 rounded" />
          <SkeletonBox className="w-8 h-3" />
        </View>
      </View>
    </View>
  );
};

export default PostCardSkeleton;
