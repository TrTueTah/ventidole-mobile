import CommentCard from '@/components/card/comment-card/CommentCard';
import PostCard from '@/components/card/post-card/PostCard';
import PostCardSkeleton from '@/components/card/post-card/PostCardSkeleton';
import { AppInput, AppText, Icon } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { components } from '@/schemas/openapi';
import { formatNumber } from '@/utils';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';
import CommentLoadingSkeletons from './components/CommentLoadingSkeletons';
import EmptyComments from './components/EmptyComments';
import { useCreateComment } from './hooks/useCreateComment';
import { useGetComments } from './hooks/useGetComments';
import { useGetPostDetail } from './hooks/useGetPostDetail';

type CommentDto = components['schemas']['CommentDto'];

interface PostScreenParams {
  postId: string;
  communityId?: string;
}

const PostScreen = () => {
  const route = useRoute<RouteProp<{ params: PostScreenParams }, 'params'>>();
  const { postId } = route.params;
  const colors = useColors();
  const [commentText, setCommentText] = useState('');

  const {
    post,
    isLoading: postLoading,
    error: postError,
    refresh: refreshPost,
  } = useGetPostDetail({ postId });

  const {
    comments,
    isLoading: commentsLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh: refreshComments,
    totalComments,
  } = useGetComments({
    postId,
    limit: 20,
  });

  const { createComment, isCreating } = useCreateComment({
    onSuccess: () => {
      setCommentText('');
      refreshComments();
    },
    onError: error => {
      console.error('Failed to create comment:', error);
    },
  });

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  const handleRefresh = useCallback(async () => {
    await refreshComments();
  }, [refreshComments]);

  const handleSubmitComment = useCallback(() => {
    const trimmedComment = commentText.trim();
    if (!trimmedComment || isCreating) {
      return;
    }

    createComment({
      postId,
      content: trimmedComment,
    });
  }, [commentText, postId, createComment, isCreating]);

  const renderCommentFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4 items-center justify-center">
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [isLoadingMore, colors.primary]);

  const renderComment = useCallback(({ item }: { item: CommentDto }) => {
    return <CommentCard comment={item} />;
  }, []);

  const renderListHeader = useCallback(
    () => (
      <View>
        {postLoading ? (
          <PostCardSkeleton />
        ) : post ? (
          <PostCard post={post} />
        ) : null}

        <View className="bg-background px-4 py-3 border-t border-neutrals900">
          <View className="flex-row items-baseline gap-2">
            <AppText variant="body" weight="semibold">
              Comments
            </AppText>
            <AppText variant="body" color="muted">
              ({formatNumber(totalComments || post?.commentCount || 0)})
            </AppText>
          </View>
        </View>

        {commentsLoading && <CommentLoadingSkeletons />}
      </View>
    ),
    [postLoading, post, totalComments, commentsLoading],
  );

  const renderEmptyComments = useCallback(() => {
    if (commentsLoading) return null;
    return <EmptyComments />;
  }, [commentsLoading]);

  if (postError || (post === null && !postLoading)) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-5">
        <AppText variant="body" color="muted" className="text-center">
          Failed to load post. Please try again.
        </AppText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={-20}
    >
      <View className="flex-1 bg-background">
        <FlatList
          data={comments}
          keyExtractor={(item: CommentDto) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderListHeader}
          renderItem={renderComment}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderCommentFooter}
          ListEmptyComponent={renderEmptyComments}
          refreshControl={
            <RefreshControl
              refreshing={commentsLoading && !postLoading}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />

        {/* Comment Input */}
        <View className="border-t border-neutrals900 bg-background px-4 py-3 pb-safe-offset-2 flex-row items-end gap-2">
          {/* <Pressable className="w-10 h-10 items-center justify-center flex-1">
            <Icon name="Heart" className="w-6 h-6 text-foreground" />
          </Pressable> */}
          <View className="flex-[8] overflow-visible max-h-40 min-h-10">
            <AppInput
              textAlignVertical="top"
              variant="comment"
              className="rounded-xl"
              placeholder="Write your comment..."
              numberOfLines={3}
              value={commentText}
              onChangeText={setCommentText}
              editable={!isCreating}
            />
          </View>
          <Pressable
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || isCreating}
            className="w-10 h-10 items-center justify-center flex-1"
          >
            {isCreating ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Icon name="SendHorizontal" className="w-6 h-6 text-primary" />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PostScreen;
