import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActionButton } from '@knocklabs/client';
import { useKnockFeed } from '@knocklabs/react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '@/navigation/types';
import { useNotifications as useNotificationsStore } from '@/store/notificationsStore';
import { KnockFeedItem, KnockNotificationViewItem } from './types';
import {
  extractBlockFields,
  extractKnockPayload,
  getActorAvatar,
  getNotificationBody,
  getNotificationTitle,
  getSentAt,
  timeAgoShort,
} from './helpers';

export const useKnockNotifications = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { feedClient, useFeedStore } = useKnockFeed();
  const feedItems = useFeedStore(state => state.items);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const setNotificationsCount = useNotificationsStore(
    state => state.setNotificationsCount,
  );
  const latestProcessedInsertedAtRef = useRef<number>(0);
  const hasInitializedRef = useRef<boolean>(false);

  // Only mark as seen (clears badge) but NOT read when entering screen
  // Items remain visually unread until user taps on them
  useEffect(() => {
    const markAsSeenAndRefresh = async () => {
      await feedClient.markAllAsSeen();
      setNotificationsCount(0);
    };
    void markAsSeenAndRefresh();
  }, [feedClient, setNotificationsCount]);

  const items: KnockNotificationViewItem[] = useMemo(() => {
    if (!feedItems) {
      return [];
    }

    const getInsertedTimestamp = (raw: KnockFeedItem): number => {
      if (!raw?.inserted_at) {
        return 0;
      }
      const ts = Date.parse(raw.inserted_at);
      return Number.isNaN(ts) ? 0 : ts;
    };

    let baselineInsertedAt = latestProcessedInsertedAtRef.current;
    if (!hasInitializedRef.current) {
      baselineInsertedAt = feedItems.reduce((max, raw) => {
        const ts = getInsertedTimestamp(raw as KnockFeedItem);
        return ts > max ? ts : max;
      }, 0);
      latestProcessedInsertedAtRef.current = baselineInsertedAt;
      hasInitializedRef.current = true;
    }
    let nextMaxInsertedAt = baselineInsertedAt;

    const mappedItems = feedItems.map(rawItem => {
      const item = rawItem as KnockFeedItem;
      const sentAt = getSentAt(item);
      const blockFields = extractBlockFields(item.blocks);
      const insertedAtTs = getInsertedTimestamp(item);
      if (insertedAtTs > nextMaxInsertedAt) {
        nextMaxInsertedAt = insertedAtTs;
      }

      return {
        id: item.id ?? crypto.randomUUID(),
        userAvatar: getActorAvatar(item),
        title: getNotificationTitle(item, blockFields),
        body: getNotificationBody(item, blockFields),
        sentAtLabel: sentAt ? timeAgoShort(sentAt) : '',
        isUnread: !item.read_at,
        actions: item.actions ?? [],
        feedItem: rawItem,
      };
    });

    if (nextMaxInsertedAt > latestProcessedInsertedAtRef.current) {
      latestProcessedInsertedAtRef.current = nextMaxInsertedAt;
    }

    return mappedItems;
  }, [feedItems]);

  const handleItemPress = useCallback(
    (viewItem: KnockNotificationViewItem) => {
      const target = viewItem.feedItem;
      void feedClient.markAsRead(target);

      const payload = extractKnockPayload(target);

      // Navigate based on payload - can be extended as needed
      if (payload.screen || payload.route) {
        const route = payload.screen ?? payload.route;
        if (route) {
          navigation.goBack();
          setTimeout(() => {
            navigation.navigate(route as any, payload.params as any);
          }, 300);
        }
      }
    },
    [feedClient, navigation],
  );

  const handleActionPress = useCallback(
    (viewItem: KnockNotificationViewItem, button: ActionButton) => {
      const target = viewItem.feedItem;
      void feedClient.markAsInteracted(target, { action: button.action });

      const payload = extractKnockPayload(target);

      if (payload.screen || payload.route) {
        const route = payload.screen ?? payload.route;
        if (route) {
          navigation.goBack();
          setTimeout(() => {
            navigation.navigate(route as any, payload.params as any);
          }, 300);
        }
      }
    },
    [feedClient, navigation],
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await feedClient.fetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [feedClient]);

  const clearAllNotifications = useCallback(async () => {
    if (isClearing) {
      return;
    }

    setIsClearing(true);
    try {
      await feedClient.markAllAsArchived();
      setNotificationsCount(0);
    } catch (error) {
      console.error('[Notifications] Failed to clear feed', error);
    } finally {
      setIsClearing(false);
    }
  }, [feedClient, isClearing, setNotificationsCount]);

  return {
    items,
    isRefreshing,
    isClearing,
    onItemPress: handleItemPress,
    onActionPress: handleActionPress,
    refresh,
    clearAllNotifications,
  };
};

export type { KnockNotificationViewItem } from './types';
export default useKnockNotifications;
