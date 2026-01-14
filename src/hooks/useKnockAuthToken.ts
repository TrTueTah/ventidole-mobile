import { BackendApiContext } from '@/components/providers/BackendApiProvider';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

interface UseKnockAuthTokenResult {
  token: string | null;
  expiresIn: number | null;
  isLoading: boolean;
  error: Error | null;
  refreshToken: () => Promise<void>;
}

const REFRESH_BUFFER_MS = 60 * 1000; // refresh 60 seconds before expiry
const MIN_REFRESH_INTERVAL_MS = 30 * 1000;

export const useKnockAuthToken = (
  userId?: string | null,
): UseKnockAuthTokenResult => {
  const backendApi = useContext(BackendApiContext);
  const { mutateAsync: getKnockAuthToken } = backendApi.useMutation(
    'post',
    '/v1/knock/token',
  );
  const [token, setToken] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const clearRefreshTimer = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  };

  const fetchToken = useCallback(async () => {
    if (!userId || !getKnockAuthToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getKnockAuthToken({});
      if (!isMountedRef.current) {
        return;
      }
      const knockData = response?.data;
      const tokenData = knockData?.token ?? null;
      const expiresInData = knockData?.expiresIn ?? null;

      setToken(tokenData);
      setExpiresIn(expiresInData);

      if (expiresInData) {
        clearRefreshTimer();
        const refreshDelay = Math.max(
          expiresInData * 1000 - REFRESH_BUFFER_MS,
          MIN_REFRESH_INTERVAL_MS,
        );
        refreshTimeoutRef.current = setTimeout(() => {
          void fetchToken();
        }, refreshDelay);
      } else {
        clearRefreshTimer();
      }
    } catch (err) {
      if (!isMountedRef.current) {
        return;
      }
      setError(err as Error);
      clearRefreshTimer();
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [userId, getKnockAuthToken]);

  useEffect(() => {
    isMountedRef.current = true;
    if (userId) {
      void fetchToken();
    } else {
      setToken(null);
      setExpiresIn(null);
      setError(null);
      clearRefreshTimer();
    }

    return () => {
      isMountedRef.current = false;
      clearRefreshTimer();
    };
  }, [fetchToken, userId]);

  return {
    token,
    expiresIn,
    isLoading,
    error,
    refreshToken: fetchToken,
  };
};
