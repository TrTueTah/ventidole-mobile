import { usePostView } from '@/hooks/usePostView';
import { components } from '@/schemas/openapi';
import { cn, formatISODate, formatNumber } from '@/utils';
import { Dimensions, Image, TouchableOpacity, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Verify from '../../icons/Verify';
import { AppText, Avatar, Icon } from '../../ui';
import { useNavigation } from '@react-navigation/native';

interface PostCardProps {
  post: components['schemas']['PostDto'];
  className?: string;
  onLike?: (postId: string) => void;
  onClick?: (postId: string) => void;
}

const PostCard = ({ post, className, onLike, onClick }: PostCardProps) => {
  const width = Dimensions.get('window').width;
  const { trackPostView } = usePostView();
  const navigation = useNavigation();

  const handleLikePress = () => {
    if (onLike) {
      onLike(post.id);
    }
  };

  const handleCardPress = () => {
    // Track the view in the background (fire-and-forget)
    trackPostView(post.id);

    if (onClick) {
      onClick(post.id);
    }
  };

  const handleAuthorPress = () => {
    navigation.navigate('ProfileStack', { userId: post.author.id });
  };

  return (
    <View
      className={cn(
        'bg-background py-3 gap-2 shadow-md shadow-neutrals900/20',
        className,
      )}
    >
      {/* Post Header */}
      <TouchableOpacity onPress={handleAuthorPress}>
        <View className="px-3 flex-row gap-2">
          <Avatar
            source={
              post.author.avatarUrl ? { uri: post.author.avatarUrl } : undefined
            }
            size="md"
            text={post.author.username.charAt(0).toUpperCase()}
          />
          <View className="flex-col justify-between py-0.5">
            <View className="flex-row items-center gap-1">
              <AppText variant="label" weight="bold">
                {post.author.username}
              </AppText>
              {post.author.role === 'IDOL' && <Verify size={14} />}
              {post.communityName && (
                <>
                  <AppText variant="labelSmall" color="muted">
                    •
                  </AppText>
                  <AppText variant="labelSmall" color="muted">
                    {post.communityName}
                  </AppText>
                </>
              )}
            </View>
            <AppText variant="labelSmall" color="muted">
              {formatISODate(post.createdAt)}
            </AppText>
          </View>
        </View>
      </TouchableOpacity>

      {/* Post Tags */}
      {post.tags && post.tags.length > 0 && (
        <View className="px-3 flex-row flex-wrap gap-1">
          {post.tags.map((tag, index) => (
            <AppText key={index} variant="bodySmall" color="muted">
              #{tag}
            </AppText>
          ))}
        </View>
      )}

      {/* Post Content */}
      <View className="px-3">
        <AppText variant="bodySmall">{post.content}</AppText>
      </View>

      {/* Post Images Carousel */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <Carousel
          loop={false}
          width={width}
          height={200}
          data={post.mediaUrls}
          renderItem={({ item, index }) => (
            <Image
              key={`${post.id}-${index}-${item}`}
              source={{ uri: item }}
              style={{ width, height: 200 }}
              resizeMode="cover"
            />
          )}
        />
      )}

      {/* Post Footer */}
      <View className="px-3 flex-row gap-2">
        <TouchableOpacity onPress={handleLikePress} disabled={!onLike}>
          <View className="flex-row items-center gap-1">
            <Icon name="Heart" className={'w-5 h-5 text-foreground'} />
            <AppText
              className={cn(post.isLiked ? 'text-primary' : 'text-foreground')}
            >
              {formatNumber(post.likeCount)}
            </AppText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCardPress}>
          <View className="flex-row items-center gap-1">
            <Icon name="MessageCircle" className="w-5 h-5 text-foreground" />
            <AppText
              className={cn(post.isLiked ? 'text-primary' : 'text-foreground')}
            >
              {formatNumber(post.commentCount)}
            </AppText>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostCard;
