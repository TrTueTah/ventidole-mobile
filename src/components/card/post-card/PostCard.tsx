import { components } from '@/schemas/openapi';
import { cn, formatISODate, formatNumber } from '@/utils';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Verify from '../../icons/Verify';
import { AppImage, AppText, Avatar, Icon } from '../../ui';

interface PostCardProps {
  post: components['schemas']['PostDto'];
  className?: string;
  onLike?: (postId: string) => void;
  onClick?: (postId: string) => void;
}

const PostCard = ({ post, className, onLike, onClick }: PostCardProps) => {
  const width = Dimensions.get('window').width;

  const handleLikePress = () => {
    if (onLike) {
      onLike(post.id);
    }
  };

  const handleCardPress = () => {
    if (onClick) {
      onClick(post.id);
    }
  };

  return (
    <View
      className={cn(
        'bg-background py-3 gap-2 shadow-md shadow-neutrals900/20',
        className,
      )}
    >
      {/* Post Header */}
      <View className="px-3 flex-row gap-2">
        <Avatar source={{ uri: post.author.avatarUrl }} size="md" />
        <View className="flex-col justify-between py-0.5">
          <View className="flex-row items-center gap-1">
            <AppText variant="label" weight="bold">
              {post.author.username}
            </AppText>
            <Verify className="w-4 h-4" />
          </View>
          <AppText variant="labelSmall" color="muted">
            {formatISODate(post.createdAt)}
          </AppText>
        </View>
      </View>

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
            <AppImage
              key={`${post.id}-${index}-${item}`}
              source={{ uri: item }}
              size="full"
              className="h-[200px]"
              resizeMode="cover"
              onLoadStart={() => {
                console.log(
                  `[PostCard] Image loading started - Post ID: ${post.id}, Index: ${index}, URL: ${item}`,
                );
              }}
              onLoadEnd={() => {
                console.log(
                  `[PostCard] Image loaded successfully - Post ID: ${post.id}, Index: ${index}`,
                );
              }}
              onError={error => {
                console.error(
                  `[PostCard] Image failed to load - Post ID: ${post.id}, Index: ${index}, URL: ${item}`,
                  error,
                );
              }}
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
