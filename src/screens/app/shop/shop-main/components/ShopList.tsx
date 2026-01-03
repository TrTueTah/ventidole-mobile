import { AppText, Icon } from '@/components/ui';
import { components } from '@/schemas/openapi';
import { useNavigation } from '@react-navigation/native';
import { useRef } from 'react';
import { FlatList, Image, TouchableOpacity, View } from 'react-native';
import { useGetFollowingShops } from '../hooks/useGetFollowingShops';
import ShopListSkeleton from './ShopListSkeleton';
import ShopModal, { ShopModalRef } from './ShopModal';

type Shop = components['schemas']['ShopListDto'];

const ShopList = () => {
  const navigation = useNavigation();
  const shopModalRef = useRef<ShopModalRef>(null);

  const { shops, isLoading } = useGetFollowingShops();

  const handleShopPress = (shopId: string, shopName: string) => {
    navigation.navigate('ShopDetail', { shopId, shopName });
  };

  return (
    <>
      <View className="bg-background rounded-xl shadow py-4 mb-4">
        {/* Title */}
        <AppText variant="heading3" weight="bold" className="px-4 mb-4">
          My Artists' Shops
        </AppText>

        {/* Horizontal Shop List */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 4, paddingHorizontal: 16 }}
          data={isLoading ? Array(5).fill({}) : shops}
          keyExtractor={(item: Shop, index: number) =>
            isLoading ? `skeleton-${index}` : item.id
          }
          renderItem={({ item, index }: { item: Shop; index: number }) =>
            isLoading ? (
              <ShopListSkeleton key={`skeleton-${index}`} />
            ) : (
              <TouchableOpacity
                onPress={() => handleShopPress(item.id, item.name)}
                className="flex-col items-center gap-2 w-24"
              >
                <Image
                  source={{
                    uri: item.avatarUrl || 'https://i.pravatar.cc/150?img=1',
                  }}
                  className="w-20 h-20 rounded-full shadow-sm shadow-neutrals900/20"
                  resizeMode="cover"
                />
                <AppText
                  variant="labelSmall"
                  className="text-center"
                  numberOfLines={1}
                >
                  {item.name}
                </AppText>
              </TouchableOpacity>
            )
          }
        />

        {/* Search Button */}
        <View className="px-4 mt-4">
          <TouchableOpacity
            onPress={() => shopModalRef.current?.open()}
            className="flex-row items-center justify-center gap-2 bg-background border border-neutrals900 rounded-full py-3"
            activeOpacity={0.7}
          >
            <Icon name="Search" className="w-4 h-4 text-foreground" />
            <AppText variant="body" className="mt-1">
              Search for more artists' shops
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Shop Modal */}
      <ShopModal ref={shopModalRef} onShopPress={handleShopPress} />
    </>
  );
};

export default ShopList;
