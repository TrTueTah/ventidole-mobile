import { AppText, Avatar } from '@/components/ui';
import { components } from '@/schemas/openapi';
import { cn, formatISODate } from '@/utils';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Verify from '../../icons/Verify';

interface CommentCardProps {
  comment: components['schemas']['CommentDto'];
  onCommentClick?: () => void;
  className?: string;
}

const CommentCard = ({
  comment,
  onCommentClick,
  className,
}: CommentCardProps) => {
  const { t } = useTranslation();
  const user = comment.user as any;

  return (
    <View className={cn('px-4 py-3', className)}>
      <View className="flex-row gap-3">
        {/* Avatar */}
        <Avatar
          source={{ uri: user?.avatarUrl }}
          text={user?.username || 'User'}
          size="sm"
          className="absolute z-10"
        />

        {/* Comment Content */}
        <View className="flex-1 border border-neutrals500 rounded-2xl px-3 py-4 ml-5">
          {/* User Info */}
          <View className="flex-row items-center gap-1 mb-1">
            <AppText variant="labelSmall" weight="bold">
              {user?.username || 'Unknown'}
            </AppText>
            {user?.isVerified && <Verify className="w-3 h-3" />}
            <AppText variant="labelSmall" color="muted" className="ml-1">
              {formatISODate(comment.createdAt, t)}
            </AppText>
          </View>

          {/* Comment Text */}
          <AppText variant="bodySmall" className="mb-2">
            {comment.content}
          </AppText>
        </View>
      </View>
    </View>
  );
};

export default CommentCard;
