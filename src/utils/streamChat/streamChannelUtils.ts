export interface StreamChannelData {
  eventId?: string;
  hostId?: string;
  guestId?: string;
  hostName?: string;
  guestName?: string;
  hostImageUrl?: string;
  guestImageUrl?: string;
  isSupportChat?: boolean;
}

export interface ChatChannel {
  id: string;
  name: string;
  image?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  otherUserId?: string;
  otherUserName?: string;
  otherUserImage?: string;
}

// StreamChat channel IDs must be max 64 characters
const MAX_CHANNEL_ID_LENGTH = 64;

/**
 * Creates a hash-like string from input (simple hash for consistent short IDs)
 */
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
};

/**
 * Converts a chatId to a StreamChat-compatible channel ID (max 64 characters)
 */
export const chatIdToChannelId = (chatId: string): string => {
  if (!chatId) return '';

  if (chatId.length <= MAX_CHANNEL_ID_LENGTH) {
    return chatId;
  }

  const hash = simpleHash(chatId);
  return `chat-${hash}`;
};

export const createChannelId = (userId1: string, userId2: string): string => {
  const sortedIds = [userId1, userId2].sort().join('-');
  const channelId = `dm-${sortedIds}`;

  if (channelId.length <= MAX_CHANNEL_ID_LENGTH) {
    return channelId;
  }

  const hash = simpleHash(`${userId1}-${userId2}`);
  return `dm-${hash}`;
};

/**
 * Get the display name for a channel
 */
export const getChannelDisplayName = (
  channelName?: string,
  memberCount?: number,
): string => {
  if (channelName) return channelName;
  return memberCount && memberCount > 0
    ? `${memberCount} members`
    : 'Unnamed Channel';
};
