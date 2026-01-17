import { AppButton, AppText, Icon } from '@/components/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { useAddToCart } from '@/hooks/useAddToCart';
import { useRemoveFromCart } from '@/hooks/useRemoveFromCart';
import { components } from '@/schemas/openapi';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
  View,
} from 'react-native';
import { ShippingAddress } from './AddAddressModal';

type CartItemDto = components['schemas']['CartItemDto'];

interface ShippingTabProps {
  cart: components['schemas']['CartDto'] | null;
  selectedAddress: ShippingAddress | null;
  onAddressClick: () => void;
  onRefresh: () => void;
}

const ShippingTab: React.FC<ShippingTabProps> = ({
  cart,
  selectedAddress,
  onAddressClick,
  onRefresh,
}) => {
  const navigation = useNavigation();
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { showSuccess, showError } = useToast();
  const { t } = useTranslation();

  const { addToCart, isLoading: isAddingToCart } = useAddToCart({
    onSuccess: () => {
      onRefresh();
    },
  });
  const { removeFromCart, isLoading: isRemovingFromCart } = useRemoveFromCart({
    onSuccess: () => {
      onRefresh();
    },
  });

  // Optimistic quantity state
  const [optimisticQuantities, setOptimisticQuantities] = useState<{
    [itemId: string]: number;
  }>({});

  // Debounce timer refs and pending deltas
  const debounceTimers = useRef<{
    [key: string]: ReturnType<typeof setTimeout>;
  }>({});
  const pendingDeltas = useRef<{ [key: string]: number }>({});
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  // Get cart items from API with optimistic quantities
  const cartItems = (cart?.items || []).map(item => ({
    ...item,
    quantity: optimisticQuantities[item.id] ?? item.quantity,
  }));

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    if (!selectedItems.includes(item.id)) return sum;
    const price = item.variant?.price || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  // Auto-select all items when cart loads
  useEffect(() => {
    if (cartItems.length > 0 && selectedItems.length === 0) {
      setSelectedItems(cartItems.map(item => item.id));
      setSelectAll(true);
    }
  }, [cartItems.length]);

  // Clear optimistic state when cart data changes from API
  useEffect(() => {
    if (cart?.items) {
      setOptimisticQuantities(prev => {
        const newState = { ...prev };
        cart.items.forEach(item => {
          if (prev[item.id] === item.quantity) {
            delete newState[item.id];
          }
        });
        return newState;
      });
    }
  }, [cart?.items]);

  const handleToggleItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleToggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  const handleUpdateQuantity = useCallback(
    (itemId: string, delta: number) => {
      const cartItem = cart?.items.find(item => item.id === itemId);
      if (!cartItem) return;

      const currentQuantity = optimisticQuantities[itemId] ?? cartItem.quantity;
      const newQuantity = currentQuantity + delta;
      const availableStock = cartItem.variant?.stock || cartItem.product.stock;

      // If trying to reduce below 1, remove the item instead
      if (newQuantity < 1) {
        handleRemoveItem(itemId);
        return;
      }

      // Validate stock
      if (newQuantity > availableStock) {
        showError(`Only ${availableStock} items available`);
        return;
      }

      // Update UI immediately (optimistic update)
      setOptimisticQuantities(prev => ({
        ...prev,
        [itemId]: newQuantity,
      }));

      // Accumulate pending delta
      pendingDeltas.current[itemId] =
        (pendingDeltas.current[itemId] || 0) + delta;

      // Clear existing timer for this item
      if (debounceTimers.current[itemId]) {
        clearTimeout(debounceTimers.current[itemId]);
      }

      // Set new debounced timer (500ms delay)
      debounceTimers.current[itemId] = setTimeout(async () => {
        const accumulatedDelta = pendingDeltas.current[itemId] || 0;

        try {
          await addToCart({
            productId: cartItem.product.id,
            variantId: cartItem.variant?.id,
            quantity: Math.abs(accumulatedDelta),
            action: accumulatedDelta > 0 ? 'increase' : 'decrease',
          });

          // Clear the pending delta
          delete pendingDeltas.current[itemId];
        } catch (error) {
          // Revert optimistic update on error
          setOptimisticQuantities(prev => {
            const newState = { ...prev };
            delete newState[itemId];
            return newState;
          });

          showError('Failed to update quantity');
        }
      }, 500);
    },
    [cart?.items, optimisticQuantities, addToCart, showError],
  );

  const handleRemoveItem = useCallback(
    async (itemId: string) => {
      try {
        await removeFromCart(itemId);
        showSuccess('Item removed from cart');
      } catch (error) {
        showError('Failed to remove item');
      }
    },
    [removeFromCart, showSuccess, showError],
  );

  const handleDelete = useCallback(async () => {
    if (selectedItems.length === 0) return;

    try {
      // Delete all selected items
      await Promise.all(selectedItems.map(itemId => removeFromCart(itemId)));

      setSelectedItems([]);
      setSelectAll(false);

      showSuccess('Items removed from cart');
    } catch (error) {
      showError('Failed to remove items');
    }
  }, [selectedItems, removeFromCart, showSuccess, showError]);

  const handleBuyNow = (itemId: string) => {
    // @ts-ignore
    navigation.navigate('ConfirmOrder', {
      itemIds: [itemId],
    });
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      showError('Please select items to checkout');
      return;
    }
    // @ts-ignore
    navigation.navigate('ConfirmOrder', {
      itemIds: selectedItems,
    });
  };

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer =>
        clearTimeout(timer),
      );
    };
  }, []);

  const renderCartItem = ({ item }: { item: CartItemDto }) => {
    const imageUrl = Array.isArray(item.product.mediaUrls)
      ? (item.product.mediaUrls[0] as string)
      : 'https://via.placeholder.com/80';
    const price = item.variant?.price || item.product.price;
    const isItemLoading = loadingItems.has(item.id);
    const isSelected = selectedItems.includes(item.id);

    return (
      <View className="bg-background p-4 border-b-8 border-neutrals900/5">
        {/* Item Container */}
        <View className="flex-row mb-3">
          {/* Checkbox */}
          <TouchableOpacity
            onPress={() => handleToggleItem(item.id)}
            className="mr-3 mt-1"
          >
            <View
              className={`w-6 h-6 rounded border-2 items-center justify-center ${
                isSelected
                  ? 'bg-primary border-primary'
                  : 'border-neutrals900/20'
              }`}
            >
              {isSelected && (
                <Icon name="Check" className="w-4 h-4 text-white" />
              )}
            </View>
          </TouchableOpacity>

          {/* Product Image */}
          <Image
            source={{ uri: imageUrl }}
            className="w-20 h-20 rounded-lg bg-neutrals900/10"
            resizeMode="cover"
          />

          {/* Product Info */}
          <View className="flex-1 ml-3">
            <AppText variant="body" weight="semibold" className="mb-2">
              {item.product.name}
            </AppText>
            {item.variant && (
              <View className="flex-row flex-wrap mb-1">
                <View className="bg-blue-100 px-2 py-1 rounded mr-1 mb-1">
                  <AppText
                    variant="labelSmall"
                    weight="bold"
                    className="text-neutrals100"
                  >
                    {item.variant.name}
                  </AppText>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Item Footer */}
        <View className="bg-neutrals900/5 p-3 rounded-lg">
          <View className="flex-row justify-between items-center mb-3">
            <AppText variant="bodySmall" weight="semibold" className="flex-1">
              {item.product.name}
            </AppText>
          </View>

          {/* Quantity Controls */}
          <View className="flex-row items-center mb-3">
            <TouchableOpacity
              onPress={() => handleUpdateQuantity(item.id, -1)}
              disabled={isItemLoading || isAddingToCart}
              className="w-8 h-8 rounded-full border border-neutrals900 items-center justify-center bg-background"
            >
              <Icon name="Minus" className="w-4 h-4 text-foreground" />
            </TouchableOpacity>

            {isItemLoading ? (
              <ActivityIndicator size="small" className="mx-4" />
            ) : (
              <AppText
                variant="body"
                weight="semibold"
                className="mx-4 w-8 text-center"
              >
                {item.quantity}
              </AppText>
            )}

            <TouchableOpacity
              onPress={() => handleUpdateQuantity(item.id, 1)}
              disabled={isItemLoading || isAddingToCart || item.isOutOfStock}
              className="w-8 h-8 rounded-full border border-neutrals900 items-center justify-center bg-background"
            >
              <Icon name="Plus" className="w-4 h-4 text-foreground" />
            </TouchableOpacity>

            <AppText variant="heading3" weight="bold" className="ml-auto">
              ${(price * item.quantity).toFixed(2)}
            </AppText>
          </View>

          {/* Buy Now Button */}
          <AppButton
            variant="outline"
            onPress={() => handleBuyNow(item.id)}
            disabled={!selectedAddress}
            className="w-full"
          >
            <AppText
              variant="body"
              weight="bold"
              className={selectedAddress ? 'text-primary' : 'text-neutrals100'}
            >
              {t('APP.CART.BUY_NOW')}
            </AppText>
          </AppButton>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Add Address Button */}
            <TouchableOpacity
              onPress={onAddressClick}
              className="flex-row items-center p-4 border-b border-neutrals900/10 bg-background"
            >
              <Icon name="MapPin" className="w-5 h-5 text-foreground mr-3" />
              <View className="flex-1">
                {selectedAddress ? (
                  <View>
                    <AppText variant="body" weight="semibold">
                      {selectedAddress.firstName} {selectedAddress.lastName}
                    </AppText>
                    <AppText
                      variant="bodySmall"
                      color="muted"
                      className="mt-0.5"
                    >
                      {[
                        selectedAddress.detailAddress,
                        selectedAddress.districtName,
                        selectedAddress.provinceName,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </AppText>
                  </View>
                ) : (
                  <AppText variant="body">
                    {t('APP.CART.ADD_SHIPPING_ADDRESS')}
                  </AppText>
                )}
              </View>
              <Icon name="ChevronRight" className="w-5 h-5 text-neutrals100" />
            </TouchableOpacity>

            {/* Select All Container */}
            <View className="flex-row justify-between items-center p-4 bg-neutrals900/5">
              <TouchableOpacity
                onPress={handleToggleSelectAll}
                className="flex-row items-center"
              >
                <View
                  className={`w-6 h-6 rounded border-2 items-center justify-center mr-2 ${
                    selectAll
                      ? 'bg-primary border-primary'
                      : 'border-neutrals900/20'
                  }`}
                >
                  {selectAll && (
                    <Icon name="Check" className="w-4 h-4 text-white" />
                  )}
                </View>
                <AppText variant="body" weight="semibold">
                  {t('APP.CART.SELECT_ALL')}
                </AppText>
              </TouchableOpacity>

              <View className="flex-row">
                <TouchableOpacity
                  onPress={handleDelete}
                  disabled={selectedItems.length === 0}
                  className="px-3 py-2 ml-2"
                >
                  <AppText
                    variant="bodySmall"
                    weight="semibold"
                    className={
                      selectedItems.length === 0
                        ? 'text-neutrals100'
                        : 'text-error'
                    }
                  >
                    {t('APP.CART.DELETE')}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        ListFooterComponent={
          <View className="p-4 bg-background">
            {/* Summary */}
            <View className="mb-3">
              <View className="flex-row justify-between items-center mb-3">
                <AppText variant="body" color="muted">
                  {t('APP.CART.SUBTOTAL')}
                </AppText>
                <AppText variant="body">${subtotal.toFixed(2)}</AppText>
              </View>
              <View className="flex-row justify-between items-center mb-3 pt-3 border-t border-neutrals900/10">
                <AppText variant="heading3" weight="bold">
                  {t('APP.CART.TOTAL')}
                </AppText>
                <AppText variant="heading2" weight="bold">
                  ${subtotal.toFixed(2)}
                </AppText>
              </View>
            </View>

            {!selectedAddress && (
              <View className="flex-row items-center mb-3">
                <Icon
                  name="Info"
                  className="w-3.5 h-3.5 text-neutrals100 mr-1"
                />
                <AppText variant="bodySmall" color="muted">
                  {t('APP.CART.ADD_SHIPPING_ADDRESS_TO_CONTINUE')}
                </AppText>
              </View>
            )}
          </View>
        }
      />

      {/* Bottom Button */}
      <View className="p-4 border-t border-neutrals900/10 bg-background">
        <AppButton
          onPress={handleCheckout}
          disabled={selectedItems.length === 0 || !selectedAddress}
          className="w-full"
          variant="primary"
        >
          {t('BUTTON.BUY_PRODUCT')} ({selectedItems.length})
        </AppButton>
      </View>
    </View>
  );
};

export default ShippingTab;
