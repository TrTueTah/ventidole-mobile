import { ActionButton, FeedItem, Recipient } from '@knocklabs/client';

export interface KnockNotificationViewItem {
  id: string;
  userAvatar?: string | null;
  title: string;
  body: string;
  sentAtLabel: string;
  isUnread: boolean;
  actions: ActionButton[];
  feedItem: FeedItem;
}

export interface KnockNavigationPayload {
  action?: string;
  type?: string;
  eventId?: string;
  event_id?: string;
  hostId?: string;
  host_id?: string;
  guestId?: string;
  guest_id?: string;
  chatId?: string;
  chat_id?: string;
  isJoinedEvents?: boolean;
  is_joined_event?: boolean;
  joinedEvent?: boolean;
  initialTab?: string;
  initial_tab?: string;
  targetTab?: string;
  target_tab?: string;
  screen?: string;
  route?: string;
  params?: Record<string, unknown>;
  navigation?: {
    action?: string;
    params?: Record<string, unknown>;
  };
}

export type LegacyNotificationAction =
  | 'chat'
  | 'joinedEvent'
  | 'invites'
  | 'connection'
  | 'myEvents'
  | 'requests'
  | 'system'
  | 'friendConnection'
  | 'profile';

export interface KnockFeedItemExtras {
  inserted_at?: string;
  last_notified_at?: string;
  last_updated_at?: string;
  triggered_at?: string;
  rendered_humanized_text?: string;
  rendered_content?: string;
  rendered_email_subject?: string;
  rendered_long_text?: string;
  actions?: ActionButton[];
  // Root level read/seen status fields
  read_at?: string | null;
  seen_at?: string | null;
  archived_at?: string | null;
  key?: string;
  source?: {
    key?: string | null;
    categories?: unknown;
  };
  category?: {
    name?: string;
  };
}

export type ActivityEntity = { name?: string | null; avatar?: string | null };
export type ExtendedActivity = (FeedItem['activities'] extends Array<infer T>
  ? T
  : never) & {
  actors?: ActivityEntity[];
  objects?: ActivityEntity[];
  actor?: Recipient | null;
};

type FeedBlocks = FeedItem['blocks'];
export type KnockContentBlock = FeedBlocks extends (infer B)[] | undefined
  ? B
  : never;

export type KnockFeedItem = FeedItem &
  KnockFeedItemExtras & {
    blocks?: FeedBlocks;
  };

export interface BlockFields {
  title?: string;
  text?: string;
}
