import { AppText } from '@/components/ui';
import { Image, TouchableOpacity, View } from 'react-native';

export interface ProductCardData {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
}

interface ProductCardProps {
  product: ProductCardData;
  onPress: (productId: string) => void;
}

const ProductCard = ({ product, onPress }: ProductCardProps) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(product.id)}
      className="w-full mr-4 rounded-lg"
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: product.imageUrl }}
        className="w-full h-[180px] rounded-lg mb-2"
        resizeMode="cover"
      />
      <AppText
        variant="labelSmall"
        weight="semibold"
        numberOfLines={2}
        className="mb-1 min-h-[32px]"
      >
        {product.name}
      </AppText>
      <AppText variant="body" weight="bold" className="mb-2">
        USD ${product.price}
      </AppText>
      <View className="bg-primary px-2 py-1 rounded self-start mb-1">
        <AppText
          variant="labelSmall"
          weight="bold"
          className="text-white uppercase"
        >
          EXCLUSIVE
        </AppText>
      </View>
      <AppText variant="labelSmall" color="muted">
        ✈️ Shipped from HCM
      </AppText>
    </TouchableOpacity>
  );
};

export default ProductCard;
