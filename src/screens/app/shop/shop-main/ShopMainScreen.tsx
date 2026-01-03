import ShopCard from '@/components/card/shop-card/ShopCard';
import ShopCardSkeleton from '@/components/card/shop-card/ShopCardSkeleton';
import { AppText } from '@/components/ui';
import { ScrollView, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import ShopBanner from './components/ShopBanner';
import ShopHeader from './components/ShopHeader';
import ShopList from './components/ShopList';
import { useGetFollowingShops } from './hooks/useGetFollowingShops';

const ShopMainScreen = () => {
  const headerVisible = useSharedValue(true);
  const { shops, isLoading, error } = useGetFollowingShops();

  return (
    <View className="flex-1 bg-background">
      <ShopHeader headerVisible={headerVisible} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 120, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <ShopBanner />
        {/* Shop List */}
        <ShopList />

        {/* Shop Cards Section */}
        <View className="mt-4 gap-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map(index => (
                <ShopCardSkeleton key={index} />
              ))}
            </>
          ) : error ? (
            <AppText variant="body" color="muted" className="text-center">
              Failed to load shops
            </AppText>
          ) : shops.length > 0 ? (
            shops.map(shop => <ShopCard key={shop.id} shop={shop} />)
          ) : (
            <AppText variant="body" color="muted" className="text-center">
              No following shops found
            </AppText>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ShopMainScreen;
