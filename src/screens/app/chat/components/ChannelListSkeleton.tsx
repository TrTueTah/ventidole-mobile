import { View } from 'react-native';

const ChannelItemSkeleton = () => {
  return (
    <View className="flex-row items-center px-4 py-3 border-b border-neutrals900">
      {/* Avatar Skeleton */}
      <View className="w-12 h-12 rounded-full bg-neutrals800 mr-3 animate-pulse" />

      {/* Content Skeleton */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-2">
          {/* Channel name skeleton */}
          <View className="h-4 w-32 bg-neutrals800 rounded animate-pulse" />
          {/* Time skeleton */}
          <View className="h-3 w-12 bg-neutrals800 rounded animate-pulse" />
        </View>
        <View className="flex-row items-center justify-between">
          {/* Last message skeleton */}
          <View className="h-3 w-48 bg-neutrals800 rounded animate-pulse" />
          {/* Unread badge skeleton */}
          <View className="w-5 h-5 rounded-full bg-neutrals800 animate-pulse" />
        </View>
      </View>
    </View>
  );
};

interface ChannelListSkeletonProps {
  count?: number;
}

const ChannelListSkeleton = ({ count = 5 }: ChannelListSkeletonProps) => {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <ChannelItemSkeleton key={`skeleton-${index}`} />
      ))}
    </View>
  );
};

export default ChannelListSkeleton;
