import { StreamChat } from 'stream-chat';

export const isClientConnected = (
  client: StreamChat | null,
  userId: string | undefined,
): boolean => {
  if (!client || !userId) {
    return false;
  }
  return (
    client.userID === userId &&
    client.user?.id === userId &&
    Boolean(client.userID)
  );
};

export const getNotificationsChannelId = (userId: string): string => {
  return `notifications-${userId}`;
};
