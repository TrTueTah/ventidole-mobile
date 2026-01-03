import { View } from 'react-native';

const ShopListSkeleton = () => {
  return (
    <View className="flex-col items-center gap-2 w-24">
      {/* Avatar Skeleton */}
      <View className="w-20 h-20 bg-neutrals900 rounded-full animate-pulse" />
      {/* Name Skeleton */}
      <View className="w-16 h-3 bg-neutrals900 rounded animate-pulse" />
    </View>
  );
};

export default ShopListSkeleton;
