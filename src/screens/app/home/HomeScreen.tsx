import PostCard from '@/components/card/post-card/PostCard';
import PostCardSkeleton from '@/components/card/post-card/PostCardSkeleton';
import { AppText } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { components } from '@/schemas/openapi';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
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
  const navigation = useNavigation();
  const scrollY = useSharedValue(0);
  const lastScrollY = useRef(0);
  const headerVisible = useSharedValue(true);

  const handleScroll = useCallback(
    (event: any) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const delta = currentScrollY - lastScrollY.current;

      // Only hide/show header when scrolled past a threshold
      if (currentScrollY > 50) {
        if (delta > 5 && headerVisible.value) {
          // Scrolling down - hide header
          headerVisible.value = false;
        } else if (delta < -5 && !headerVisible.value) {
          // Scrolling up - show header
          headerVisible.value = true;
        }
      } else {
        // Always show header when near the top
        headerVisible.value = true;
      }

      lastScrollY.current = currentScrollY;
      scrollY.value = currentScrollY;
    },
    [headerVisible, scrollY],
  );

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
      <HomeHeader headerVisible={headerVisible} />
      <FlatList
        data={posts}
        keyExtractor={(item: components['schemas']['PostDto']) => item.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 108 }}
        ListHeaderComponent={
          <View>
            <CommunityList />
            <HomeBanner />
            {(isLoadingPosts || isRefreshingPosts) && renderLoadingPost()}
          </View>
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onClick={() =>
              navigation.navigate('PostStack', { postId: item.id })
            }
          />
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!isLoadingPosts ? renderEmptyState() : null}
        bounces={!isRefreshingPosts}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshingPosts}
            onRefresh={refreshPosts}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
};

export default HomeScreen;
