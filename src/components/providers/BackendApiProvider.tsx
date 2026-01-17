import initializeApiClient from '@/api/backend-api';
import { BACKEND_BASE_URL } from '@env';
import createClient, { OpenapiQueryClient } from 'openapi-react-query';
import { createContext, ReactNode, useEffect, useState } from 'react';
import { paths } from 'src/schemas/openapi';

interface BackendApiProviderProps {
  children: ReactNode;
}

export const BackendApiContext = createContext<OpenapiQueryClient<paths>>(
  createClient({ baseUrl: BACKEND_BASE_URL } as any),
);

const BackendApiProvider = ({ children }: BackendApiProviderProps) => {
  const [backendApi, setBackendApi] =
    useState<OpenapiQueryClient<paths> | null>(null);

  useEffect(() => {
    const initApi = async () => {
      const { queryClient } = await initializeApiClient(BACKEND_BASE_URL);
      setBackendApi(queryClient);
    };
    initApi();
  }, []);

  if (!backendApi) {
    console.log('[BackendApiProvider] Not ready, returning null...');
    return null; // or a loading component
  }

  return (
    <BackendApiContext.Provider value={backendApi}>
      {children}
    </BackendApiContext.Provider>
  );
};

export default BackendApiProvider;
