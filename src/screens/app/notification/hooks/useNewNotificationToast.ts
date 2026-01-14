import { useEffect, useRef } from 'react';
import { Feed, FeedItem } from '@knocklabs/client';
import { toast } from '@/components/ui/ToastProvider';
import { KnockFeedItem } from './types';
import {
  extractBlockFields,
  getNotificationBody,
  getNotificationTitle,
} from './helpers';

interface UseNewNotificationToastParams {
  feedItems?: FeedItem[] | null;
  feedClient?: Feed;
  userId?: string | null;
}

const getFeedItemId = (item: FeedItem): string | null => {
  const knockItem = item as KnockFeedItem;
  return knockItem?.id ?? null;
};

const showToastForItem = (item: KnockFeedItem, feedClient?: Feed) => {
  const blockFields = extractBlockFields(item.blocks);
  const title = getNotificationTitle(item, blockFields) || 'New notification';
  const body = getNotificationBody(item, blockFields) || '';

  console.log('[Knock Toast] Showing toast for:', title, body);

  toast.show({
    type: 'info',
    title,
    message: body,
    duration: 5000,
    onPress: () => {
      if (feedClient) {
        void feedClient.markAsRead(item);
      }
    },
  });
};

export const useNewNotificationToast = ({
  feedItems,
  feedClient,
  userId,
}: UseNewNotificationToastParams) => {
  const seenItemIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);
  const currentUserIdRef = useRef<string | undefined | null>(undefined);

  // Reset state when user changes
  useEffect(() => {
    if (!userId) {
      return;
    }

    if (currentUserIdRef.current !== userId) {
      console.log('[Knock Toast] User changed, resetting state');
      currentUserIdRef.current = userId;
      isInitializedRef.current = false;
      seenItemIdsRef.current.clear();
    }
  }, [userId]);

  // Track feed items changes and show toast for new ones
  useEffect(() => {
    if (!feedItems || feedItems.length === 0) {
      return;
    }

    // First load - mark all as seen, no toast
    if (!isInitializedRef.current) {
      console.log('[Knock Toast] Initial load, marking', feedItems.length, 'items as seen');
      isInitializedRef.current = true;

      feedItems.forEach(item => {
        const itemId = getFeedItemId(item);
        if (itemId) {
          seenItemIdsRef.current.add(itemId);
        }
      });
      return;
    }

    // Check for new items in the feed (fallback for when real-time events don't work)
    console.log('[Knock Toast] Feed items changed, checking for new items...');
    feedItems.forEach(item => {
      const itemId = getFeedItemId(item);
      if (!itemId) return;

      if (!seenItemIdsRef.current.has(itemId)) {
        console.log('[Knock Toast] Found new item via feed change:', itemId);
        seenItemIdsRef.current.add(itemId);
        showToastForItem(item as KnockFeedItem, feedClient);
      }
    });
  }, [feedItems, feedClient]);

};

export default useNewNotificationToast;
