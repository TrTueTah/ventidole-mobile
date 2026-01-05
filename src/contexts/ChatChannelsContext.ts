import React from 'react';
import { Channel } from 'stream-chat';

export interface ChatChannelsContextValue {
  channels: Channel[];
  isLoading: boolean;
  isFetching: boolean;
  error: any;
  refetch: (options?: { silent?: boolean }) => Promise<void>;
}

export const ChatChannelsContext =
  React.createContext<ChatChannelsContextValue | null>(null);
