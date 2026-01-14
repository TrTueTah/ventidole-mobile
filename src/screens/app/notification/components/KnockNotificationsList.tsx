import { useColors } from '@/hooks/useColors';
import { ActionButton } from '@knocklabs/client';
import React, { useCallback } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { KnockNotificationViewItem } from '../hooks/types';
import NotificationEmptyFallback from './NotificationEmptyFallback';
import NotificationItem from './NotificationItem';

interface KnockNotificationsListProps {
  readonly items: KnockNotificationViewItem[];
  readonly onItemPress: (item: KnockNotificationViewItem) => void;
  readonly onActionPress: (
    item: KnockNotificationViewItem,
    button: ActionButton,
  ) => void;
  readonly refreshing: boolean;
  readonly onRefresh: () => void;
}

const ItemSeparator = () => <View className="h-px bg-neutrals800 w-full" />;

const KnockNotificationsList: React.FC<KnockNotificationsListProps> = ({
  items,
  onItemPress,
  onActionPress,
  refreshing,
  onRefresh,
}) => {
  const colors = useColors();

  const renderEmptyComponent = useCallback(
    () => (
      <View className="flex-1 justify-center py-6">
        <NotificationEmptyFallback />
      </View>
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: KnockNotificationViewItem }) => (
      <NotificationItem
        item={item}
        onPress={onItemPress}
        onActionPress={onActionPress}
      />
    ),
    [onItemPress, onActionPress],
  );

  const keyExtractor = useCallback(
    (item: KnockNotificationViewItem) => item.id,
    [],
  );

  return (
    <View className="flex-1 bg-background rounded-2xl px-3 pt-3">
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={items.length === 0 ? { flex: 1 } : undefined}
      />
    </View>
  );
};

export default KnockNotificationsList;
