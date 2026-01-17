import { AppText } from '@/components/ui';
import { formatMessageTime } from '@/utils/formatDate';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Channel } from 'stream-chat';

interface CustomChannelPreviewProps {
  channel: Channel;
  onSelect: () => void;
  isMyChannel?: boolean;
}

const CustomChannelPreview = ({
  channel,
  onSelect,
  isMyChannel = false,
}: CustomChannelPreviewProps) => {
  // Get channel name from metadata or generate from members
  const displayName = (channel.data as any)?.name || 'Unnamed Channel';
  const { t } = useTranslation();

  // Get last message - prioritize state.messages, fallback to lastMessage from backend
  const messages = channel.state?.messages || [];
  const lastMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;
  const lastMessageText = lastMessage?.text || 'No messages yet';

  // Get unread count
  const unread = channel.state?.unreadCount || 0;

  return (
    <Pressable
      onPress={onSelect}
      className="flex-row items-center px-4 py-3 border-b border-neutrals900"
    >
      {/* Channel Avatar/Icon */}
      <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mr-3">
        <AppText variant="body" weight="semibold" className="text-primary">
          {displayName.charAt(0).toUpperCase()}
        </AppText>
      </View>

      {/* Channel Info */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center flex-1 gap-2">
            <AppText
              variant="body"
              weight="semibold"
              numberOfLines={1}
              className="flex-shrink"
            >
              {displayName}
            </AppText>
            {isMyChannel && (
              <View className="bg-primary/20 px-2 py-0.5 rounded">
                <AppText variant="caption" className="text-primary text-xs">
                  My Channel
                </AppText>
              </View>
            )}
          </View>
          {lastMessage?.created_at && (
            <AppText variant="bodySmall" color="muted">
              {formatMessageTime(lastMessage.created_at, t)}
            </AppText>
          )}
        </View>
        <View className="flex-row items-center justify-between">
          <AppText
            variant="bodySmall"
            color="muted"
            numberOfLines={1}
            className="flex-1"
          >
            {lastMessage?.user?.name || lastMessage?.user?.id
              ? `@${lastMessage.user.name || lastMessage.user.id}: `
              : ''}
            {lastMessageText}
          </AppText>
          {unread > 0 && (
            <View className="w-5 h-5 rounded-full bg-destructive items-center justify-center ml-2">
              <AppText variant="caption" className="text-white text-xs">
                {unread > 9 ? '9+' : unread}
              </AppText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default CustomChannelPreview;
