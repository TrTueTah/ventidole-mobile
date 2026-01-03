import { AppButton, AppText, Icon } from '@/components/ui';
import { useDeleteAddress } from '@/hooks/useDeleteAddress';
import { useGetAddresses } from '@/hooks/useGetAddresses';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  TouchableOpacity,
  View,
} from 'react-native';
import { ShippingAddress } from './AddAddressModal';

interface SelectAddressModalProps {
  visible: boolean;
  onClose: () => void;
  selectedAddressId?: string;
  onSelectAddress: (address: ShippingAddress) => void;
  onEditAddress: (address: ShippingAddress) => void;
  onAddNewAddress: () => void;
  onRefresh?: () => void;
}

const SelectAddressModal: React.FC<SelectAddressModalProps> = ({
  visible,
  onClose,
  selectedAddressId,
  onSelectAddress,
  onEditAddress,
  onAddNewAddress,
  onRefresh,
}) => {
  const {
    addresses,
    isLoading: isLoadingAddresses,
    refetch,
  } = useGetAddresses();
  const { deleteAddress, isLoading: isDeleting } = useDeleteAddress({
    onSuccess: () => {
      refetch();
      onRefresh?.();
    },
  });

  useEffect(() => {
    if (visible) {
      refetch();
    }
  }, [visible]);

  const isLoading = isLoadingAddresses;

  const handleSelectAddress = (address: ShippingAddress) => {
    onSelectAddress(address);
    onClose();
  };

  const handleEdit = (address: ShippingAddress, event: any) => {
    event.stopPropagation();
    onEditAddress(address);
  };

  const handleDelete = (addressId: string, event: any) => {
    event.stopPropagation();

    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this shipping address?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteAddress(addressId);
          },
        },
      ],
      { cancelable: true },
    );
  };

  const renderAddressItem = ({ item }: { item: any }) => {
    const isSelected = item.id === selectedAddressId;
    const fullAddress = [
      item.detailAddress,
      item.district?.name,
      item.province?.name,
    ]
      .filter(Boolean)
      .join(', ');

    const shippingAddress: ShippingAddress = {
      id: item.id,
      firstName: item.firstName,
      lastName: item.lastName,
      provinceCode: item.provinceCode,
      districtCode: item.districtCode,
      provinceName: item.province?.name,
      districtName: item.district?.name,
      detailAddress: item.detailAddress,
      phoneNumber: item.phoneNumber,
      isDefaultAddress: item.isDefaultAddress,
      options: item.options,
      province: item.province,
      district: item.district,
    };

    return (
      <TouchableOpacity
        onPress={() => handleSelectAddress(shippingAddress)}
        className={`px-5 py-5 border-b border-neutrals900/10 flex-row ${
          isSelected ? 'bg-primary/5' : 'bg-background'
        }`}
      >
        {/* Radio Button */}
        <View
          className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 mt-0.5 ${
            isSelected ? 'border-primary' : 'border-neutrals900/20'
          }`}
        >
          {isSelected && <View className="w-3 h-3 rounded-full bg-primary" />}
        </View>

        {/* Address Content */}
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <AppText variant="heading3" weight="bold">
              {item.firstName} {item.lastName}
            </AppText>
            {item.isDefaultAddress && (
              <AppText variant="bodySmall" className="text-primary ml-2">
                (Default)
              </AppText>
            )}
          </View>
          <AppText variant="body" className="mb-0.5 leading-5">
            {fullAddress}
          </AppText>
          {item.phoneNumber && (
            <AppText variant="body" className="mt-1">
              {item.phoneNumber}
            </AppText>
          )}

          {/* Actions */}
          <View className="flex-row gap-3 mt-3">
            <TouchableOpacity
              onPress={(e: any) => handleEdit(shippingAddress, e)}
              className="px-3 py-1.5 rounded-md border border-neutrals900/20"
            >
              <AppText variant="bodySmall" weight="medium">
                Edit
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e: any) => handleDelete(item.id!, e)}
              disabled={isDeleting}
              className="px-3 py-1.5 rounded-md border border-neutrals900/20"
            >
              <AppText variant="bodySmall" weight="medium">
                Delete
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutrals900/10">
          <View className="w-6" />
          <AppText variant="heading3" weight="bold">
            Select Shipping Address
          </AppText>
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 rounded-full bg-neutrals800 items-center justify-center"
          >
            <Icon name="X" className="w-5 h-5 text-foreground" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        ) : addresses && addresses.length === 0 ? (
          <View className="flex-1 items-center justify-center px-10">
            <AppText
              variant="heading3"
              className="text-neutrals100 text-center mb-5"
            >
              No shipping addresses found.
            </AppText>
            <AppText variant="body" className="text-neutrals100 text-center">
              Add a new address to get started.
            </AppText>
          </View>
        ) : (
          <FlatList
            data={addresses || []}
            keyExtractor={item => item.id || ''}
            renderItem={renderAddressItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Add Button */}
        <View className="absolute bottom-0 left-0 right-0 px-5 py-5 bg-background border-t border-neutrals900/10 pb-10">
          <AppButton
            onPress={onAddNewAddress}
            variant="outline"
            className="w-full"
          >
            <AppText variant="heading3" weight="bold" className="text-primary">
              Add
            </AppText>
          </AppButton>
        </View>
      </View>
    </Modal>
  );
};

export default SelectAddressModal;
