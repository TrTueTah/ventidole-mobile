import { View } from 'react-native';

const ProductCardSkeleton = () => {
  return (
    <View className="w-[48%] mb-4">
      {/* Image Skeleton */}
      <View className="w-full aspect-square bg-neutrals900 rounded-lg mb-2 animate-pulse" />
      {/* Title Skeleton */}
      <View className="w-full h-3 bg-neutrals900 rounded mb-1 animate-pulse" />
      <View className="w-3/4 h-3 bg-neutrals900 rounded mb-2 animate-pulse" />
      {/* Price Skeleton */}
      <View className="w-20 h-4 bg-neutrals900 rounded animate-pulse" />
    </View>
  );
};

export default ProductCardSkeleton;
