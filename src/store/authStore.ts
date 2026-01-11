import { components } from '@/schemas/openapi';
import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Create MMKV storage instance
const storage = new MMKV();

// MMKV storage adapter for Zustand
const mmkvStorage = {
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

// === Types ===
interface UserMetadata {
  id: string;
  email: string;
  firstLogin: boolean;
}

type UserData = components['schemas']['UserInfoDto'];

interface AuthState {
  userMetadata: UserMetadata;
  userData: UserData | null;
  accessToken: string;
  refreshToken: string;
  isLogin: boolean;
  isChooseCommunity: boolean;
  isStorageReady: boolean;

  // === Actions ===
  setIsStorageReady: (ready: boolean) => void;
  setUserMetadata: (metadata: Partial<UserMetadata>) => void;
  setUserData: (userData: UserData | null) => void;
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setIsLogin: (isLogin: boolean) => void;
  setIsChooseCommunity: (isChooseCommunity: boolean) => void;
  logout: () => void;
}

// === Initial values ===
const initialUserMetadata: UserMetadata = {
  id: '',
  email: '',
  firstLogin: false,
};

// === Store ===
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userMetadata: initialUserMetadata,
      userData: null,
      accessToken: '',
      refreshToken: '',
      isLogin: false,
      isChooseCommunity: false,
      isStorageReady: false,

      // === Actions ===
      setIsStorageReady: ready => set({ isStorageReady: ready }),

      setUserMetadata: metadata =>
        set(state => ({
          userMetadata: { ...state.userMetadata, ...metadata },
        })),

      setUserData: userData => set({ userData }),

      setAccessToken: token => set({ accessToken: token ?? '' }),

      setRefreshToken: token => set({ refreshToken: token ?? '' }),

      setIsLogin: isLogin => set({ isLogin }),

      setIsChooseCommunity: isChooseCommunity => set({ isChooseCommunity }),

      logout: () =>
        set(state => ({
          userMetadata: { ...initialUserMetadata },
          userData: null,
          accessToken: '',
          refreshToken: '',
          isLogin: false,
          isChooseCommunity: false,
          isStorageReady: state.isStorageReady,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: state => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userMetadata: state.userMetadata,
        userData: state.userData,
        isLogin: state.isLogin,
        isChooseCommunity: state.isChooseCommunity,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('AuthStore: hydration error', error);
        } else if (state) {
          state.setIsStorageReady(true);
        }
      },
    },
  ),
);

// === Selectors ===
export const selectIsAuthenticated = (state: AuthState): boolean =>
  Boolean(state.accessToken && state.refreshToken);

export const selectIsStorageReady = (state: AuthState): boolean =>
  state.isStorageReady;

export const selectIsFirstLogin = (state: AuthState): boolean =>
  state.userMetadata.firstLogin;
