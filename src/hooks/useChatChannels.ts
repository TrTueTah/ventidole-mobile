import { ChatChannelsContext } from '@/contexts/ChatChannelsContext';
import { useContext } from 'react';

export const useChatChannels = () => {
  const context = useContext(ChatChannelsContext);

  if (!context) {
    throw new Error('useChatChannels must be used within ChatChannelsProvider');
  }

  return context;
};
