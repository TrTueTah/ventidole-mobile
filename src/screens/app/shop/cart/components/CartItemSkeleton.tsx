import { View } from 'react-native';

const CartItemSkeleton = () => {
  return (
    <View className="bg-background p-4 border-b-8 border-neutrals900/5">
      {/* Header Skeleton */}
      <View className="flex-row justify-between items-center mb-1">
        <View className="w-32 h-4 bg-neutrals900 rounded animate-pulse" />
        <View className="w-6 h-6 bg-neutrals900 rounded animate-pulse" />
      </View>
      <View className="w-48 h-3 bg-neutrals900 rounded mb-4 animate-pulse" />

      {/* Item Container */}
      <View className="flex-row mb-3">
        {/* Checkbox Skeleton */}
        <View className="w-6 h-6 bg-neutrals900 rounded border-2 border-neutrals900/20 mr-3 mt-1 animate-pulse" />

        {/* Product Image Skeleton */}
        <View className="w-20 h-20 bg-neutrals900 rounded-lg animate-pulse" />

        {/* Product Info Skeleton */}
        <View className="flex-1 ml-3">
          <View className="w-3/4 h-4 bg-neutrals900 rounded mb-2 animate-pulse" />
          <View className="w-20 h-5 bg-neutrals900 rounded mb-1 animate-pulse" />
        </View>
      </View>

      {/* Price and Actions Skeleton */}
      <View className="flex-row justify-between items-center mt-2">
        <View className="w-24 h-5 bg-neutrals900 rounded animate-pulse" />

        <View className="flex-row items-center">
          {/* Quantity Controls Skeleton */}
          <View className="flex-row items-center bg-neutrals900/5 rounded-lg">
            <View className="w-8 h-8 bg-neutrals900 rounded-l-lg animate-pulse" />
            <View className="w-12 h-8 bg-neutrals900 mx-1 rounded animate-pulse" />
            <View className="w-8 h-8 bg-neutrals900 rounded-r-lg animate-pulse" />
          </View>
        </View>
      </View>

      {/* Buy Now Button Skeleton */}
      <View className="w-full h-10 bg-neutrals900 rounded-lg mt-3 animate-pulse" />
    </View>
  );
};

export default CartItemSkeleton;
