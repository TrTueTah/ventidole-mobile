import { AppInput, Icon } from '@/components/ui';
import { useChatChannels } from '@/hooks/useChatChannels';
import { useColors } from '@/hooks/useColors';
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { RootStackParamList } from '@/navigation/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useRef, useState } from 'react';
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

const ChatListScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const colors = useColors();
  const { channels, isLoading, isFetching, refetch } = useChatChannels();
  const { user } = useGetCurrentUser();
  const scrollY = useSharedValue(0);
  const lastScrollY = useRef(0);
  const headerVisible = useSharedValue(true);
  const createChannelModalRef = useRef<CreateChannelModalRef>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isIdol = user?.role === 'IDOL';

  // Check if user has already created a channel
  const hasCreatedChannel = useMemo(() => {
    if (!user?.id) return false;
    return channels.some(channel => {
      const createdById =
        (channel.data as any)?.created_by_id || channel.data?.created_by?.id;
      return createdById === user.id;
    });
  }, [channels, user?.id]);

  // Filter channels based on search query
  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return channels;

    const query = searchQuery.toLowerCase();
    return channels.filter(channel => {
      const channelName = (
        (channel.data as any)?.name ||
        channel.data?.name ||
        ''
      ).toLowerCase();
      return channelName.includes(query);
    });
  }, [channels, searchQuery]);

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
      navigation.navigate('ChatStack', {
        screen: 'ChatWindow',
        params: { channelId },
      });
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

      {/* Search Input */}
      <View className="px-4 pb-3 bg-background" style={{ paddingTop: 120 }}>
        <AppInput
          placeholder="Search channels..."
          variant="default"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="rounded-full"
          rightIcon={
            searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="X" className="w-5 h-5 text-neutrals500" />
              </TouchableOpacity>
            ) : undefined
          }
          leftIcon={<Icon name="Search" className="w-5 h-5 text-neutrals500" />}
        />
      </View>

      <FlatList
        data={filteredChannels}
        extraData={filteredChannels.map(ch => ({
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
        contentContainerStyle={{ paddingBottom: 16 }}
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

      {/* Floating Action Button - Create Channel (Idol Only, No Channel Created) */}
      {isIdol && !hasCreatedChannel && (
        <TouchableOpacity
          onPress={() => createChannelModalRef.current?.open()}
          className="absolute right-4 bottom-4 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
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
      )}

      {/* Create Channel Modal */}
      <CreateChannelModal
        ref={createChannelModalRef}
        onSuccess={handleChannelCreated}
      />
    </View>
  );
};

export default ChatListScreen;
