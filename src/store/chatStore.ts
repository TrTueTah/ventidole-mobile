import { components } from '@/schemas/openapi';
import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ChannelDto = components['schemas']['ChannelDto'];

interface ChatState {
  // Cached channel data
  joinedChannels: ChannelDto[];
  myChannels: ChannelDto[];

  // Last fetch timestamps
  joinedChannelsLastFetch: number | null;
  myChannelsLastFetch: number | null;

  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Actions
  setJoinedChannels: (channels: ChannelDto[]) => void;
  setMyChannels: (channels: ChannelDto[]) => void;
  clearChannels: () => void;
  hasJoinedChannelsCache: () => boolean;
  hasMyChannelsCache: () => boolean;
}

// Create MMKV storage instance for chat
const chatStorage = new MMKV({ id: 'chat-storage' });

// MMKV storage adapter for Zustand
const mmkvChatStorage = {
  setItem: (name: string, value: string) => {
    chatStorage.set(name, value);
  },
  getItem: (name: string) => {
    const value = chatStorage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    chatStorage.delete(name);
  },
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      joinedChannels: [],
      myChannels: [],
      joinedChannelsLastFetch: null,
      myChannelsLastFetch: null,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      setJoinedChannels: (channels: ChannelDto[]) =>
        set({
          joinedChannels: channels,
          joinedChannelsLastFetch: Date.now(),
        }),

      setMyChannels: (channels: ChannelDto[]) =>
        set({
          myChannels: channels,
          myChannelsLastFetch: Date.now(),
        }),

      clearChannels: () =>
        set({
          joinedChannels: [],
          myChannels: [],
          joinedChannelsLastFetch: null,
          myChannelsLastFetch: null,
        }),

      hasJoinedChannelsCache: () => get().joinedChannels.length > 0,
      hasMyChannelsCache: () => get().myChannels.length > 0,
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => mmkvChatStorage),
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
