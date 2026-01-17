import { AppButton, AppText } from '@/components/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { useAddToCart } from '@/hooks/useAddToCart';
import { components } from '@/schemas/openapi';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import ProductDetailSkeleton from './components/ProductDetailSkeleton';
import { useGetProductDetail } from './hooks/useGetProductDetail';

type UserProductDetailDto = components['schemas']['UserProductDetailDto'];
type UserProductVariantDto = components['schemas']['UserProductVariantDto'];

type RouteParams = {
  productId: string;
};

type TabType = 'details' | 'notes';

const ProductDetailScreen = () => {
  const { t } = useTranslation();
  const width = Dimensions.get('window').width;
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = (route.params as RouteParams) || {};
  const scrollRef = useRef<ScrollView>(null);
  const { showSuccess, showError } = useToast();

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [selectedTab, setSelectedTab] = useState<TabType>('details');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fetch product details
  const { product, isLoading, error } = useGetProductDetail({
    productId: productId || '',
  });

  // Show skeleton if no productId or while loading
  const shouldShowSkeleton = !productId || isLoading;

  // Add to cart hook
  const { addToCartAsync, isLoading: isAddingToCart } = useAddToCart();

  // Get active variants from the product
  const variants = useMemo(() => {
    if (!product?.variants) return [];
    return product.variants.filter(v => v.isActive);
  }, [product]);

  // Get the currently selected variant
  const selectedVariant = useMemo(() => {
    if (variants.length === 0) return null;
    return variants.find(v => v.id === selectedVariantId) || null;
  }, [variants, selectedVariantId]);

  // Auto-select first variant when variants are loaded
  useEffect(() => {
    if (variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(variants[0].id);
    }
  }, [variants, selectedVariantId]);

  // Get display price and stock based on selected variant or product base
  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const displayStock = selectedVariant?.stock ?? product?.stock ?? 0;

  // Get media URLs
  const mediaUrls = useMemo(() => {
    if (!product?.mediaUrls) return [];
    if (Array.isArray(product.mediaUrls)) {
      return product.mediaUrls.filter(
        (url): url is string => typeof url === 'string',
      );
    }
    return [];
  }, [product?.mediaUrls]);

  // Show loading state
  if (shouldShowSkeleton) {
    return <ProductDetailSkeleton />;
  }

  // Show error state
  if (error || !product) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-4">
        <AppText variant="body" className="text-center">
          {t('APP.PRODUCT.FAILED_TO_LOAD')}
        </AppText>
      </View>
    );
  }

  const handlePurchase = async () => {
    // Check if variant is required and selected
    if (variants.length > 0 && !selectedVariantId) {
      showError(t('APP.PRODUCT.PLEASE_SELECT_VARIANT'));
      return;
    }

    try {
      // Add product to cart
      await addToCartAsync({
        productId: product.id,
        variantId: selectedVariantId || undefined,
        quantity: 1,
        action: 'increase',
      });

      showSuccess(t('APP.PRODUCT.ADDED_TO_CART'));

      // Navigate to cart
      navigation.navigate('Cart');
    } catch (error) {
      showError(
        t('APP.PRODUCT.FAILED_TO_ADD'),
        t('APP.PRODUCT.PLEASE_TRY_AGAIN'),
      );
    }
  };

  const handleScrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 300);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Product Image Carousel */}
        {mediaUrls.length > 0 && (
          <View className="w-full" style={{ height: 300 }}>
            <Carousel
              loop={false}
              width={width}
              height={300}
              data={mediaUrls}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              )}
            />
          </View>
        )}

        {/* Product Info */}
        <View className="p-4 border-b border-neutrals900/10">
          <AppText variant="labelSmall" weight="semibold" className="mb-2">
            {product.shop?.name || t('APP.SHOP.SHOP')}
          </AppText>
          <AppText variant="heading3" weight="semibold" className="mb-2">
            {product.name}
          </AppText>
          {!product.isActive && (
            <View className="flex-row items-center mb-3">
              <AppText
                variant="labelSmall"
                weight="semibold"
                className="text-primary"
              >
                ⏰ {t('APP.PRODUCT.PRE_ORDER')}
              </AppText>
            </View>
          )}
          <AppText variant="heading1" weight="bold" className="mb-2">
            {t('APP.PRODUCT.USD')} ${displayPrice.toFixed(2)}
          </AppText>
          <AppText variant="body" className="text-primary">
            {t('APP.PRODUCT.STOCK_AVAILABLE')} {displayStock}
          </AppText>
        </View>

        {/* Product Variants Selection */}
        {variants.length > 0 ? (
          <View className="p-4 border-b border-neutrals900/10">
            <AppText variant="heading3" weight="semibold" className="mb-3">
              {t('APP.PRODUCT.SELECT_VARIANT')}
            </AppText>
            <View className="flex-row flex-wrap -mx-1">
              {variants.map((variant: UserProductVariantDto) => {
                const isSelected = selectedVariantId === variant.id;
                const isDisabled = variant.stock === 0;
                return (
                  <TouchableOpacity
                    key={variant.id}
                    onPress={() =>
                      !isDisabled && setSelectedVariantId(variant.id)
                    }
                    disabled={isDisabled}
                    className={`px-5 py-3 rounded-full m-1 border ${
                      isDisabled
                        ? 'bg-neutrals900/5 border-neutrals900/20'
                        : isSelected
                          ? 'bg-foreground border-foreground'
                          : 'bg-background border-neutrals900'
                    }`}
                    activeOpacity={0.7}
                  >
                    <AppText
                      variant="labelSmall"
                      weight="semibold"
                      className={
                        isDisabled
                          ? 'text-neutrals900/40'
                          : isSelected
                            ? 'text-background'
                            : 'text-foreground'
                      }
                    >
                      {variant.name}
                      {variant.stock === 0
                        ? ` (${t('APP.PRODUCT.OUT_OF_STOCK')})`
                        : ''}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
            {selectedVariant && (
              <AppText variant="body" className="text-primary mt-2">
                {t('APP.PRODUCT.PRICE')}: {t('APP.PRODUCT.USD')} $
                {selectedVariant.price.toFixed(2)} • {t('APP.PRODUCT.STOCK')}:{' '}
                {selectedVariant.stock}
              </AppText>
            )}
          </View>
        ) : (
          product.type && (
            <View className="p-4 border-b border-neutrals900/10">
              <AppText variant="heading3" weight="semibold">
                {t('APP.PRODUCT.TYPE')}: {product.type.name}
              </AppText>
            </View>
          )
        )}

        {/* Purchase Button */}
        <View className="p-4 border-b border-neutrals900/10">
          <AppButton
            onPress={handlePurchase}
            disabled={
              (variants.length > 0 && !selectedVariantId) ||
              displayStock === 0 ||
              isAddingToCart
            }
            className={
              (variants.length > 0 && !selectedVariantId) ||
              displayStock === 0 ||
              isAddingToCart
                ? 'bg-neutrals900/40'
                : 'bg-primary'
            }
          >
            {isAddingToCart ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <AppText variant="heading3" weight="bold" className="text-white">
                {displayStock === 0
                  ? t('APP.PRODUCT.OUT_OF_STOCK')
                  : t('APP.PRODUCT.PURCHASE')}
              </AppText>
            )}
          </AppButton>
        </View>

        {/* Tabs */}
        <View className="flex-row border-b border-neutrals900/10">
          <TouchableOpacity
            onPress={() => setSelectedTab('details')}
            className={`flex-1 py-4 items-center ${
              selectedTab === 'details' ? 'border-b-2 border-foreground' : ''
            }`}
            activeOpacity={0.7}
          >
            <AppText
              variant="heading3"
              weight={selectedTab === 'details' ? 'semibold' : 'regular'}
              className={
                selectedTab === 'details'
                  ? 'text-foreground'
                  : 'text-neutrals100'
              }
            >
              {t('APP.PRODUCT.DETAILS')}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTab('notes')}
            className={`flex-1 py-4 items-center ${
              selectedTab === 'notes' ? 'border-b-2 border-foreground' : ''
            }`}
            activeOpacity={0.7}
          >
            <AppText
              variant="heading3"
              weight={selectedTab === 'notes' ? 'semibold' : 'regular'}
              className={
                selectedTab === 'notes' ? 'text-foreground' : 'text-neutrals100'
              }
            >
              {t('APP.PRODUCT.NOTES')}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View className="p-4" style={{ minHeight: 200 }}>
          {selectedTab === 'details' ? (
            <View>
              <View className="flex-row items-center mb-3">
                <AppText variant="heading2" className="mr-2">
                  ℹ️
                </AppText>
                <AppText variant="heading3" weight="bold">
                  {t('APP.PRODUCT.PRODUCT_DETAILS')}
                </AppText>
              </View>
              <AppText variant="body" className="text-neutrals100 leading-5">
                {typeof product.description === 'string'
                  ? product.description
                  : t('APP.PRODUCT.NO_DESCRIPTION')}
              </AppText>
            </View>
          ) : (
            <View>
              <View className="flex-row items-center mb-3">
                <AppText variant="heading2" className="mr-2">
                  ℹ️
                </AppText>
                <AppText variant="heading3" weight="bold">
                  {t('APP.PRODUCT.PRODUCT_NOTES')}
                </AppText>
              </View>
              <AppText variant="body" className="text-neutrals100">
                {t('APP.PRODUCT.CREATED')}:{' '}
                {new Date(product.createdAt).toLocaleDateString()}
                {'\n'}
                {t('APP.PRODUCT.UPDATED')}:{' '}
                {new Date(product.updatedAt).toLocaleDateString()}
                {'\n'}
                {t('APP.PRODUCT.STATUS')}:{' '}
                {product.isActive
                  ? t('APP.PRODUCT.ACTIVE')
                  : t('APP.PRODUCT.INACTIVE')}
                {'\n'}
                {typeof product.note === 'string'
                  ? product.note
                  : t('APP.PRODUCT.NO_NOTES')}
              </AppText>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <TouchableOpacity
          onPress={handleScrollToTop}
          className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white items-center justify-center shadow-lg shadow-neutrals900/20"
          activeOpacity={0.7}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <AppText variant="heading2">↑</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ProductDetailScreen;
