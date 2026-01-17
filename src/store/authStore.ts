import { components } from '@/schemas/openapi';
import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Create MMKV storage instance
const storage = new MMKV();

// Reference to chat storage for clearing on logout
const chatStorage = new MMKV({ id: 'chat-storage' });

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
  uid: string;
  phoneNumber: string;
  email: string;
  firstLogin: boolean;
}

type UserData = components['schemas']['UserDto'];

interface AuthState {
  userMetadata: UserMetadata;
  userData: UserData | null;
  userPhoneNumber: string;
  accessToken: string;
  refreshToken: string;
  isLogin: boolean;
  isChooseCommunity: boolean;
  isStorageReady: boolean;
  lastLoginTimestamp: number | null; // Track when login/signup happened to prevent auto-logout

  // === Actions ===
  setIsStorageReady: (ready: boolean) => void;
  setUserMetadata: (metadata: Partial<UserMetadata>) => void;
  setUserData: (userData: UserData | null) => void;
  setUserPhoneNumber: (phoneNumber: string) => void;
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setIsLogin: (isLogin: boolean) => void;
  setIsChooseCommunity: (isChooseCommunity: boolean) => void;
  logout: () => void;
}

// === Initial values ===
const initialUserMetadata: UserMetadata = {
  uid: '',
  phoneNumber: '',
  email: '',
  firstLogin: false,
};

// === Store ===
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userMetadata: initialUserMetadata,
      userData: null,
      userPhoneNumber: '',
      accessToken: '',
      refreshToken: '',
      isLogin: false,
      isChooseCommunity: false,
      isStorageReady: false,
      lastLoginTimestamp: null,

      // === Actions ===
      setIsStorageReady: ready => set({ isStorageReady: ready }),

      setUserMetadata: metadata =>
        set(state => ({
          userMetadata: { ...state.userMetadata, ...metadata },
        })),

      setUserData: userData => set({ userData }),

      setUserPhoneNumber: phoneNumber => set({ userPhoneNumber: phoneNumber }),

      setAccessToken: token => set({ accessToken: token ?? '' }),

      setRefreshToken: token => set({ refreshToken: token ?? '' }),

      setIsLogin: isLogin => {
        console.log('[AuthStore] setIsLogin called:', isLogin, new Error().stack);
        return set({
          isLogin,
          // Track login time to prevent auto-logout during initial auth flow
          lastLoginTimestamp: isLogin ? Date.now() : null,
        });
      },

      setIsChooseCommunity: isChooseCommunity => set({ isChooseCommunity }),

      logout: () => {
        console.log('[AuthStore] logout called!', new Error().stack);
        // Clear the persisted storage completely
        storage.delete('auth-storage');
        // Also clear chat storage to prevent old user's channels from persisting
        chatStorage.delete('chat-storage');

        return set(state => ({
          userMetadata: { ...initialUserMetadata },
          userData: null,
          userPhoneNumber: '',
          accessToken: '',
          refreshToken: '',
          isLogin: false,
          isChooseCommunity: false,
          isStorageReady: state.isStorageReady,
          lastLoginTimestamp: null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: state => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userMetadata: state.userMetadata,
        userData: state.userData,
        userPhoneNumber: state.userPhoneNumber,
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
