import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActionButton } from '@knocklabs/client';
import AppText from '@/components/ui/AppText';
import Avatar from '@/components/ui/Avatar';
import { KnockNotificationViewItem } from '../hooks/types';

interface NotificationItemProps {
  readonly item: KnockNotificationViewItem;
  readonly onPress: (item: KnockNotificationViewItem) => void;
  readonly onActionPress: (
    item: KnockNotificationViewItem,
    button: ActionButton,
  ) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  item,
  onPress,
  onActionPress,
}) => {
  const { t } = useTranslation();

  const handlePress = () => {
    onPress(item);
  };

  return (
    <View className={`py-4 px-2 -mx-2 rounded-xl ${item.isUnread ? 'bg-primary/10' : ''}`}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        className="flex-row gap-3"
      >
        {/* Unread indicator */}
        <View className="w-2 items-center justify-center">
          {item.isUnread && (
            <View className="w-2 h-2 rounded-full bg-primary" />
          )}
        </View>

        <Avatar
          size="md"
          source={item.userAvatar ? { uri: item.userAvatar } : undefined}
          text={item.title}
          className="bg-neutrals700"
        />

        <View className="flex-1 gap-1">
          <AppText
            variant="label"
            weight={item.isUnread ? 'bold' : 'regular'}
            color={item.isUnread ? 'default' : 'muted'}
            numberOfLines={1}
            raw
          >
            {item.title}
          </AppText>

          <AppText
            variant="bodySmall"
            color={item.isUnread ? 'default' : 'muted'}
            numberOfLines={3}
            raw
          >
            {item.body || t('APP.NOTIFICATION.NO_CONTENT')}
          </AppText>
        </View>

        <AppText
          variant="labelSmall"
          color={item.isUnread ? 'primary' : 'muted'}
          raw
        >
          {item.sentAtLabel}
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

export default NotificationItem;
