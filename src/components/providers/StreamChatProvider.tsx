import { useColors } from '@/hooks/useColors';
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { isClientConnected } from '@/utils/streamChat/connectionUtils';
import {
  handleStreamChatError,
  isTokenExpiredError,
  leaveBreadcrumb,
  safeDisconnectUser,
} from '@/utils/streamChat/streamChatErrorHandler';
import { STREAM_CHAT_API_KEY } from '@env';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  DeepPartial,
  OverlayProvider,
  Theme,
} from 'stream-chat-react-native';
import { BackendApiContext } from './BackendApiProvider';

interface StreamChatProviderProps {
  children: React.ReactNode;
}

export const StreamChatProvider: React.FC<StreamChatProviderProps> = React.memo(
  ({ children }) => {
    const { user, isLoading, error } = useGetCurrentUser();
    const [client, setClient] = useState<StreamChat | null>(null);
    const clientRef = useRef<StreamChat | null>(null);
    const connectingRef = useRef<boolean>(false);
    const currentUserIdRef = useRef<string | null>(null);
    const eventCleanupRef = useRef<(() => void) | null>(null);
    const backendApi = useContext(BackendApiContext);
    const { mutateAsync: getStreamChatToken } = backendApi.useMutation(
      'post',
      '/v1/stream-chat/token',
    );

    const [minimalClient] = useState(() =>
      StreamChat.getInstance(STREAM_CHAT_API_KEY),
    );
    const retryCountRef = useRef<number>(0);
    const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 2000;

    useEffect(() => {
      // Wait for user data to be fully loaded before connecting
      // This ensures we have the user's name from the API
      const isUserReady = user?.id && !isLoading && !error;

      if (!isUserReady) {
        retryCountRef.current = 0;
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
        return;
      }

      let isCancelled = false;

      const connectUser = async () => {
        if (!user?.id || connectingRef.current || isCancelled) {
          return;
        }

        if (
          clientRef.current &&
          isClientConnected(clientRef.current, user.id) &&
          currentUserIdRef.current === user.id
        ) {
          if (!client) {
            setClient(clientRef.current);
          }

          // Update user info if name has changed
          if (user.username && clientRef.current.user?.name !== user.username) {
            try {
              await clientRef.current.upsertUser({
                id: user.id,
                name: user.username,
                image:
                  typeof user.avatarUrl === 'string'
                    ? user.avatarUrl
                    : undefined,
              });
              leaveBreadcrumb('StreamChatUserUpdated', {
                userId: user.id,
                name: user.username,
              });
            } catch (err) {
              console.error('Failed to update user info:', err);
            }
          }
          return;
        }

        if (connectingRef.current) {
          return;
        }

        connectingRef.current = true;

        try {
          const chatClient =
            clientRef.current || StreamChat.getInstance(STREAM_CHAT_API_KEY);

          if (chatClient.userID) {
            await safeDisconnectUser(chatClient);
          }

          if (isCancelled) {
            connectingRef.current = false;
            return;
          }

          clientRef.current = chatClient;

          if (
            isClientConnected(chatClient, user.id) &&
            currentUserIdRef.current === user.id
          ) {
            if (!isCancelled) {
              setClient(chatClient);
              connectingRef.current = false;
            }
            return;
          }

          let token: string;

          try {
            console.log('[StreamChat] Requesting token for user:', user.id);
            const response = await getStreamChatToken({
              body: {
                userId: user.id,
              },
            });

            console.log('[StreamChat] Token response:', {
              hasData: !!response?.data,
              hasToken: !!response?.data?.token,
            });

            const tokenValue = response?.data?.token;
            if (!tokenValue) {
              throw new Error('Token not found in response');
            }

            token = tokenValue;

            if (isCancelled) {
              connectingRef.current = false;
              return;
            }

            if (chatClient.userID === user.id) {
              currentUserIdRef.current = user.id;
              setClient(chatClient);
              connectingRef.current = false;
              setupEventListeners(chatClient);
              return;
            }

            // Use the name from API, fallback to other fields if not available
            const userName = user.username || user.email || 'User';

            await chatClient.connectUser(
              {
                id: user.id,
                name: userName,
                image:
                  typeof user.avatarUrl === 'string'
                    ? user.avatarUrl
                    : undefined,
              },
              token,
            );

            // Force update the user info in Stream Chat to ensure correct name
            // This is needed because the backend might have created the user with default values
            if (!isCancelled && user.username) {
              try {
                await chatClient.upsertUser({
                  id: user.id,
                  name: user.username,
                  image:
                    typeof user.avatarUrl === 'string'
                      ? user.avatarUrl
                      : undefined,
                });
                leaveBreadcrumb('StreamChatUserInfoUpdated', {
                  userId: user.id,
                  name: user.username,
                });
              } catch (updateErr) {
                console.error(
                  'Failed to update user info after connect:',
                  updateErr,
                );
              }
            }

            if (!isCancelled) {
              currentUserIdRef.current = user.id;
              setClient(chatClient);
              connectingRef.current = false;
              retryCountRef.current = 0;
              leaveBreadcrumb('StreamChatConnected', { userId: user.id });
              setupEventListeners(chatClient);
            }
          } catch (backendError: unknown) {
            console.error(
              '[StreamChat] GetStreamChatToken error:',
              backendError,
            );
            const errorObj = backendError as Record<string, unknown>;
            const errorStatus =
              errorObj?.status ||
              (errorObj?.response as Record<string, unknown>)?.status ||
              (errorObj?.error as Record<string, unknown>)?.status;
            const errorMessage = String(
              errorObj?.message ||
                (errorObj?.error as Record<string, unknown>)?.message ||
                backendError,
            );

            console.log('[StreamChat] Error details:', {
              status: errorStatus,
              message: errorMessage,
              userId: user?.id,
            });

            const is404Error =
              errorStatus === 404 ||
              errorMessage?.includes('404') ||
              errorMessage?.includes('Not Found');

            if (is404Error) {
              if (retryCountRef.current < MAX_RETRIES && !isCancelled) {
                retryCountRef.current += 1;
                leaveBreadcrumb('GetTokenRetrying', {
                  attempt: retryCountRef.current,
                  maxRetries: MAX_RETRIES,
                  userId: user?.id || '',
                });

                connectingRef.current = false;

                retryTimeoutRef.current = setTimeout(() => {
                  if (!isCancelled && user?.id) {
                    connectUser();
                  }
                }, RETRY_DELAY_MS);

                return;
              }

              handleStreamChatError(backendError, {
                operation: 'GetStreamChatToken404',
                userId: user?.id,
                additionalData: {
                  endpoint: '/v1/stream-chat/token',
                  retryCount: retryCountRef.current,
                },
              });

              console.warn('Chat unavailable. Please try again later.');
              retryCountRef.current = 0;
            } else {
              handleStreamChatError(backendError, {
                operation: 'GetStreamChatToken',
                userId: user?.id,
                additionalData: {
                  endpoint: '/v1/stream-chat/token',
                  status: errorStatus,
                },
              });
              retryCountRef.current = 0;
            }
            connectingRef.current = false;
          }
        } catch (error: unknown) {
          handleStreamChatError(error, {
            operation: 'ConnectUser',
            userId: user?.id,
          });
          connectingRef.current = false;
        }
      };

      const setupEventListeners = (chatClient: StreamChat) => {
        if (eventCleanupRef.current) {
          eventCleanupRef.current();
        }

        const handleConnectionChanged = (event: any) => {
          if (isCancelled) return;

          const isOnline = event?.online === true;

          if (!isOnline && user?.id && currentUserIdRef.current === user.id) {
            leaveBreadcrumb('ConnectionLost', { userId: user?.id });
          } else if (
            isOnline &&
            user?.id &&
            currentUserIdRef.current === user.id
          ) {
            leaveBreadcrumb('ConnectionRestored', { userId: user?.id });
          }
        };

        const handleConnectionRecovered = () => {
          if (
            !isCancelled &&
            user?.id &&
            currentUserIdRef.current === user.id
          ) {
            leaveBreadcrumb('ConnectionRecovered', { userId: user?.id });
          }
        };

        const handleError = (event: unknown) => {
          if (isCancelled) return;

          handleStreamChatError(event, {
            operation: 'ClientError',
            userId: user?.id,
          });

          if (isTokenExpiredError(event)) {
            if (
              user?.id &&
              currentUserIdRef.current === user.id &&
              !connectingRef.current &&
              !isCancelled
            ) {
              leaveBreadcrumb('TokenExpiredReconnecting', {
                userId: user?.id,
              });
              setTimeout(() => {
                if (!isCancelled && !connectingRef.current) {
                  connectUser();
                }
              }, 100);
            }
          }
        };

        chatClient.on('connection.changed', handleConnectionChanged);
        chatClient.on('connection.recovered', handleConnectionRecovered);
        chatClient.on('error', handleError);

        eventCleanupRef.current = () => {
          chatClient.off('connection.changed', handleConnectionChanged);
          chatClient.off('connection.recovered', handleConnectionRecovered);
          chatClient.off('error', handleError);
        };
      };

      connectUser();

      return () => {
        isCancelled = true;
        connectingRef.current = false;
        retryCountRef.current = 0;

        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }

        if (eventCleanupRef.current) {
          eventCleanupRef.current();
          eventCleanupRef.current = null;
        }

        if (clientRef.current && currentUserIdRef.current !== user?.id) {
          safeDisconnectUser(clientRef.current);
          clientRef.current = null;
          currentUserIdRef.current = null;
          setClient(null);
        }
      };
    }, [
      user?.id,
      user?.username,
      user?.avatarUrl,
      isLoading,
      error,
      getStreamChatToken,
      client,
    ]);

    const activeClient = client || minimalClient;
    const isClientReady = Boolean(client && user?.id);

    const AppColors = useColors();

    const customTheme: DeepPartial<Theme> = useMemo(
      () => ({
        colors: {
          white_snow: AppColors.background,
        },
        messageList: {
          container: {
            backgroundColor: AppColors.background,
          },
        },
      }),
      [AppColors.background],
    );

    return (
      <OverlayProvider>
        <Chat client={activeClient} style={customTheme}>
          {children}
        </Chat>
      </OverlayProvider>
    );
  },
);

StreamChatProvider.displayName = 'StreamChatProvider';
