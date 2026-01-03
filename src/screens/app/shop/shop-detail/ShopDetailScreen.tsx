import ProductCard, {
  ProductCardData,
} from '@/components/card/product-card/ProductCard';
import ProductCardSkeleton from '@/components/card/product-card/ProductCardSkeleton';
import { AppText } from '@/components/ui';
import { components } from '@/schemas/openapi';
import { useRoute } from '@react-navigation/native';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGetShopProducts } from './hooks/useGetShopProducts';

type UserProductDto = components['schemas']['UserProductDto'];

type RouteParams = {
  shopId: string;
  shopName?: string;
};

const CATEGORIES = ['MERCH', "SEASON'S GREETINGS", 'ALBUM', 'TOUR MERCH'];

const ShopDetailScreen = () => {
  const route = useRoute();
  const { shopId, shopName } = (route.params as RouteParams) || {};
  const [activeCategory, setActiveCategory] = useState(0);

  const { products, isLoading, isLoadingMore, loadMore, hasMore } =
    useGetShopProducts({
      shopId,
      limit: 20,
    });

  const handleProductPress = (productId: string) => {
    // Navigate to product detail
    console.log('Product pressed:', productId);
  };

  const handleEndReached = () => {
    if (hasMore && !isLoadingMore) {
      loadMore();
    }
  };

  // Map UserProductDto to ProductCardData
  const mappedProducts: ProductCardData[] = products.map(
    (product: UserProductDto) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl:
        Array.isArray(product.mediaUrls) && product.mediaUrls.length > 0
          ? String(product.mediaUrls[0])
          : 'https://via.placeholder.com/180',
      stock: product.stock,
    }),
  );

  const renderHeader = () => (
    <View className="bg-background">
      {/* Shop Banner */}
      <View className="bg-primary h-48 rounded-xl mx-4 mt-4 mb-4 items-center justify-center">
        <AppText variant="heading2" weight="bold" className="text-white">
          {shopName || 'Shop'}
        </AppText>
      </View>

      {/* Products Section */}
      <View className="bg-background rounded-t-2xl shadow-lg shadow-neutrals900/20 pt-4 px-4">
        <AppText variant="heading3" weight="bold" className="mb-2">
          Products
        </AppText>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4 pt-4"
        >
          {CATEGORIES.map((category, index) => (
            <TouchableOpacity
              key={category}
              onPress={() => setActiveCategory(index)}
              className={`px-5 py-2.5 rounded-full mr-2 ${
                activeCategory === index ? 'bg-foreground' : 'bg-neutrals900'
              }`}
              activeOpacity={0.7}
            >
              <AppText
                variant="labelSmall"
                weight="semibold"
                className={
                  activeCategory === index
                    ? 'text-background'
                    : 'text-neutrals100'
                }
              >
                {category}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return <View className="h-4" />;

    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="flex-row flex-wrap justify-between px-4 bg-background">
          {[1, 2, 3, 4, 5, 6].map(index => (
            <ProductCardSkeleton key={index} />
          ))}
        </View>
      );
    }

    return (
      <View className="py-8 items-center">
        <AppText variant="body" color="muted">
          No products available
        </AppText>
      </View>
    );
  };

  const renderProductItem = ({
    item,
    index,
  }: {
    item: ProductCardData;
    index: number;
  }) => (
    <View className="w-[48%] mb-4">
      <ProductCard product={item} onPress={handleProductPress} />
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <FlatList
        ListHeaderComponent={renderHeader}
        data={mappedProducts}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          paddingHorizontal: 16,
        }}
        contentContainerStyle={{
          paddingBottom: 16,
          backgroundColor: 'background',
        }}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ShopDetailScreen;
