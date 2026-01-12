/* eslint-disable no-console */
import { toast } from '@/components/ui/ToastProvider';
import { useAuthStore } from '@/store/authStore';
import { BACKEND_BASE_URL } from '@env';
import createFetchClient, { Middleware } from 'openapi-fetch';
import createClient from 'openapi-react-query';
import { paths } from 'src/schemas/openapi';

// Token refresh state management
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Refreshes access and refresh tokens using the refresh token endpoint
 * @returns Promise<boolean> - true if refresh was successful, false otherwise
 */
const refreshTokens = async (): Promise<boolean> => {
  // If already refreshing, return the existing promise to avoid concurrent refresh calls
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const { accessToken, refreshToken } = useAuthStore.getState();

      if (!accessToken || !refreshToken) {
        console.log('❌ No tokens available for refresh');
        return false;
      }

      console.log('🔄 Attempting to refresh tokens...');

      const response = await fetch(`${BACKEND_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: accessToken,
          refreshToken: refreshToken,
        }),
      });

      if (response.ok) {
        const result = (await response.json()) as {
          data: {
            accessToken: string;
            refreshToken: string;
            id: string;
            role: string;
          };
        };
        const { setAccessToken, setRefreshToken } = useAuthStore.getState();

        // Update tokens in store
        setAccessToken(result.data.accessToken);
        setRefreshToken(result.data.refreshToken);

        console.log('✅ Tokens refreshed successfully');
        return true;
      } else {
        const errorBody = await response.json().catch(() => ({}));
        console.log('❌ Token refresh failed:', errorBody);
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to refresh tokens:', error);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const myMiddleware: Middleware = {
  onError: (error: any) => {
    console.log('onError', error);
    if (error.message.includes('Aborted')) return;
    console.error('error while fetching', error);
  },
  async onRequest({ request }) {
    console.log('onRequest', request);
    request.headers.set('Content-Type', 'application/json');

    try {
      const { accessToken, refreshToken } = useAuthStore.getState();
      if (accessToken) {
        request.headers.set('Authorization', `Bearer ${accessToken}`);
        request.headers.set('x-refresh-token', refreshToken);
      }
    } catch (error: any) {
      console.error('❌ myMiddleware: Failed to set access token:', error);
    }
    return request;
  },
  async onResponse({ request, response }) {
    const newAccessToken = response.headers.get('x-access-token');
    const newRefreshToken = response.headers.get('x-refresh-token');
    if (newAccessToken) {
      const { setAccessToken } = useAuthStore.getState();
      setAccessToken?.(newAccessToken);
    }
    if (newRefreshToken) {
      const { setRefreshToken } = useAuthStore.getState();
      setRefreshToken?.(newRefreshToken);
    }

    if (response.status === 502) {
      toast.warning(
        'Server Error',
        'Our servers are currently experiencing issues. Please try again later or contact support.',
      );
    }

    if (response.status === 401 || response.status === 403) {
      try {
        const responseBody = (await response.clone().json()) as any;

        // For 401 errors: ALWAYS attempt refresh/logout since 401 means unauthorized
        // For 403 errors: Only attempt refresh/logout if it's auth-related (not permissions)
        let shouldAttemptRefresh = false;

        if (response.status === 401) {
          // All 401 errors should trigger refresh/logout
          shouldAttemptRefresh = true;
          console.log(
            '🔒 401 Unauthorized detected, attempting to refresh tokens...',
          );
        } else if (response.status === 403) {
          // For 403, check if it's an authentication error (not a permissions error)
          const isAuthError =
            responseBody?.errorCode === 'unauthenticated' ||
            responseBody?.message?.toLowerCase()?.includes('unauthenticated') ||
            responseBody?.message
              ?.toLowerCase()
              ?.includes('not authenticated') ||
            responseBody?.error?.message
              ?.toLowerCase()
              ?.includes('unauthenticated') ||
            (typeof responseBody?.error === 'string' &&
              (responseBody.error.includes('Token expired') ||
                responseBody.error.includes('no refresh token available') ||
                responseBody.error.includes('Authentication expired')));

          if (isAuthError) {
            shouldAttemptRefresh = true;
            console.log(
              '🔒 403 Authentication error detected, attempting to refresh tokens...',
            );
          } else {
            console.log(
              '⚠️ 403 Forbidden (permissions issue, not auth):',
              responseBody,
            );
          }
        }

        if (shouldAttemptRefresh) {
          // Attempt to refresh the tokens
          const refreshSuccess = await refreshTokens();

          if (refreshSuccess) {
            console.log(
              '✅ Token refreshed successfully, retrying original request...',
            );

            // Clone and retry the original request with new tokens
            const { accessToken, refreshToken } = useAuthStore.getState();
            const retryRequest = request.clone();
            retryRequest.headers.set('Authorization', `Bearer ${accessToken}`);
            retryRequest.headers.set('x-refresh-token', refreshToken);

            // Retry the original request
            return fetch(retryRequest);
          } else {
            console.log('❌ Token refresh failed, logging out user');
            const { logout } = useAuthStore.getState();
            logout();
          }
        }
      } catch (error) {
        console.error('Error handling 401/403 response:', error);
        // If we can't parse the response or handle it properly, log out for 401 errors
        if (response.status === 401) {
          const { logout } = useAuthStore.getState();
          logout();
        }
      }
    }

    return response;
  },
};

export const initializeApiClient = async (backendUrl: string) => {
  console.log('initializeApiClient', backendUrl);
  try {
    const fetchClient = createFetchClient<paths>({ baseUrl: backendUrl });
    fetchClient.use(myMiddleware);
    return { queryClient: createClient<paths>(fetchClient), fetchClient };
  } catch (error) {
    console.error('Failed to initialize API client:', error);
    return {
      queryClient: createClient<paths>(
        createFetchClient<paths>({ baseUrl: BACKEND_BASE_URL }),
      ),
      fetchClient: createFetchClient<paths>({ baseUrl: BACKEND_BASE_URL }),
    };
  }
};

export default initializeApiClient;
