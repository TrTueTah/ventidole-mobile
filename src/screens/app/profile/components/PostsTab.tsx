import PostCard from '@/components/card/post-card/PostCard';
import PostCardSkeleton from '@/components/card/post-card/PostCardSkeleton';
import { AppText } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { components } from '@/schemas/openapi';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from 'react-native';
import { useUserPosts } from '../hooks/useUserPosts';

interface PostsTabProps {
  userId: string;
}

const PostsTab = ({ userId }: PostsTabProps) => {
  const colors = useColors();
  const navigation = useNavigation();
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<components['schemas']['PostDto'][]>(
    [],
  );

  const { posts, isLoading, refetch } = useUserPosts({
    userId,
    page,
    limit: 10,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Update allPosts when posts change
  useEffect(() => {
    if (posts.length > 0) {
      if (page === 1) {
        setAllPosts(posts);
      } else {
        setAllPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = posts.filter(p => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
      }
      setIsLoadingMore(false);
    }
  }, [posts, page]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    await refetch();
    setIsRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && posts.length === 10) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    }
  };

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View className="py-4 items-center justify-center">
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }
    return null;
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View>
          {Array.from({ length: 3 }).map((_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-20">
        <AppText variant="body" color="muted" className="text-center">
          No posts yet.
        </AppText>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={allPosts}
        keyExtractor={(item: components['schemas']['PostDto']) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onClick={() =>
              navigation.navigate('PostStack' as any, {
                postId: item.id,
                communityId: item.communityId,
                authorId: item.author.id,
              })
            }
          />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
};

export default PostsTab;
