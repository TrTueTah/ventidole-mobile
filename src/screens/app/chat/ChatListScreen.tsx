import { Icon } from '@/components/ui';
import { useChatChannels } from '@/hooks/useChatChannels';
import { useColors } from '@/hooks/useColors';
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { ChatStackScreenProps } from '@/navigation/types';
import { useCallback, useRef } from 'react';
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { Channel } from 'stream-chat';
import ChannelListSkeleton from './components/ChannelListSkeleton';
import ChatHeader from './components/ChatHeader';
import CreateChannelModal, {
  CreateChannelModalRef,
} from './components/CreateChannelModal';
import CustomChannelPreview from './components/CustomChannelPreview';
import EmptyChannels from './components/EmptyChannels';
import SearchChannelModal, {
  SearchChannelModalRef,
} from './components/SearchChannelModal';

const ChatListScreen = ({ navigation }: ChatStackScreenProps<'ChatList'>) => {
  const colors = useColors();
  const { channels, isLoading, isFetching, refetch } = useChatChannels();
  const { user } = useGetCurrentUser();
  const scrollY = useSharedValue(0);
  const lastScrollY = useRef(0);
  const headerVisible = useSharedValue(true);
  const createChannelModalRef = useRef<CreateChannelModalRef>(null);
  const searchChannelModalRef = useRef<SearchChannelModalRef>(null);

  const isIdol = user?.role === 'IDOL';

  // Check if a channel is owned by current user
  const isMyChannel = (channel: Channel) => {
    if (!user?.id) return false;
    // Check if user created the channel
    const createdById =
      (channel.data as any)?.created_by_id || channel.data?.created_by?.id;
    return createdById === user.id;
  };

  const handleScroll = useCallback(
    (event: any) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const delta = currentScrollY - lastScrollY.current;

      if (currentScrollY > 50) {
        if (delta > 5 && headerVisible.value) {
          headerVisible.value = false;
        } else if (delta < -5 && !headerVisible.value) {
          headerVisible.value = true;
        }
      } else {
        headerVisible.value = true;
      }

      lastScrollY.current = currentScrollY;
      scrollY.value = currentScrollY;
    },
    [headerVisible, scrollY],
  );

  const onSelectChannel = (channel: Channel) => {
    const channelId = channel.id || channel.cid?.replace('messaging:', '');
    if (channelId) {
      navigation.navigate('ChatWindow', { channelId });
    }
  };

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleChannelCreated = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderItem = useCallback(
    ({ item }: { item: Channel }) => {
      // Create a unique key that changes when channel state changes
      const lastMessageId =
        item.state?.messages?.[item.state.messages.length - 1]?.id;
      const unreadCount = item.state?.unreadCount || 0;

      return (
        <CustomChannelPreview
          key={`${item.id || item.cid}-${lastMessageId}-${unreadCount}`}
          channel={item}
          onSelect={() => onSelectChannel(item)}
          isMyChannel={isMyChannel(item)}
        />
      );
    },
    [onSelectChannel, isMyChannel],
  );

  return (
    <View className="flex-1 bg-background">
      <ChatHeader headerVisible={headerVisible} />

      <FlatList
        data={channels}
        extraData={channels.map(ch => ({
          id: ch.id || ch.cid,
          lastMsg: ch.state?.messages?.[ch.state.messages.length - 1]?.id,
          unread: ch.state?.unreadCount,
          lastMsgTime:
            ch.state?.messages?.[ch.state.messages.length - 1]?.created_at,
        }))}
        keyExtractor={item => {
          const lastMessageId =
            item.state?.messages?.[item.state.messages.length - 1]?.id;
          const unreadCount = item.state?.unreadCount || 0;
          return `${item.id || item.cid}-${lastMessageId}-${unreadCount}`;
        }}
        renderItem={renderItem}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 108 }}
        ListEmptyComponent={
          isLoading ? <ChannelListSkeleton count={8} /> : <EmptyChannels />
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />

      {/* Floating Action Buttons - Idol Only */}
      {isIdol && (
        <View className="absolute right-4 bottom-4 gap-3">
          {/* Search & Join Channels Button */}
          <TouchableOpacity
            onPress={() => searchChannelModalRef.current?.present()}
            className="w-14 h-14 rounded-full bg-neutrals800 items-center justify-center shadow-lg"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Icon name="Search" className="w-6 h-6 text-foreground" />
          </TouchableOpacity>

          {/* Create Channel Button */}
          <TouchableOpacity
            onPress={() => createChannelModalRef.current?.open()}
            className="w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Icon name="Plus" className="w-6 h-6 text-white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Modals */}
      <CreateChannelModal
        ref={createChannelModalRef}
        onSuccess={handleChannelCreated}
      />
      <SearchChannelModal ref={searchChannelModalRef} />
    </View>
  );
};

export default ChatListScreen;
