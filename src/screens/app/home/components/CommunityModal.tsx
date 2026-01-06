import {
  AppButton,
  AppInput,
  AppText,
  Avatar,
  Badge,
  Icon,
} from '@/components/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { useColors } from '@/hooks/useColors';
import { cn, formatNumber } from '@/utils';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useQueryClient } from '@tanstack/react-query';
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
  Dimensions,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetCommunitiesList } from '../hooks/useGetCommunitiesList';
import { useGetJoinedCommunities } from '../hooks/useGetJoinedComunities';
import { useJoinCommunity } from '../hooks/useJoinCommunity';
import { useLeaveCommunity } from '../hooks/useLeaveCommunity';
import CommunityModalSkeleton from './CommunityModalSkeleton';

export interface CommunityModalRef {
  present: () => void;
  dismiss: () => void;
}

type FilterType = 'All' | 'Joined';

const FILTERS: FilterType[] = ['All', 'Joined'];

const CommunityModal = forwardRef<CommunityModalRef>((_, ref) => {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const queryClient = useQueryClient();
  const { showError, showWarning } = useToast();

  // Calculate snap point to be full screen
  const snapPoints = useMemo(() => {
    const screenHeight = Dimensions.get('window').height;
    return [screenHeight - insets.top];
  }, [insets.top]);

  // Fetch all communities with server-side search
  const allCommunitiesResult = useGetCommunitiesList({
    limit: 20,
    search: searchQuery,
  });

  // Fetch joined communities
  const joinedCommunitiesResult = useGetJoinedCommunities({ limit: 20 });

  // Select the appropriate result based on active filter
  const selectedResult =
    activeFilter === 'Joined' ? joinedCommunitiesResult : allCommunitiesResult;

  const {
    communities: rawCommunities,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = selectedResult;

  // For Joined filter, apply client-side search since API doesn't support it
  const communities = useMemo(() => {
    if (activeFilter !== 'Joined' || !searchQuery.trim()) {
      return rawCommunities;
    }

    const query = searchQuery.toLowerCase();
    return rawCommunities.filter((community: any) =>
      community.name?.toLowerCase().includes(query),
    );
  }, [activeFilter, rawCommunities, searchQuery]);

  const {
    mutate: joinCommunity,
    isPending: isJoining,
    variables: joinVariables,
  } = useJoinCommunity();

  const {
    mutate: leaveCommunity,
    isPending: isLeaving,
    variables: leaveVariables,
  } = useLeaveCommunity();

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetModalRef.current?.present(),
    dismiss: () => bottomSheetModalRef.current?.dismiss(),
  }));

  // Helper function to update community isJoined status in cache
  const updateCommunityInCache = useCallback(
    (communityId: string, isJoined: boolean) => {
      let communityToJoin: any = null;

      // Update all communities list
      queryClient.setQueriesData(
        { queryKey: ['get', '/v1/user/community'] },
        (oldData: any) => {
          if (!oldData?.pages) return oldData;

          if (isJoined && !communityToJoin) {
            for (const page of oldData.pages) {
              const found = page.data?.find((c: any) => c.id === communityId);
              if (found) {
                communityToJoin = {
                  ...found,
                  isJoined: true,
                  totalMember: (found.totalMember || 0) + 1,
                };
                break;
              }
            }
          }

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data?.map((community: any) =>
                community.id === communityId
                  ? {
                      ...community,
                      isJoined,
                      totalMember: isJoined
                        ? (community.totalMember || 0) + 1
                        : Math.max((community.totalMember || 0) - 1, 0),
                    }
                  : community,
              ),
            })),
          };
        },
      );

      // Update joined communities list
      queryClient.setQueriesData(
        { queryKey: ['get', '/v1/user/community/joined'] },
        (oldData: any) => {
          if (!oldData?.pages) return oldData;

          if (isJoined && communityToJoin) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any, index: number) =>
                index === 0
                  ? {
                      ...page,
                      data: [communityToJoin, ...(page.data || [])],
                    }
                  : page,
              ),
            };
          } else {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                data: page.data?.filter(
                  (community: any) => community.id !== communityId,
                ),
              })),
            };
          }
        },
      );
    },
    [queryClient],
  );

  const handleJoinToggle = useCallback(
    (communityId: string, isJoined: boolean) => {
      if (isJoined) {
        // Show warning and leave
        // Note: Toast doesn't support confirm dialogs
        showWarning('Leaving community...');
        leaveCommunity(
          {
            params: { path: { id: communityId } },
          },
          {
            onSuccess: () => {
              updateCommunityInCache(communityId, false);
            },
            onError: (error: any) => {
              showError(error.message || 'Failed to leave community');
            },
          },
        );
      } else {
        joinCommunity(
          {
            params: { path: { id: communityId } },
          },
          {
            onSuccess: () => {
              updateCommunityInCache(communityId, true);
            },
            onError: (error: any) => {
              showError(error.message || 'Failed to join community');
            },
          },
        );
      }
    },
    [
      joinCommunity,
      leaveCommunity,
      updateCommunityInCache,
      showWarning,
      showError,
    ],
  );

  const renderCommunityItem = ({ item }: { item: any }) => {
    const isLoadingThisItem =
      (isJoining && joinVariables?.params?.path?.id === item.id) ||
      (isLeaving &&
        leaveVariables?.params?.path &&
        'id' in leaveVariables.params.path &&
        leaveVariables.params.path.id === item.id);

    return (
      <View className="flex-row items-center px-4 py-4 border-b border-neutrals800">
        <Avatar source={{ uri: item.avatarUrl }} size="lg" className="mr-3" />

        <View className="flex-1 justify-center">
          {item.isNew && (
            <Badge variant="default" className="mb-1 self-start">
              <AppText variant="labelSmall" className="text-white uppercase">
                NEW
              </AppText>
            </Badge>
          )}
          <AppText
            variant="body"
            weight="bold"
            numberOfLines={1}
            className="mb-1"
          >
            {item.name}
          </AppText>
          <AppText variant="bodySmall" color="muted">
            {formatNumber(item.totalMember || 0)} members
          </AppText>
        </View>

        <AppButton
          variant={item.isJoined ? 'outline' : 'primary'}
          size="sm"
          onPress={() => handleJoinToggle(item.id, item.isJoined)}
          loading={isLoadingThisItem}
          disabled={isLoadingThisItem}
          className="min-w-[80px]"
        >
          {item.isJoined ? 'Joined' : 'Join'}
        </AppButton>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return <CommunityModalSkeleton />;
    }

    return (
      <View className="flex-1 justify-center items-center p-8">
        <AppText variant="body" color="muted" className="text-center">
          {searchQuery
            ? 'No communities found matching your search'
            : 'No communities available'}
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
            placeholder="Enter artist name"
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

      {/* Filters */}
      <View className="border-b border-neutrals800">
        <View className="flex-row px-4 py-3 gap-3">
          {FILTERS.map(filter => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className={cn(
                'px-4 py-2 rounded-full border',
                activeFilter === filter
                  ? 'bg-foreground border-foreground'
                  : 'bg-transparent border-neutrals800',
              )}
            >
              <AppText
                variant="labelSmall"
                weight="medium"
                className={cn(
                  activeFilter === filter
                    ? 'text-background'
                    : 'text-foreground',
                )}
              >
                {filter}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Communities List */}
      <BottomSheetFlatList
        data={communities}
        keyExtractor={(item: any) => item.id}
        renderItem={renderCommunityItem}
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

CommunityModal.displayName = 'CommunityModal';

export default CommunityModal;
