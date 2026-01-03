import Accordion from '@/components/other/Accordion';
import { AppButton, AppText, Checkbox, Icon } from '@/components/ui';
import { useCreateAddress } from '@/hooks/useCreateAddress';
import { useGetAddresses } from '@/hooks/useGetAddresses';
import { useUpdateAddress } from '@/hooks/useUpdateAddress';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import AddAddressModal, {
  ShippingAddress,
} from '../cart/components/AddAddressModal';
import SelectAddressModal from '../cart/components/SelectAddressModal';
import { useGetCart } from '../cart/hooks/useGetCart';
import { useConfirmOrder } from './hooks/useConfirmOrder';

type PaymentMethod = 'CREDIT' | 'COD';

interface Section {
  id: string;
  title: string;
  content: 'order' | 'customer' | 'shipping' | 'shippingOption' | 'payment';
}

const sections: Section[] = [
  { id: 'order', title: 'Your Order', content: 'order' },
  { id: 'customer', title: 'Customer', content: 'customer' },
  { id: 'shipping', title: 'Shipping Address', content: 'shipping' },
  {
    id: 'shippingOption',
    title: 'Shipping Option',
    content: 'shippingOption',
  },
  { id: 'payment', title: 'Payment Method', content: 'payment' },
];

const ConfirmOrderScreen = () => {
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT');
  const [selectedAddress, setSelectedAddress] =
    useState<ShippingAddress | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<
    ShippingAddress | undefined
  >(undefined);

  // Initialize all sections as expanded
  const [activeSections, setActiveSections] = useState<number[]>([
    0, 1, 2, 3, 4,
  ]);

  // API hooks
  const {
    addresses,
    isLoading: isLoadingAddresses,
    refetch: refetchAddresses,
  } = useGetAddresses();
  const { createAddress } = useCreateAddress({
    onSuccess: () => {
      refetchAddresses();
      setShowAddAddressModal(false);
    },
  });
  const { updateAddress } = useUpdateAddress({
    onSuccess: () => {
      refetchAddresses();
      setShowAddAddressModal(false);
    },
  });

  // Set default address on initial load
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find(addr => addr.isDefaultAddress);
      const addressToSelect = defaultAddr || addresses[0];
      setSelectedAddress({
        id: addressToSelect.id,
        firstName: addressToSelect.firstName,
        lastName: addressToSelect.lastName,
        provinceCode: addressToSelect.province.code,
        districtCode: addressToSelect.district?.code || 0,
        provinceName: addressToSelect.province.name,
        districtName: addressToSelect.district?.name,
        detailAddress: addressToSelect.detailAddress,
        phoneNumber: addressToSelect.phoneNumber,
        isDefaultAddress: addressToSelect.isDefaultAddress,
        options: addressToSelect.options,
        province: addressToSelect.province,
        district: addressToSelect.district,
      });
    }
  }, [addresses, selectedAddress]);

  // Get cart data
  const { cart, isLoading: isLoadingCart } = useGetCart();

  // Calculate total amount from cart
  const totalAmount =
    cart?.items?.reduce((sum, item) => {
      const price = item.variant?.price || item.product.price;
      return sum + price * item.quantity;
    }, 0) || 0;

  // Confirm order hook
  const { confirmOrderAsync, isLoading: isConfirming } = useConfirmOrder({
    onSuccess: order => {
      // Navigate to payment stack
      // @ts-ignore
      navigation.navigate('PaymentStack', {
        orderId: order.orderId,
        paymentMethod: paymentMethod,
      });
    },
    onError: error => {
      Alert.alert('Order Failed', error.message || 'Failed to confirm order');
    },
  });

  const updateSections = (activeIndexes: number[]) => {
    setActiveSections(activeIndexes);
  };

  const handleAddShippingAddress = () => {
    setShowAddressModal(true);
  };

  const handleSelectAddress = (address: ShippingAddress) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };

  const handleEditAddress = (address: ShippingAddress) => {
    setEditingAddress(address);
    setShowAddressModal(false);
    setShowAddAddressModal(true);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(undefined);
    setShowAddressModal(false);
    setShowAddAddressModal(true);
  };

  const handleSaveAddress = (address: ShippingAddress) => {
    if (address.id) {
      // Update existing address
      updateAddress(address.id, {
        firstName: address.firstName,
        lastName: address.lastName,
        provinceCode: address.provinceCode,
        districtCode: address.districtCode,
        detailAddress: address.detailAddress,
        phoneNumber: address.phoneNumber,
        isDefaultAddress: address.isDefaultAddress,
        options: address.options,
      });
    } else {
      // Add new address
      createAddress({
        firstName: address.firstName,
        lastName: address.lastName,
        provinceCode: address.provinceCode,
        districtCode: address.districtCode,
        detailAddress: address.detailAddress,
        phoneNumber: address.phoneNumber,
        isDefaultAddress: address.isDefaultAddress,
        options: address.options,
      });
    }
  };

  const handleAcceptAndPay = async () => {
    if (!agreeToTerms) {
      Alert.alert(
        'Terms Required',
        'Please agree to the terms and conditions to continue.',
      );
      return;
    }

    if (!selectedAddress) {
      Alert.alert('Address Required', 'Please select a shipping address.');
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      Alert.alert(
        'Empty Cart',
        'Your cart is empty. Please add items to continue.',
      );
      return;
    }

    try {
      // Prepare order items from cart
      const orderItems = cart.items.map(item => ({
        productId: item.product.id,
        variantId: item.variant?.id,
        quantity: item.quantity,
      }));

      // Confirm order
      const result = await confirmOrderAsync({
        items: orderItems,
        paymentMethod: paymentMethod,
        shippingAddressId: selectedAddress.id || '',
      });

      // Note: The orderId will be appended to these URLs by the backend
      // For example: ventidole://payment/success/ORDER123
      console.log('Order confirmed successfully:', result);
    } catch (error) {
      console.error('Error confirming order:', error);
    }
  };

  const handleScrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const renderHeader = (section: Section, _: number, isActive: boolean) => {
    return (
      <View className="flex-row justify-between items-center p-4">
        <AppText variant="heading3" weight="bold">
          {section.title}
        </AppText>
        <Icon
          name={isActive ? 'ChevronUp' : 'ChevronDown'}
          className="w-5 h-5 text-neutrals500"
        />
      </View>
    );
  };

  const renderContent = (
    section: Section,
    _index: number,
    _isActive: boolean,
  ): React.ReactElement => {
    switch (section.content) {
      case 'order':
        return (
          <View className="p-4 bg-neutrals900/5">
            {cart?.items.map((item, index) => (
              <View key={index} className="flex-row mb-4">
                <Image
                  source={{
                    uri:
                      (Array.isArray(item.product.mediaUrls)
                        ? item.product.mediaUrls[0]
                        : item.product.mediaUrls) || '',
                  }}
                  className="w-20 h-20 rounded-lg bg-neutrals900/10"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-3 justify-center">
                  <AppText
                    variant="body"
                    weight="semibold"
                    numberOfLines={2}
                    className="mb-1"
                  >
                    {item.product.name}
                    {item.variant && ` - ${item.variant.name}`}
                  </AppText>
                  <AppText variant="body" weight="bold">
                    ${item.variant?.price || item.product.price} x{' '}
                    {item.quantity}
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        );
      case 'customer':
        return (
          <View className="p-4 bg-neutrals900/5 flex-row justify-between items-center">
            <AppText variant="bodySmall" className="text-neutrals500 flex-1">
              Customer information will be taken from your profile.
            </AppText>
          </View>
        );
      case 'shipping':
        return (
          <View className="p-4 bg-neutrals900/5 flex-row justify-between items-center">
            {selectedAddress ? (
              <>
                <AppText variant="bodySmall" className="flex-1">
                  {selectedAddress.firstName} {selectedAddress.lastName}
                  {'\n'}
                  {[
                    selectedAddress.detailAddress,
                    selectedAddress.districtName,
                    selectedAddress.provinceName,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                  {'\n'}
                  {selectedAddress.phoneNumber}
                </AppText>
                <TouchableOpacity
                  onPress={handleAddShippingAddress}
                  className="px-6 py-2 rounded-full border border-neutrals900/20 bg-white ml-2"
                >
                  <AppText variant="body" weight="semibold">
                    Change
                  </AppText>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <AppText
                  variant="bodySmall"
                  className="text-neutrals500 flex-1"
                >
                  Add shipping address
                </AppText>
                <TouchableOpacity
                  onPress={handleAddShippingAddress}
                  className="px-6 py-2 rounded-full border border-neutrals900/20 bg-white ml-2"
                >
                  <AppText variant="body" weight="semibold">
                    Add
                  </AppText>
                </TouchableOpacity>
              </>
            )}
          </View>
        );
      case 'shippingOption':
        return (
          <View className="p-4 bg-neutrals900/5">
            <AppText variant="bodySmall" className="text-neutrals500">
              Standard Shipping
            </AppText>
          </View>
        );
      case 'payment':
        return (
          <View className="p-4 bg-neutrals900/5 gap-2">
            <TouchableOpacity
              onPress={() => setPaymentMethod('CREDIT')}
              className={`border rounded-lg p-4 ${
                paymentMethod === 'CREDIT'
                  ? 'border-primary bg-blue-50'
                  : 'border-neutrals900/20 bg-white'
              }`}
            >
              <AppText variant="body">Credit Card / QR Code</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPaymentMethod('COD')}
              className={`border rounded-lg p-4 ${
                paymentMethod === 'COD'
                  ? 'border-primary bg-blue-50'
                  : 'border-neutrals900/20 bg-white'
              }`}
            >
              <AppText variant="body">Cash on Delivery</AppText>
            </TouchableOpacity>
          </View>
        );
      default:
        return <View />;
    }
  };

  // Show loading state
  if (isLoadingCart) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <Accordion
          activeSections={activeSections}
          sections={sections}
          renderHeader={renderHeader}
          renderContent={renderContent}
          onChange={updateSections}
          expandMultiple
          duration={300}
          sectionContainerStyle={{
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
          }}
        />

        {/* Order Summary */}
        <View className="p-4 border-b border-neutrals900/10">
          <View className="flex-row justify-between items-center">
            <AppText variant="heading3" weight="bold">
              Order Summary
            </AppText>
            <AppText variant="heading3" weight="bold">
              ${totalAmount.toFixed(2)}
            </AppText>
          </View>
        </View>

        {/* Terms Checkbox */}
        <View className="p-4">
          <Checkbox
            checked={agreeToTerms}
            onValueChange={setAgreeToTerms}
            variant="primary"
            className="items-start"
            label={
              <View className="flex-1 ml-2">
                <AppText variant="bodySmall" className="text-neutrals500">
                  I have read and agree to the collection, use, and provision of
                  personal information (including international transfers for
                  overseas shipping).
                </AppText>
              </View>
            }
          />
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="p-4 border-t border-neutrals900/10 bg-white">
        <AppButton
          disabled={
            !agreeToTerms || isConfirming || isLoadingCart || !selectedAddress
          }
          onPress={handleAcceptAndPay}
          loading={isConfirming}
          variant="primary"
        >
          Accept and Pay ${totalAmount.toFixed(2)}
        </AppButton>
      </View>

      {/* Scroll to Top Button */}
      <TouchableOpacity
        onPress={handleScrollToTop}
        className="absolute bottom-20 right-4 w-12 h-12 rounded-full bg-white items-center justify-center shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Icon name="ArrowUp" className="w-5 h-5 text-foreground" />
      </TouchableOpacity>

      {/* Address Modals */}
      <SelectAddressModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        selectedAddressId={selectedAddress?.id}
        onSelectAddress={handleSelectAddress}
        onEditAddress={handleEditAddress}
        onAddNewAddress={handleAddNewAddress}
        onRefresh={refetchAddresses}
      />

      <AddAddressModal
        visible={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        onSave={handleSaveAddress}
        editAddress={editingAddress}
      />
    </View>
  );
};

export default ConfirmOrderScreen;
