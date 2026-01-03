import { cn } from '@/utils';
import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
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

const ProductDetailSkeleton = () => {
  return (
    <ScrollView className="flex-1 bg-background">
      {/* Image Skeleton */}
      <SkeletonBox className="w-full rounded-none h-[300px]" />

      {/* Product Info Skeleton */}
      <View className="p-4 border-b border-neutrals900/10">
        {/* Shop Name */}
        <SkeletonBox className="w-24 h-3 mb-2" />
        {/* Product Name */}
        <SkeletonBox className="w-3/4 h-5 mb-1" />
        <SkeletonBox className="w-1/2 h-5 mb-3" />
        {/* Price */}
        <SkeletonBox className="w-32 h-8 mb-2" />
        {/* Stock */}
        <SkeletonBox className="w-28 h-4" />
      </View>

      {/* Variants Section Skeleton */}
      <View className="p-4 border-b border-neutrals900/10">
        <SkeletonBox className="w-32 h-5 mb-3" />
        <View className="flex-row flex-wrap -mx-1">
          {[1, 2, 3].map(index => (
            <SkeletonBox
              key={index}
              className="h-10 px-5 py-3 rounded-full m-1"
              style={{ width: 100 }}
            />
          ))}
        </View>
      </View>

      {/* Purchase Button Skeleton */}
      <View className="p-4 border-b border-neutrals900/10">
        <SkeletonBox className="w-full h-12 rounded-lg" />
      </View>

      {/* Tabs Skeleton */}
      <View className="flex-row border-b border-neutrals900/10">
        <View className="flex-1 py-4 items-center">
          <SkeletonBox className="w-16 h-5" />
        </View>
        <View className="flex-1 py-4 items-center">
          <SkeletonBox className="w-16 h-5" />
        </View>
      </View>

      {/* Tab Content Skeleton */}
      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <SkeletonBox className="w-6 h-6 mr-2" />
          <SkeletonBox className="w-32 h-5" />
        </View>
        <SkeletonBox className="w-full h-4 mb-2" />
        <SkeletonBox className="w-full h-4 mb-2" />
        <SkeletonBox className="w-3/4 h-4 mb-2" />
        <SkeletonBox className="w-full h-4 mb-2" />
        <SkeletonBox className="w-5/6 h-4" />
      </View>
    </ScrollView>
  );
};

export default ProductDetailSkeleton;
