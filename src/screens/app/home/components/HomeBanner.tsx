import { AppText } from '@/components/ui';
import { useRef } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, {
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';

const defaultDataWith6Colors = [
  '#B0604D',
  '#899F9C',
  '#B3C680',
  '#5C6265',
  '#F5D399',
  '#F1F1F1',
];

const HomeBanner = () => {
  const { width } = useWindowDimensions();
  const ref = useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const renderItem = ({ item, index }: { item: string; index: number }) => {
    return (
      <View
        key={index}
        style={{ backgroundColor: item }}
        className="flex-1 justify-center items-center shadow-lg shadow-black/20"
      >
        <AppText className="text-white text-xl font-bold">
          Slide {index + 1}
        </AppText>
      </View>
    );
  };

  return (
    <View className="mb-4">
      <Carousel
        loop
        ref={ref}
        width={width}
        height={200}
        snapEnabled
        pagingEnabled
        autoPlay
        autoPlayInterval={2500}
        data={defaultDataWith6Colors}
        onProgressChange={progress}
        style={{ width: '100%' }}
        renderItem={renderItem}
      />
      <Pagination.Basic
        progress={progress}
        data={defaultDataWith6Colors}
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
    </View>
  );
};

export default HomeBanner;
