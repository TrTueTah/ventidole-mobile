import { View } from 'react-native';

const CommentSkeletonCard = () => {
  return (
    <View className="px-4 py-3 flex-row gap-3">
      {/* Avatar Skeleton */}
      <View className="w-8 h-8 rounded-full bg-neutrals800" />

      {/* Content Skeleton */}
      <View className="flex-1 gap-2">
        <View className="flex-row gap-2">
          <View className="w-20 h-3 bg-neutrals800 rounded" />
          <View className="w-12 h-3 bg-neutrals800 rounded" />
        </View>
        <View className="w-full h-3 bg-neutrals800 rounded" />
        <View className="w-3/4 h-3 bg-neutrals800 rounded" />
        <View className="flex-row gap-4 mt-1">
          <View className="w-10 h-3 bg-neutrals800 rounded" />
          <View className="w-10 h-3 bg-neutrals800 rounded" />
        </View>
      </View>
    </View>
  );
};

const CommentLoadingSkeletons = () => {
  return (
    <View>
      {Array.from({ length: 3 }).map((_, index) => (
        <CommentSkeletonCard key={index} />
      ))}
    </View>
  );
};

export default CommentLoadingSkeletons;
