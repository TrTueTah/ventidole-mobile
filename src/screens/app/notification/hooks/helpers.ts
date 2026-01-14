import { FeedItem, Recipient } from '@knocklabs/client';
import {
  ActivityEntity,
  BlockFields,
  ExtendedActivity,
  KnockContentBlock,
  KnockFeedItem,
  KnockNavigationPayload,
  LegacyNotificationAction,
} from './types';

const stripHtmlTags = (value?: string): string => {
  if (!value) return '';
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const extractAvatar = (
  source?: { avatar?: string | null } | null,
): string | null => {
  if (!source) {
    return null;
  }
  const candidate = source.avatar;
  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate;
  }
  return null;
};

export const getAvatarFromRecipient = (
  recipient?: ActivityEntity | Recipient | null,
): string | null => {
  if (!recipient) {
    return null;
  }

  const directAvatar = extractAvatar(recipient as { avatar?: string | null });
  if (directAvatar) {
    return directAvatar;
  }

  const properties = (recipient as { properties?: { avatar?: string | null } })
    .properties;
  return extractAvatar(properties ?? null);
};

export const normalizeAction = (
  value?: string,
): LegacyNotificationAction | undefined => {
  if (!value) {
    return undefined;
  }
  const normalized = value.replace(/[\s_-]/g, '').toLowerCase();
  switch (normalized) {
    case 'chat':
    case 'openchat':
    case 'openeventchat':
      return 'chat';
    case 'joinedevent':
    case 'joinedevents':
    case 'openjoinedeventchat':
    case 'openjoinedevents':
      return 'joinedEvent';
    case 'invites':
    case 'openinvites':
    case 'openjoinevents':
      return 'invites';
    case 'connection':
    case 'connections':
    case 'openconnection':
    case 'openconnectionchat':
      return 'connection';
    case 'myevents':
    case 'openmyevents':
      return 'myEvents';
    case 'requests':
    case 'openrequests':
    case 'openeventrequests':
      return 'requests';
    case 'system':
    case 'openhome':
    case 'opensystem':
    case 'openhometab':
      return 'system';
    case 'friendconnection':
    case 'friendconnections':
    case 'openfriendconnection':
    case 'openconnections':
    case 'openconnectionsrequests':
      return 'friendConnection';
    case 'profile':
    case 'openprofile':
    case 'profileediting':
    case 'openprofileediting':
      return 'profile';
    default:
      return undefined;
  }
};

export const coerceString = (value?: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return undefined;
};

export const coerceBoolean = (value?: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  if (typeof value === 'number') {
    return value > 0;
  }
  return false;
};

export const extractKnockPayload = (item: FeedItem): KnockNavigationPayload => {
  const basePayload =
    (item.data as KnockNavigationPayload | undefined) ?? {};
  if (basePayload.navigation && typeof basePayload.navigation === 'object') {
    return {
      ...basePayload,
      action:
        basePayload.action ??
        basePayload.type ??
        basePayload.navigation.action,
      params: basePayload.params ?? basePayload.navigation.params,
    };
  }

  return {
    ...basePayload,
    action: basePayload.action ?? basePayload.type,
  };
};

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');

const normalizeJsonCandidate = (value: string): string =>
  value.replace(/,\s*([}\]])/g, '$1').replace(/(\r?\n)+/g, '\n');

export const parseBlockPayload = (
  value?: string | null,
): BlockFields | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  let candidate = trimmed;

  if (!candidate.startsWith('{')) {
    const stripped = candidate.replace(/<\/?[^>]+>/g, '').trim();
    if (!stripped.startsWith('{')) {
      return null;
    }
    candidate = stripped;
  }

  const normalized = normalizeJsonCandidate(decodeHtmlEntities(candidate));

  try {
    const parsed = JSON.parse(normalized);
    if (parsed && typeof parsed === 'object') {
      const title =
        typeof parsed.title === 'string' ? parsed.title.trim() : undefined;
      const text = typeof parsed.text === 'string' ? parsed.text : undefined;
      if (title || text) {
        return { title, text };
      }
    }
  } catch {
    // ignore malformed JSON
  }
  return null;
};

export const extractBlockFields = (
  blocks?: KnockContentBlock[] | null,
): BlockFields | null => {
  if (!blocks?.length) {
    return null;
  }

  for (const block of blocks) {
    if (!block) continue;
    const sources: Array<string | null | undefined> = [];
    if ('rendered' in block) {
      sources.push((block as { rendered?: string | null }).rendered);
    }
    if ('content' in block) {
      sources.push((block as { content?: string | null }).content);
    }
    for (const source of sources) {
      const parsed = parseBlockPayload(source);
      if (parsed) {
        return parsed;
      }
    }
  }

  return null;
};

export const getNotificationTitle = (
  item: KnockFeedItem,
  blockFields?: BlockFields | null,
): string => {
  if (blockFields?.title) {
    return blockFields.title;
  }

  const data = (item.data as Record<string, unknown> | null) ?? {};
  if (typeof data.title === 'string' && data.title.trim().length > 0) {
    return data.title.trim();
  }

  const primaryActivity = item.activities?.[0] as ExtendedActivity | undefined;
  const actorName = primaryActivity?.actors?.[0]?.name;
  const objectName = primaryActivity?.objects?.[0]?.name;
  const categoryName = item.category?.name;
  return actorName || objectName || categoryName || 'Notification';
};

export const getNotificationBody = (
  item: KnockFeedItem,
  blockFields?: BlockFields | null,
): string => {
  if (blockFields?.text) {
    return stripHtmlTags(blockFields.text);
  }

  const rendered =
    item.rendered_humanized_text ??
    item.rendered_content ??
    item.rendered_email_subject ??
    item.rendered_long_text;

  if (typeof rendered === 'string') {
    return stripHtmlTags(rendered);
  }

  const data = (item.data as Record<string, unknown> | undefined) ?? {};
  if (typeof data.body === 'string') {
    return data.body;
  }
  if (typeof data.message === 'string') {
    return data.message;
  }
  if (typeof data.text === 'string') {
    return data.text;
  }

  return '';
};

export const getSentAt = (item: KnockFeedItem): string | undefined => {
  const timestamps = [
    item.inserted_at,
    item.last_notified_at,
    item.last_updated_at,
    item.triggered_at,
  ].filter(Boolean);
  return timestamps[0];
};

export const getActorAvatar = (item: KnockFeedItem): string | null => {
  const aggregatedActor = item?.actors?.[0];
  const aggregatedAvatar = getAvatarFromRecipient(aggregatedActor);
  if (aggregatedAvatar) {
    return aggregatedAvatar;
  }

  const primaryActivity = item.activities?.[0] as ExtendedActivity | undefined;
  const inlineActor = primaryActivity?.actors?.[0];
  const inlineAvatar = getAvatarFromRecipient(inlineActor);
  if (inlineAvatar) {
    return inlineAvatar;
  }

  const singularActor = primaryActivity?.actor as ActivityEntity | undefined;
  return getAvatarFromRecipient(singularActor);
};

export const timeAgoShort = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y`;
};
