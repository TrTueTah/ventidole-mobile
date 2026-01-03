import { AppText } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { useCreateAddress } from '@/hooks/useCreateAddress';
import { useGetAddresses } from '@/hooks/useGetAddresses';
import { useUpdateAddress } from '@/hooks/useUpdateAddress';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  View,
} from 'react-native';
import AddAddressModal, { ShippingAddress } from './components/AddAddressModal';
import PickupTab from './components/PickupTab';
import SelectAddressModal from './components/SelectAddressModal';
import ShippingTab from './components/ShippingTab';
import { useGetCart } from './hooks/useGetCart';

const CartScreen = () => {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<'shipping' | 'pickup'>('shipping');

  // API hooks
  const { cart, isLoading, refresh } = useGetCart();

  // Address API hooks
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

  // Address state management
  const [selectedAddress, setSelectedAddress] =
    useState<ShippingAddress | null>(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showSelectAddressModal, setShowSelectAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<
    ShippingAddress | undefined
  >(undefined);

  // Auto-select default address when addresses load
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find(addr => addr.isDefaultAddress);
      const addressToSelect = defaultAddress || addresses[0];
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

  const handleAddAddressClick = () => {
    if (!addresses || addresses.length === 0) {
      setEditingAddress(undefined);
      setShowAddAddressModal(true);
    } else {
      setShowSelectAddressModal(true);
    }
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

  const handleSelectAddress = (address: ShippingAddress) => {
    setSelectedAddress(address);
    setShowSelectAddressModal(false);
  };

  const handleEditAddress = (address: ShippingAddress) => {
    setEditingAddress(address);
    setShowSelectAddressModal(false);
    setShowAddAddressModal(true);
  };

  const handleAddNewAddressFromSelect = () => {
    setShowSelectAddressModal(false);
    setEditingAddress(undefined);
    setShowAddAddressModal(true);
  };

  const handleCloseAddAddressModal = () => {
    setShowAddAddressModal(false);
    setEditingAddress(undefined);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'shipping':
        return (
          <ShippingTab
            cart={cart}
            selectedAddress={selectedAddress}
            onAddressClick={handleAddAddressClick}
            onRefresh={refresh}
          />
        );
      case 'pickup':
        return <PickupTab />;
      default:
        return null;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Tab Navigation */}
      <View className="flex-row bg-white border-b border-neutrals900/10">
        <Pressable
          onPress={() => setActiveTab('shipping')}
          className="flex-1 py-4 items-center"
          style={{
            borderBottomWidth: activeTab === 'shipping' ? 3 : 0,
            borderBottomColor: colors.primary,
          }}
        >
          <AppText
            variant="body"
            weight={activeTab === 'shipping' ? 'semibold' : 'regular'}
            style={{
              color: activeTab === 'shipping' ? colors.foreground : colors.neutrals500,
            }}
          >
            Shipping
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('pickup')}
          className="flex-1 py-4 items-center"
          style={{
            borderBottomWidth: activeTab === 'pickup' ? 3 : 0,
            borderBottomColor: colors.primary,
          }}
        >
          <AppText
            variant="body"
            weight={activeTab === 'pickup' ? 'semibold' : 'regular'}
            style={{
              color: activeTab === 'pickup' ? colors.foreground : colors.neutrals500,
            }}
          >
            Pick up
          </AppText>
        </Pressable>
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Modals */}
      <AddAddressModal
        visible={showAddAddressModal}
        onClose={handleCloseAddAddressModal}
        onSave={handleSaveAddress}
        editAddress={editingAddress}
      />

      <SelectAddressModal
        visible={showSelectAddressModal}
        onClose={() => setShowSelectAddressModal(false)}
        selectedAddressId={selectedAddress?.id}
        onSelectAddress={handleSelectAddress}
        onEditAddress={handleEditAddress}
        onAddNewAddress={handleAddNewAddressFromSelect}
        onRefresh={refetchAddresses}
      />
    </View>
  );
};

export default CartScreen;
