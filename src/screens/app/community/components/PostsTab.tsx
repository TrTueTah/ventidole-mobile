import PostCard from '@/components/card/post-card/PostCard';
import PostCardSkeleton from '@/components/card/post-card/PostCardSkeleton';
import { AppText } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { components } from '@/schemas/openapi';
import { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';
import { useCommunityPosts } from '../hooks/useCommunityPosts';
import CreatePostModal, { CreatePostModalRef } from './CreatePostModal';

interface PostsTabProps {
  communityId: string;
}

const PostsTab = ({ communityId }: PostsTabProps) => {
  const colors = useColors();
  const createPostModalRef = useRef<CreatePostModalRef>(null);

  const {
    posts,
    isLoading,
    isLoadingMore,
    isRefreshing,
    hasMore,
    loadMore,
    refresh,
  } = useCommunityPosts({ communityId, limit: 10 });

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4 items-center justify-center">
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [isLoadingMore, colors.primary]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View className="gap-3 py-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-20">
        <AppText variant="body" color="muted" className="text-center">
          No posts yet. Be the first to post!
        </AppText>
      </View>
    );
  }, [isLoading]);

  const renderHeader = useCallback(() => {
    return (
      <View className="px-4 py-3 bg-background border-b border-neutrals900">
        <Pressable
          onPress={() => createPostModalRef.current?.open()}
          className="flex-row items-center gap-3 p-4 border border-neutrals800 rounded-full active:bg-neutrals900"
        >
          <AppText variant="body" color="muted">
            What's on your mind?
          </AppText>
        </Pressable>
      </View>
    );
  }, []);

  return (
    <View className="flex-1">
      <FlatList
        data={posts}
        keyExtractor={(item: components['schemas']['PostDto']) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <CreatePostModal
        ref={createPostModalRef}
        communityId={communityId}
        onSuccess={refresh}
      />
    </View>
  );
};

export default PostsTab;
