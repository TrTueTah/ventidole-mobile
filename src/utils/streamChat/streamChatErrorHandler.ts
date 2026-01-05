export interface StreamChatErrorContext {
  operation: string;
  channelId?: string;
  userId?: string;
  additionalData?: Record<string, unknown>;
}

export interface StreamChatError {
  code?: number;
  message?: string;
  status?: number;
  statusCode?: number;
}

const DELETED_USER_ERROR_CODE = 16;
const DELETED_USER_ERROR_PATTERN = /user.*was deleted/i;
const CHANNEL_NOT_FOUND_PATTERN = /channel.*not found/i;
const NOT_A_MEMBER_PATTERN = /not a member/i;
const ALREADY_WATCHING_PATTERN = /already watching/i;
const TOKEN_EXPIRED_PATTERN = /token.*expired|jwt expired/i;

export const isDeletedUserError = (error: unknown): boolean => {
  const streamError = error as StreamChatError;
  if (streamError?.code === DELETED_USER_ERROR_CODE) {
    return true;
  }
  const errorMessage = getErrorMessage(error);
  return DELETED_USER_ERROR_PATTERN.test(errorMessage);
};

export const isChannelNotFoundError = (error: unknown): boolean => {
  const errorMessage = getErrorMessage(error);
  return CHANNEL_NOT_FOUND_PATTERN.test(errorMessage);
};

export const isNotAMemberError = (error: unknown): boolean => {
  const errorMessage = getErrorMessage(error);
  return NOT_A_MEMBER_PATTERN.test(errorMessage);
};

export const isAlreadyWatchingError = (error: unknown): boolean => {
  const errorMessage = getErrorMessage(error);
  return ALREADY_WATCHING_PATTERN.test(errorMessage);
};

export const isTokenExpiredError = (error: unknown): boolean => {
  const streamError = error as StreamChatError;
  const errorMessage = getErrorMessage(error);
  return streamError?.code === 40 || TOKEN_EXPIRED_PATTERN.test(errorMessage);
};

export const isRecoverableError = (error: unknown): boolean => {
  return (
    isDeletedUserError(error) ||
    isChannelNotFoundError(error) ||
    isNotAMemberError(error) ||
    isAlreadyWatchingError(error)
  );
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  const streamError = error as StreamChatError;
  if (streamError?.message) {
    return streamError.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return String(error);
};

export const getErrorCode = (error: unknown): number | undefined => {
  const streamError = error as StreamChatError;
  return streamError?.code ?? streamError?.status ?? streamError?.statusCode;
};

type ErrorSeverity = 'warning' | 'info' | 'error';

const getSeverity = (error: unknown): ErrorSeverity => {
  if (isDeletedUserError(error)) {
    return 'warning';
  }
  if (isRecoverableError(error)) {
    return 'info';
  }
  return 'error';
};

export const handleStreamChatError = (
  error: unknown,
  context: StreamChatErrorContext,
  options?: { silent?: boolean },
): void => {
  const errorMessage = getErrorMessage(error);
  const errorCode = getErrorCode(error);
  const severity = getSeverity(error);

  if (!options?.silent) {
    console.warn(`[StreamChat] ${context.operation} error:`, {
      code: errorCode,
      message: errorMessage,
      channelId: context.channelId,
      userId: context.userId,
    });
  }

  if (isAlreadyWatchingError(error)) {
    return;
  }

  // Bugsnag.notify(
  //   new Error(`StreamChat: ${context.operation} failed`),
  //   event => {
  //     event.severity = severity;
  //     event.addMetadata('streamchat', {
  //       operation: context.operation,
  //       errorCode: errorCode,
  //       errorMessage: errorMessage,
  //       channelId: context.channelId,
  //       userId: context.userId,
  //       isDeletedUserError: isDeletedUserError(error),
  //       isChannelNotFoundError: isChannelNotFoundError(error),
  //       isNotAMemberError: isNotAMemberError(error),
  //       isRecoverable: isRecoverableError(error),
  //       ...context.additionalData,
  //     });
  //   },
  // );
};

export const safeStopWatching = async (
  channel: { stopWatching: () => Promise<void> } | null,
): Promise<void> => {
  if (!channel) {
    return;
  }

  try {
    await channel.stopWatching();
  } catch (error) {
    handleStreamChatError(error, {
      operation: 'StopWatchingChannel',
    });
  }
};

export const safeChannelWatch = async (
  channel: { watch: (options?: Record<string, unknown>) => Promise<void> },
  options?: Record<string, unknown>,
  context?: Partial<StreamChatErrorContext>,
): Promise<boolean> => {
  try {
    await channel.watch(options);
    return true;
  } catch (error) {
    handleStreamChatError(error, {
      operation: 'WatchChannel',
      ...context,
    });
    return !isRecoverableError(error);
  }
};

export const safeDisconnectUser = async (
  client: { disconnectUser: () => Promise<void> } | null,
): Promise<void> => {
  if (!client) {
    return;
  }

  try {
    await client.disconnectUser();
  } catch (error) {
    handleStreamChatError(error, {
      operation: 'DisconnectUser',
    });
  }
};

export const leaveBreadcrumb = (
  operation: string,
  metadata?: Record<string, unknown>,
): void => {
  // Bugsnag.leaveBreadcrumb(
  //   `StreamChat: ${operation}`,
  //   {
  //     timestamp: Date.now(),
  //     ...metadata,
  //   } as Record<string, string | number | boolean>,
  //   'state',
  // );
};
