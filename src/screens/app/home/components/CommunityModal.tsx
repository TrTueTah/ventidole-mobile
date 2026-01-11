import { AppInput, AppText, Icon } from '@/components/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { useColors } from '@/hooks/useColors';
import { RootStackParamList } from '@/navigation/types';
import { cn } from '@/utils';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import CommunityItem from './CommunityItem';
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
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
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

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetModalRef.current?.present(),
    dismiss: () => bottomSheetModalRef.current?.dismiss(),
  }));

  const handleCommunityPress = useCallback(
    (communityId: string) => {
      bottomSheetModalRef.current?.dismiss();
      navigation.navigate('CommunityStack', { communityId });
    },
    [navigation],
  );

  const renderCommunityItem = ({ item }: { item: any }) => {
    return <CommunityItem item={item} onPress={handleCommunityPress} />;
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
