import PostCard from '@/components/card/post-card/PostCard';
import PostCardSkeleton from '@/components/card/post-card/PostCardSkeleton';
import { AppText } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { components } from '@/schemas/openapi';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from 'react-native';
import { useCommunityPosts } from '../hooks/useCommunityPosts';

interface ArtistTabProps {
  communityId: string;
}

const ArtistTab = ({ communityId }: ArtistTabProps) => {
  const colors = useColors();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const {
    posts,
    isLoading,
    isLoadingMore,
    isRefreshing,
    hasMore,
    loadMore,
    refresh,
  } = useCommunityPosts({ communityId, limit: 10, authorFilter: 'idol' });

  const handleEndReached = () => {
    if (hasMore && !isLoadingMore) {
      loadMore();
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
          {t('APP.COMMUNITY.NO_POSTS_FOUND')}
        </AppText>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={posts}
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
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
};

export default ArtistTab;
