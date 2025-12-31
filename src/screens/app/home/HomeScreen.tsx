import PostCard from '@/components/card/post-card/PostCard';
import PostCardSkeleton from '@/components/card/post-card/PostCardSkeleton';
import { AppText } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { components } from '@/schemas/openapi';
import { useCallback } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import CommunityList from './components/CommunityList';
import HomeBanner from './components/HomeBanner';
import HomeHeader from './components/HomeHeader';
import { useRecommendPosts } from './hooks/useRecommendPosts';

const HomeScreen = () => {
  const {
    posts,
    isLoading: isLoadingPosts,
    isLoadingMore: isLoadingMorePosts,
    isRefreshing: isRefreshingPosts,
    hasMore: hasMorePosts,
    loadMore: loadMorePosts,
    refresh: refreshPosts,
  } = useRecommendPosts({
    limit: 8,
  });

  const colors = useColors();

  const handleEndReached = useCallback(() => {
    if (hasMorePosts && !isLoadingMorePosts) {
      loadMorePosts();
    }
  }, [hasMorePosts, isLoadingMorePosts, loadMorePosts]);

  const renderEmptyState = () => {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <AppText className="text-neutrals500">No posts available.</AppText>
      </View>
    );
  };

  const renderFooter = () => {
    if (isLoadingMorePosts) {
      return (
        <View className="py-4 items-center justify-center">
          <AppText className="text-neutrals500">Loading more posts...</AppText>
        </View>
      );
    }
    return null;
  };

  const renderLoadingPost = () => {
    return (
      <View>
        {Array.from({ length: 3 }).map((_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <HomeHeader />
      <FlatList
        data={posts}
        keyExtractor={(item: components['schemas']['PostDto']) => item.id}
        ListHeaderComponent={
          <View>
            <CommunityList />
            <HomeBanner />
            {(isLoadingPosts || isRefreshingPosts) && renderLoadingPost()}
          </View>
        }
        renderItem={({ item }) => <PostCard post={item} />}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!isLoadingPosts ? renderEmptyState() : null}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshingPosts}
            onRefresh={refreshPosts}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.background}
          />
        }
      />
    </View>
  );
};

export default HomeScreen;
