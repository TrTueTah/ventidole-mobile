import { AppText, Icon } from '@/components/ui';
import { components } from '@/schemas/openapi';
import { useNavigation } from '@react-navigation/native';
import { FlatList, TouchableOpacity, View } from 'react-native';
import ProductCard, { ProductCardData } from '../product-card/ProductCard';

type ShopListDto = components['schemas']['ShopListDto'];
type ShopProductDto = components['schemas']['ShopProductDto'];

interface ShopCardProps {
  shop: ShopListDto;
}

const ShopCard = ({ shop }: ShopCardProps) => {
  const navigation = useNavigation();

  const handleShopPress = () => {
    navigation.navigate('ShopDetail', { shopId: shop.id, shopName: shop.name });
  };

  const handleProductPress = (productId: string, shopName: string) => {
    navigation.navigate('ShopProduct', { productId, shopName });
  };
  // Map shop products to ProductCardData
  const mappedProducts: ProductCardData[] = shop.products.map(
    (product: ShopProductDto) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl:
        Array.isArray(product.mediaUrls) && product.mediaUrls.length > 0
          ? String(product.mediaUrls[0])
          : 'https://via.placeholder.com/140',
      stock: product.stock,
    }),
  );

  return (
    <View className="bg-background rounded-2xl shadow mb-4">
      {/* Shop Header */}
      <TouchableOpacity
        onPress={handleShopPress}
        className="bg-primary px-4 py-4 flex-row items-center gap-2 rounded-t-2xl"
        activeOpacity={0.7}
      >
        <AppText variant="heading3" weight="bold" className="text-white flex-1">
          {shop.name}
        </AppText>
        <Icon name="ChevronRight" className="w-4 h-4 text-white" />
      </TouchableOpacity>

      {/* Products List */}
      <View className="py-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={mappedProducts}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View className="w-[180px]">
              <ProductCard
                product={item}
                onPress={() => handleProductPress(item.id, shop.name)}
              />
            </View>
          )}
        />
      </View>
    </View>
  );
};

export default ShopCard;
