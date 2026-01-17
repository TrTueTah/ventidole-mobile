import React, { useCallback, useLayoutEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      t('APP.NOTIFICATION.CLEAR_ALL_TITLE'),
      t('APP.NOTIFICATION.CLEAR_ALL_MESSAGE'),
      async () => {
        await clearAllNotifications();
      },
      undefined,
      'horizontal',
    );
  }, [showConfirm, clearAllNotifications, t]);

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
            {isClearing ? t('APP.NOTIFICATION.CLEARING') : t('APP.NOTIFICATION.CLEAR_ALL')}
          </AppText>
        </TouchableOpacity>
      ),
    });
  }, [handleClearPress, hasItems, isClearing, navigation, t]);

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
