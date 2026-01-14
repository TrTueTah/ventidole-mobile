import React, { useCallback, useLayoutEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KNOCK_FEED_ID } from '@env';
import AppText from '@/components/ui/AppText';
import { useDialog } from '@/components/ui/DialogProvider';
import { RootStackParamList } from '@/navigation/types';
import KnockNotificationsList from './components/KnockNotificationsList';
import NotificationEmptyFallback from './components/NotificationEmptyFallback';
import { useKnockNotifications } from './hooks';

const NotificationScreen = () => {
  return (
    <View className="flex-1 bg-background p-4">
      {KNOCK_FEED_ID ? (
        <KnockFeedContent />
      ) : (
        <NotificationEmptyFallback />
      )}
    </View>
  );
};

const KnockFeedContent = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { showConfirm } = useDialog();
  const {
    items,
    isRefreshing,
    isClearing,
    onItemPress,
    onActionPress,
    refresh,
    clearAllNotifications,
  } = useKnockNotifications();

  const hasItems = items.length > 0;

  const handleClearPress = useCallback(() => {
    showConfirm(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This action cannot be undone.',
      async () => {
        await clearAllNotifications();
      },
      undefined,
      'horizontal',
    );
  }, [showConfirm, clearAllNotifications]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          disabled={isClearing || !hasItems}
          onPress={handleClearPress}
          className="py-1.5 px-3 rounded-xl bg-neutrals800"
          style={{ opacity: isClearing || !hasItems ? 0.4 : 1 }}
        >
          <AppText variant="labelSmall" color="default" raw>
            {isClearing ? 'Clearing...' : 'Clear'}
          </AppText>
        </TouchableOpacity>
      ),
    });
  }, [handleClearPress, hasItems, isClearing, navigation]);

  return (
    <KnockNotificationsList
      items={items}
      onItemPress={onItemPress}
      onActionPress={onActionPress}
      refreshing={isRefreshing}
      onRefresh={refresh}
    />
  );
};

export default NotificationScreen;
