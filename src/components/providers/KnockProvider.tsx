import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { useKnockAuthToken } from '@/hooks/useKnockAuthToken';
import { useNewNotificationToast } from '@/screens/app/notification/hooks/useNewNotificationToast';
import { KNOCK_FEED_ID, KNOCK_PUBLIC_KEY } from '@env';
import {
  KnockFeedProvider,
  KnockProvider as KnockProviderLib,
  useKnockFeed,
} from '@knocklabs/react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNotifications as useNotificationsStore } from '../../store/notificationsStore';

interface KnockFeedInitializerProps {
  children: React.ReactNode;
  isActive: boolean;
  userId?: string | null;
}

const KnockFeedInitializer: React.FC<KnockFeedInitializerProps> = ({
  children,
  isActive,
  userId,
}) => {
  const { feedClient, useFeedStore } = useKnockFeed();
  const feedItems = useFeedStore(state => state.items);
  const metadata = useFeedStore(state => state.metadata);
  const setNotificationsCount = useNotificationsStore(
    state => state.setNotificationsCount,
  );

  // Show toast for new notifications
  useNewNotificationToast({
    feedItems: isActive ? feedItems : null,
    feedClient: isActive ? feedClient : undefined,
    userId,
  });

  // Fetch initial items and set up polling for new notifications
  useEffect(() => {
    if (!isActive) return;

    console.log('[KnockFeedInitializer] Starting feed');

    // Fetch initial items
    void feedClient.fetch();

    // Try to start real-time updates (may not work in all environments)
    void feedClient.listenForUpdates();

    // Poll for new notifications every 15 seconds as fallback
    // since real-time WebSocket doesn't seem to work reliably
    const pollInterval = setInterval(() => {
      console.log('[KnockFeedInitializer] Polling for new notifications');
      void feedClient.fetch();
    }, 15000);

    return () => {
      console.log('[KnockFeedInitializer] Stopping feed');
      clearInterval(pollInterval);
      feedClient.teardown();
    };
  }, [feedClient, isActive]);

  useEffect(() => {
    if (!isActive) return;
    const unseenCount = metadata?.unseen_count ?? 0;
    setNotificationsCount(unseenCount);
  }, [metadata?.unseen_count, setNotificationsCount, isActive]);

  return <>{children}</>;
};

interface KnockProviderProps {
  children: React.ReactNode;
}

export const KnockProvider: React.FC<KnockProviderProps> = React.memo(
  ({ children }) => {
    const { user } = useGetCurrentUser();
    // const { } = useToast();
    const publicKey = KNOCK_PUBLIC_KEY;

    const {
      token: knockAuthToken,
      error: knockAuthError,
      refreshToken,
    } = useKnockAuthToken(user?.id);
    const [knockInitFailed, setKnockInitFailed] = useState(false);
    const knockRetryAttemptsRef = useRef(0);
    const knockRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );
    const MAX_KNOCK_RETRIES = 3;
    const KNOCK_RETRY_DELAY_MS = 3000;
    const renderCountRef = useRef(0);

    useEffect(() => {
      renderCountRef.current++;
      console.log('[Render tracking] KnockProvider', {
        renderCount: renderCountRef.current,
        userId: user?.id,
        hasToken: !!knockAuthToken,
        timestamp: Date.now(),
      });
    });

    useEffect(() => {
      if (knockAuthError) {
        console.error(
          '[KnockProvider] Failed to fetch Knock auth token:',
          knockAuthError,
        );
      }
    }, [knockAuthError]);

    useEffect(() => {
      if (knockAuthToken) {
        knockRetryAttemptsRef.current = 0;
        setKnockInitFailed(false);
        if (knockRetryTimeoutRef.current) {
          clearTimeout(knockRetryTimeoutRef.current);
          knockRetryTimeoutRef.current = null;
        }
      }
    }, [knockAuthToken]);

    useEffect(() => {
      if (!knockAuthError || knockInitFailed || !user?.id) {
        return;
      }

      if (knockRetryAttemptsRef.current + 1 > MAX_KNOCK_RETRIES) {
        setKnockInitFailed(true);
        console.log('[KnockProvider] Max Knock auth retries reached.');
        // showToast(
        //   'warning',
        //   'Notifications offline',
        //   'Unable to connect to notifications right now. Please check your connection.',
        // );
        return;
      }

      knockRetryAttemptsRef.current += 1;
      if (knockRetryTimeoutRef.current) {
        clearTimeout(knockRetryTimeoutRef.current);
      }
      knockRetryTimeoutRef.current = setTimeout(() => {
        refreshToken().catch(() => {
          /* swallow */
        });
      }, KNOCK_RETRY_DELAY_MS);

      return () => {
        if (knockRetryTimeoutRef.current) {
          clearTimeout(knockRetryTimeoutRef.current);
          knockRetryTimeoutRef.current = null;
        }
      };
    }, [knockAuthError, refreshToken, user?.id, knockInitFailed]);

    useEffect(() => {
      return () => {
        if (knockRetryTimeoutRef.current) {
          clearTimeout(knockRetryTimeoutRef.current);
          knockRetryTimeoutRef.current = null;
        }
      };
    }, []);

    const isKnockReady = Boolean(user?.id && knockAuthToken);
    // const setKnockReady = useBootStore(s => s.setKnockReady);

    // useEffect(() => {
    //   if (isKnockReady) {
    //     setKnockReady(true);
    //   }
    // }, [isKnockReady, setKnockReady]);

    const providerUserId = useMemo(() => user?.id || undefined, [user?.id]);

    if (!publicKey) {
      console.warn(
        '[KnockProvider] KNOCK_PUBLIC_KEY not found, Knock features will not work',
      );
      return <>{children}</>;
    }

    const canRenderKnockFeed = Boolean(
      KNOCK_FEED_ID && knockAuthToken && !knockInitFailed,
    );
    const hasFeedId = Boolean(KNOCK_FEED_ID);

    return (
      <KnockProviderLib
        apiKey={publicKey}
        userId={providerUserId}
        userToken={knockAuthToken || undefined}
      >
        {hasFeedId ? (
          <KnockFeedProvider feedId={KNOCK_FEED_ID} colorMode="dark">
            <KnockFeedInitializer isActive={canRenderKnockFeed} userId={user?.id}>
              {children}
            </KnockFeedInitializer>
          </KnockFeedProvider>
        ) : (
          <>
            {console.error(
              '[KnockProvider] ❌ KNOCK_FEED_ID missing! Rendering children without KnockFeedProvider.',
            )}
            {children}
          </>
        )}
      </KnockProviderLib>
    );
  },
);

KnockProvider.displayName = 'KnockProvider';
