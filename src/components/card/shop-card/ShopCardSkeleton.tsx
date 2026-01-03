import { View } from 'react-native';

const ShopCardSkeleton = () => {
  return (
    <View className="bg-background rounded-2xl shadow-lg shadow-neutrals900/20 overflow-hidden mb-4">
      {/* Header Skeleton */}
      <View className="bg-primary px-4 py-4">
        <View className="w-32 h-6 bg-white/20 rounded animate-pulse" />
      </View>

      {/* Products Skeleton */}
      <View className="py-4 flex-row px-4 gap-4">
        {[1, 2, 3].map(index => (
          <View key={index} className="w-[140px]">
            {/* Image Skeleton */}
            <View className="w-[140px] h-[140px] bg-neutrals900 rounded-lg mb-2 animate-pulse" />
            {/* Title Skeleton */}
            <View className="w-full h-3 bg-neutrals900 rounded mb-1 animate-pulse" />
            <View className="w-3/4 h-3 bg-neutrals900 rounded mb-2 animate-pulse" />
            {/* Price Skeleton */}
            <View className="w-20 h-4 bg-neutrals900 rounded animate-pulse" />
          </View>
        ))}
      </View>
    </View>
  );
};

export default ShopCardSkeleton;
