import { TFunction } from 'node_modules/i18next/typescript/t';

export const formatISODate = (
  isoDate: string,
  t: TFunction<'translation', undefined>,
): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return t('TIME.JUST_NOW');
  }
  if (diffMins < 60) {
    return t('TIME.MINUTE_AGO', { count: diffMins });
  }
  if (diffHours < 24) {
    return t('TIME.HOUR_AGO', { count: diffHours });
  }
  if (diffDays < 7) {
    return t('TIME.DAY_AGO', { count: diffDays });
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export const formatMessageTime = (
  date: Date | string,
  t: TFunction<'translation', undefined>,
): string => {
  const messageDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - messageDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Less than 1 minute
  if (diffMins < 1) {
    return t('TIME.JUST_NOW');
  }

  // Less than 1 hour
  if (diffMins < 60) {
    return t('TIME.MINUTE_AGO', { count: diffMins });
  }

  // Less than 24 hours
  if (diffHours < 24) {
    return t('TIME.HOUR_AGO', { count: diffHours });
  }

  // Less than 7 days
  if (diffDays < 7) {
    return t('TIME.DAY_AGO', { count: diffDays });
  }

  // More than 7 days - show date
  const isThisYear = messageDate.getFullYear() === now.getFullYear();
  if (isThisYear) {
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
