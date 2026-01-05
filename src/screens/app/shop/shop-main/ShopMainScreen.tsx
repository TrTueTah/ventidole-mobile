import ShopCard from '@/components/card/shop-card/ShopCard';
import ShopCardSkeleton from '@/components/card/shop-card/ShopCardSkeleton';
import { AppText } from '@/components/ui';
import { useCallback, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import ShopBanner from './components/ShopBanner';
import ShopHeader from './components/ShopHeader';
import ShopList from './components/ShopList';
import { useGetFollowingShops } from './hooks/useGetFollowingShops';

const ShopMainScreen = () => {
  const scrollY = useSharedValue(0);
  const lastScrollY = useRef(0);
  const headerVisible = useSharedValue(true);
  const { shops, isLoading, error } = useGetFollowingShops();

  const handleScroll = useCallback(
    (event: any) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const delta = currentScrollY - lastScrollY.current;

      // Only hide/show header when scrolled past a threshold
      if (currentScrollY > 50) {
        if (delta > 5 && headerVisible.value) {
          // Scrolling down - hide header
          headerVisible.value = false;
        } else if (delta < -5 && !headerVisible.value) {
          // Scrolling up - show header
          headerVisible.value = true;
        }
      } else {
        // Always show header when near the top
        headerVisible.value = true;
      }

      lastScrollY.current = currentScrollY;
      scrollY.value = currentScrollY;
    },
    [headerVisible, scrollY],
  );

  return (
    <View className="flex-1 bg-background">
      <ShopHeader headerVisible={headerVisible} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 120, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
