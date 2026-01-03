import { AppInput, AppText, Icon } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { components } from 'src/schemas/openapi';
import { useGetShops } from '../hooks/useGetShops';

type ShopDto = components['schemas']['ShopDto'];

interface ShopModalProps {
  onShopPress: (shopId: string, shopName: string) => void;
}

export interface ShopModalRef {
  open: () => void;
  close: () => void;
}

const ShopModal = forwardRef<ShopModalRef, ShopModalProps>(
  ({ onShopPress }, ref) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const colors = useColors();
    const insets = useSafeAreaInsets();

    // Calculate snap point to be full screen
    const snapPoints = useMemo(() => {
      const screenHeight = Dimensions.get('window').height;
      return [screenHeight - insets.top];
    }, [insets.top]);

    // Debounce search query
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearch(searchQuery);
      }, 500);

      return () => clearTimeout(timer);
    }, [searchQuery]);

    const { shops, isLoading, isLoadingMore, loadMore, hasMore } = useGetShops({
      limit: 20,
      search: debouncedSearch,
    });

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.present(),
      close: () => bottomSheetRef.current?.dismiss(),
    }));

    const handleShopPress = (shopId: string, shopName: string) => {
      onShopPress(shopId, shopName);
      bottomSheetRef.current?.dismiss();
    };

    const handleEndReached = () => {
      if (hasMore && !isLoadingMore) {
        loadMore();
      }
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

    const renderShopItem = ({ item }: { item: ShopDto }) => {
      return (
        <TouchableOpacity
          onPress={() => handleShopPress(item.id, item.name)}
          className="flex-row items-center px-4 py-4"
          activeOpacity={0.7}
        >
          <Image
            source={{
              uri:
                (typeof item.avatarUrl === 'string' ? item.avatarUrl : null) ||
                'https://via.placeholder.com/56',
            }}
            className="w-10 h-10 rounded-full mr-3"
            resizeMode="cover"
          />
          <View className="flex-1">
            <AppText variant="body" weight="bold" numberOfLines={1}>
              {item.name}
            </AppText>
          </View>
        </TouchableOpacity>
      );
    };

    const renderFooter = () => {
      if (!isLoadingMore) return null;
      return (
        <View className="py-5">
          <ActivityIndicator size="small" color={colors.foreground} />
        </View>
      );
    };

    const renderEmpty = () => {
      if (isLoading) {
        return (
          <View className="flex-1 justify-center items-center py-8">
            <ActivityIndicator size="large" color={colors.foreground} />
          </View>
        );
      }

      return (
        <View className="flex-1 justify-center items-center py-8 px-8">
          <AppText variant="body" className="text-neutrals100 text-center">
            {searchQuery
              ? 'No shops found matching your search'
              : 'No shops available'}
          </AppText>
        </View>
      );
    };

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.background }}
        handleIndicatorStyle={{ backgroundColor: colors.neutrals600 }}
      >
        {/* Header */}
        <View className="flex-row gap-2 items-start overflow-visible px-4 py-4 justify-between">
          <View className="flex-[7] overflow-visible">
            <AppInput
              placeholder="Search for shops"
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
              onPress={() => bottomSheetRef.current?.dismiss()}
              className="p-2 mr-3 bg-background border border-neutrals900 rounded-full w-11 h-11 items-center justify-center"
            >
              <Icon name="X" className="w-6 h-6 text-foreground" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Shop List */}
        <BottomSheetFlatList
          data={shops}
          keyExtractor={(item: ShopDto) => item.id}
          renderItem={renderShopItem}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </BottomSheetModal>
    );
  },
);

ShopModal.displayName = 'ShopModal';

export default ShopModal;
