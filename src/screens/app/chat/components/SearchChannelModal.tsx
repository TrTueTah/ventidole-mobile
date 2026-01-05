import { AppButton, AppInput, AppText, Avatar, Icon } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { formatNumber } from '@/utils';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Channel } from 'stream-chat';
import { useChatContext } from 'stream-chat-react-native';
import { useGetAllChannels } from '../hooks/useGetAllChannels';
import { useJoinChannel } from '../hooks/useJoinChannel';
import { useLeaveChannel } from '../hooks/useLeaveChannel';

export interface SearchChannelModalRef {
  present: () => void;
  dismiss: () => void;
}

const SearchChannelModal = forwardRef<SearchChannelModalRef>((_, ref) => {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { client } = useChatContext();
  const { user } = useGetCurrentUser();

  // Calculate snap point to be full screen
  const snapPoints = useMemo(() => {
    const screenHeight = Dimensions.get('window').height;
    return [screenHeight - insets.top];
  }, [insets.top]);

  // Fetch all channels with GetStream search
  const { channels, isLoading, isLoadingMore, hasMore, loadMore, refresh } =
    useGetAllChannels({
      limit: 20,
      search: searchQuery,
    });

  const { joinChannel, isJoining } = useJoinChannel();
  const { leaveChannel, isLeaving } = useLeaveChannel();

  const [joiningChannelId, setJoiningChannelId] = useState<string | null>(null);
  const [leavingChannelId, setLeavingChannelId] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetModalRef.current?.present(),
    dismiss: () => bottomSheetModalRef.current?.dismiss(),
  }));

  // Check if user is member of a channel
  const isUserMember = useCallback(
    (channel: Channel) => {
      if (!user?.id) return false;
      return channel.state.members[user.id] !== undefined;
    },
    [user?.id],
  );

  const handleJoinToggle = useCallback(
    (channel: Channel, isJoined: boolean) => {
      const channelId =
        channel.id || channel.cid?.replace('messaging:', '') || '';

      if (isJoined) {
        Alert.alert(
          'Leave Channel',
          'Are you sure you want to leave this channel?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Leave',
              style: 'destructive',
              onPress: () => {
                setLeavingChannelId(channelId);
                leaveChannel(
                  { params: { path: { channelId } } },
                  {
                    onSuccess: () => {
                      setLeavingChannelId(null);
                      refresh();
                    },
                    onError: (error: any) => {
                      setLeavingChannelId(null);
                      Alert.alert(
                        'Error',
                        error.message || 'Failed to leave channel',
                      );
                    },
                  },
                );
              },
            },
          ],
        );
      } else {
        setJoiningChannelId(channelId);
        joinChannel(
          { params: { path: { channelId } } },
          {
            onSuccess: () => {
              setJoiningChannelId(null);
              refresh();
            },
            onError: (error: any) => {
              setJoiningChannelId(null);
              Alert.alert('Error', error.message || 'Failed to join channel');
            },
          },
        );
      }
    },
    [joinChannel, leaveChannel, refresh],
  );

  const renderChannelItem = ({ item }: { item: Channel }) => {
    const channelId = item.id || item.cid?.replace('messaging:', '') || '';
    const isJoined = isUserMember(item);
    const isLoadingThisItem =
      (isJoining && joiningChannelId === channelId) ||
      (isLeaving && leavingChannelId === channelId);

    return (
      <View className="flex-row items-center px-4 py-4 border-b border-neutrals800">
        <Avatar
          source={{ uri: ((item.data as any)?.image as string) || undefined }}
          size="lg"
          className="mr-3"
        />

        <View className="flex-1 justify-center">
          <AppText
            variant="body"
            weight="bold"
            numberOfLines={1}
            className="mb-1"
          >
            {((item.data as any)?.name as string) || 'Unnamed Channel'}
          </AppText>
          {(item.data as any)?.description && (
            <AppText
              variant="bodySmall"
              color="muted"
              numberOfLines={1}
              className="mb-1"
            >
              {(item.data as any).description as string}
            </AppText>
          )}
          <AppText variant="bodySmall" color="muted">
            {formatNumber(Object.keys(item.state?.members || {}).length)}{' '}
            members
          </AppText>
        </View>

        <AppButton
          variant={isJoined ? 'outline' : 'primary'}
          size="sm"
          onPress={() => handleJoinToggle(item, isJoined)}
          loading={isLoadingThisItem}
          disabled={isLoadingThisItem}
          className="min-w-[80px]"
        >
          {isJoined ? 'Joined' : 'Join'}
        </AppButton>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center p-8">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      );
    }

    return (
      <View className="flex-1 justify-center items-center p-8">
        <AppText variant="body" color="muted" className="text-center">
          {searchQuery
            ? 'No channels found matching your search'
            : 'No channels available'}
        </AppText>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View className="py-4 items-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.neutrals700 }}
    >
      {/* Header */}
      <View className="flex-row gap-2 items-start overflow-visible px-4 py-4 justify-between">
        <View className="flex-[7] overflow-visible">
          <AppInput
            placeholder="Search channels"
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
            leftIcon={
              <Icon name="Search" className="w-5 h-5 text-neutrals500" />
            }
          />
        </View>
        <View className="flex-1">
          <TouchableOpacity
            onPress={() => bottomSheetModalRef.current?.dismiss()}
            className="p-2 mr-3 bg-background border border-neutrals900 rounded-full w-11 h-11 items-center justify-center"
          >
            <Icon name="X" className="w-6 h-6 text-foreground" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Channels List */}
      <BottomSheetFlatList
        data={channels}
        keyExtractor={(item: Channel) => item.id || item.cid || ''}
        renderItem={renderChannelItem}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
        refreshing={false}
        onRefresh={refresh}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </BottomSheetModal>
  );
});

SearchChannelModal.displayName = 'SearchChannelModal';

export default SearchChannelModal;
