import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { colorScheme } from 'nativewind';
import { changeLanguage, LANGUAGES, LanguageCode } from '@/config/i18n';
import { getDeviceLanguage } from '@/utils/getDeviceLanguage';

export type Theme = 'light' | 'dark';

export interface Insets {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

// === Types ===
interface AppState {
  theme: Theme;
  language: LanguageCode;
  insets: Insets;
  isFirstLaunch: boolean;
  isLoading: boolean;
  isStorageReady: boolean;

  // === Actions ===
  setIsStorageReady: (ready: boolean) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: LanguageCode) => void;
  setInsets: (insets: Insets) => void;
  setIsFirstLaunch: (isFirstLaunch: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  toggleTheme: () => void;
}

// === Initial values ===
const initialInsets: Insets = {
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
};

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

// === Store ===
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: getDeviceLanguage(),
      insets: initialInsets,
      isFirstLaunch: true,
      isLoading: false,
      isStorageReady: false,

      // === Actions ===
      setIsStorageReady: ready => set({ isStorageReady: ready }),

      setTheme: theme => {
        colorScheme.set(theme);
        set({ theme });
      },

      setLanguage: language => {
        set({ language });
        // Defer i18n change to next tick to avoid layout recursion during animations
        setTimeout(() => changeLanguage(language), 0);
      },

      setInsets: insets => set({ insets }),

      setIsFirstLaunch: isFirstLaunch => set({ isFirstLaunch }),

      setIsLoading: isLoading => set({ isLoading }),

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        colorScheme.set(newTheme);
        set({ theme: newTheme });
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: state => ({
        theme: state.theme,
        language: state.language,
        isFirstLaunch: state.isFirstLaunch,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('AppStore: hydration error', error);
          } else if (state) {
            // Validate persisted language still exists
            if (!LANGUAGES[state.language]) {
              state.language = 'en';
            }
            // Sync i18n with persisted language
            changeLanguage(state.language);
            state.isStorageReady = true;
          }
        };
      },
    },
  ),
);

// === Selectors ===
export const selectTheme = (state: AppState): Theme => state.theme;
export const selectLanguage = (state: AppState): LanguageCode => state.language;
export const selectInsets = (state: AppState): Insets => state.insets;
export const selectIsFirstLaunch = (state: AppState): boolean => state.isFirstLaunch;
export const selectIsStorageReady = (state: AppState): boolean => state.isStorageReady;
