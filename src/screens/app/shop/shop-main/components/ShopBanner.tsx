import { AppText } from '@/components/ui';
import { useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, {
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';
import {
  Banner,
  useGetActiveBanners,
} from '@/screens/app/home/hooks/useGetActiveBanners';

const ShopBanner = () => {
  const { width } = useWindowDimensions();
  const ref = useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const { banners, isLoading } = useGetActiveBanners();

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const handleBannerPress = (banner: Banner) => {
    if (banner.link) {
      Linking.openURL(banner.link).catch(err =>
        console.error('Failed to open link:', err),
      );
    }
  };

  const renderItem = ({ item, index }: { item: Banner; index: number }) => {
    return (
      <Pressable
        key={item.id}
        onPress={() => handleBannerPress(item)}
        className="flex-1"
      >
        <Image
          source={{ uri: item.imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
        {item.title && (
          <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-3">
            <AppText className="text-white text-base font-semibold">
              {item.title}
            </AppText>
            {item.description && (
              <AppText className="text-white/90 text-sm mt-1">
                {item.description}
              </AppText>
            )}
          </View>
        )}
      </Pressable>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <View className="mb-4 h-[350px] justify-center items-center bg-gray-100 rounded-xl">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Don't render if no banners
  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <View className="mb-4 rounded-xl overflow-hidden">
      <Carousel
        loop={banners.length > 1}
        ref={ref}
        width={width - 16 * 2}
        height={350}
        snapEnabled
        pagingEnabled
        autoPlay={banners.length > 1}
        autoPlayInterval={3000}
        data={banners}
        onProgressChange={progress}
        style={{ width: '100%' }}
        renderItem={renderItem}
      />
      {banners.length > 1 && (
        <Pagination.Basic
          progress={progress}
          data={banners}
          dotStyle={{
            width: 25,
            height: 4,
            backgroundColor: '#D1D5DB',
          }}
          activeDotStyle={{
            overflow: 'hidden',
            backgroundColor: '#000000',
          }}
          containerStyle={{
            marginTop: 10,
            position: 'absolute',
            bottom: 10,
            alignSelf: 'center',
          }}
          onPress={onPressPagination}
        />
      )}
    </View>
  );
};

export default ShopBanner;
