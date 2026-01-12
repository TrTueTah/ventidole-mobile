import { AppButton, AppInput, AppText, Checkbox, Icon } from '@/components/ui';
import { useForm } from '@/hooks/useForm';
import { useGetDistricts } from '@/hooks/useGetDistricts';
import { useGetProvinces } from '@/hooks/useGetProvinces';
import { components } from '@/schemas/openapi';
import { AddAddressFormValues, addAddressSchema } from '@/validations/address';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

type AddressDto = components['schemas']['AddressDto'];
type ProvinceDto = components['schemas']['ProvinceDto'];
type DistrictDto = components['schemas']['DistrictDto'];

export interface ShippingAddress {
  id?: string;
  firstName: string;
  lastName: string;
  provinceCode: number;
  districtCode: number;
  provinceName?: string;
  districtName?: string;
  detailAddress: string;
  phoneNumber: string;
  isDefaultAddress?: boolean;
  options?: any;
  province?: { name: string; code: number };
  district?: { name: string; code: number };
}

interface AddAddressModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (address: ShippingAddress) => void;
  editAddress?: ShippingAddress;
}

const AddAddressModal: React.FC<AddAddressModalProps> = ({
  visible,
  onClose,
  onSave,
  editAddress,
}) => {
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    number | undefined
  >(editAddress?.provinceCode);

  const { provinces, isLoading: loadingProvinces } = useGetProvinces();
  const { districts, isLoading: loadingDistricts } = useGetDistricts({
    provinceCode: selectedProvinceCode,
    enabled: !!selectedProvinceCode,
  });

  const form = useForm<AddAddressFormValues>({
    defaultValues: editAddress
      ? {
          firstName: editAddress.firstName || '',
          lastName: editAddress.lastName || '',
          provinceCode: editAddress.provinceCode || 0,
          districtCode: editAddress.districtCode || 0,
          detailAddress: editAddress.detailAddress || '',
          phoneNumber: editAddress.phoneNumber || '',
          isDefaultAddress: editAddress.isDefaultAddress || false,
          options: editAddress.options || null,
        }
      : {
          firstName: '',
          lastName: '',
          provinceCode: 0,
          districtCode: 0,
          detailAddress: '',
          phoneNumber: '',
          isDefaultAddress: false,
          options: null,
        },
    validationSchema: addAddressSchema,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const handleSubmit = (values: AddAddressFormValues) => {
    const selectedProvince = provinces?.find(
      p => p.code === values.provinceCode,
    );
    const selectedDistrict = districts?.find(
      d => d.code === values.districtCode,
    );

    const addressData: ShippingAddress = {
      id: editAddress?.id,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      provinceCode: values.provinceCode,
      districtCode: values.districtCode,
      provinceName: selectedProvince?.name,
      districtName: selectedDistrict?.name,
      detailAddress: values.detailAddress.trim(),
      phoneNumber: values.phoneNumber.trim(),
      isDefaultAddress: values.isDefaultAddress,
      options: values.options,
    };

    onSave(addressData);
    form.reset();
    onClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const selectedProvince = provinces?.find(
    p => p.code === form.getValue('provinceCode'),
  );
  const selectedDistrict = districts?.find(
    d => d.code === form.getValue('districtCode'),
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 bg-background">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutrals900/10">
            <View className="w-6" />
            <AppText variant="heading3" weight="bold">
              {editAddress ? 'Edit Shipping Address' : 'Add Shipping Address'}
            </AppText>
            <TouchableOpacity
              onPress={handleClose}
              className="w-10 h-10 rounded-full bg-neutrals800 items-center justify-center"
            >
              <Icon name="X" className="w-5 h-5 text-foreground" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView
            className="flex-1 px-5 py-5"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <AppInput
              {...form.register('firstName')}
              label="Name"
              placeholder="Enter first name"
              errorText={form.formState.errors.firstName?.message}
              required
              containerClassName="mb-5"
            />

            <AppInput
              {...form.register('lastName')}
              label="Last Name"
              placeholder="Enter last name"
              errorText={form.formState.errors.lastName?.message}
              required
              containerClassName="mb-5"
            />

            {/* Province Picker */}
            <View className="mb-5">
              <AppText variant="body" weight="medium" className="mb-1.5">
                Province<AppText className="text-error ml-1">*</AppText>
              </AppText>
              <TouchableOpacity
                onPress={() => setShowProvinceModal(true)}
                className={`border rounded-lg px-4 py-2.5 flex-row justify-between items-center ${
                  form.formState.errors.provinceCode
                    ? 'border-error'
                    : 'border-neutrals900'
                }`}
              >
                <AppText
                  variant="body"
                  className={
                    selectedProvince ? 'text-foreground' : 'text-neutrals100'
                  }
                >
                  {selectedProvince?.name || 'Select province'}
                </AppText>
                <Icon name="ChevronDown" className="w-5 h-5 text-neutrals100" />
              </TouchableOpacity>
              {form.formState.errors.provinceCode && (
                <AppText variant="bodySmall" className="text-error mt-1.5">
                  {form.formState.errors.provinceCode.message}
                </AppText>
              )}
            </View>

            {/* District Picker */}
            <View className="mb-5">
              <AppText variant="body" weight="medium" className="mb-1.5">
                District<AppText className="text-error ml-1">*</AppText>
              </AppText>
              <TouchableOpacity
                onPress={() => {
                  if (!form.getValue('provinceCode')) {
                    return;
                  }
                  setShowDistrictModal(true);
                }}
                disabled={!form.getValue('provinceCode')}
                className={`border rounded-lg px-4 py-2.5 flex-row justify-between items-center ${
                  form.formState.errors.districtCode
                    ? 'border-error'
                    : 'border-neutrals900'
                } ${!form.getValue('provinceCode') ? 'opacity-50' : ''}`}
              >
                <AppText
                  variant="body"
                  className={
                    selectedDistrict ? 'text-foreground' : 'text-neutrals100'
                  }
                >
                  {selectedDistrict?.name || 'Select district'}
                </AppText>
                <Icon name="ChevronDown" className="w-5 h-5 text-neutrals100" />
              </TouchableOpacity>
              {form.formState.errors.districtCode && (
                <AppText variant="bodySmall" className="text-error mt-1.5">
                  {form.formState.errors.districtCode.message}
                </AppText>
              )}
            </View>

            <AppInput
              {...form.register('detailAddress')}
              label="Detail Address"
              placeholder="Enter detail address"
              errorText={form.formState.errors.detailAddress?.message}
              required
              containerClassName="mb-5"
              multiline
              numberOfLines={3}
              variant="textarea"
            />

            <AppInput
              {...form.register('phoneNumber')}
              label="Phone Number"
              placeholder="Enter phone number"
              errorText={form.formState.errors.phoneNumber?.message}
              keyboardType="phone-pad"
              required
              containerClassName="mb-5"
            />

            {/* Default Address Checkbox */}
            <View className="mb-5 flex-row items-center">
              <Checkbox
                checked={form.getValue('isDefaultAddress')}
                onValueChange={value =>
                  form.setValue('isDefaultAddress', value)
                }
                variant="primary"
                size="lg"
              />
              <AppText variant="body" className="ml-2">
                Set as default address
              </AppText>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View className="px-5 py-5 pb-safe-offset-1 border-t border-neutrals900/10">
            <AppButton
              onPress={form.handleSubmit(handleSubmit)}
              disabled={!form.formState.isValid}
              className="w-full"
              variant="primary"
            >
              <AppText variant="heading3" weight="bold" className="text-white">
                Save
              </AppText>
            </AppButton>
          </View>

          {/* Province Picker Modal */}
          <Modal
            visible={showProvinceModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowProvinceModal(false)}
          >
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-background rounded-t-3xl max-h-[70%]">
                <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutrals900/10">
                  <AppText variant="heading3" weight="bold">
                    Select Province
                  </AppText>
                  <TouchableOpacity
                    onPress={() => setShowProvinceModal(false)}
                    className="p-2"
                  >
                    <Icon name="X" className="w-5 h-5 text-foreground" />
                  </TouchableOpacity>
                </View>

                {loadingProvinces ? (
                  <View className="p-10 items-center justify-center">
                    <ActivityIndicator size="large" />
                  </View>
                ) : (
                  <FlatList
                    data={provinces || []}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => {
                          form.setValue('provinceCode', item.code);
                          form.setValue('districtCode', 0);
                          setSelectedProvinceCode(item.code);
                          setShowProvinceModal(false);
                        }}
                        className="px-5 py-4 border-b border-neutrals900/10"
                      >
                        <AppText variant="body">{item.name}</AppText>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            </View>
          </Modal>

          {/* District Picker Modal */}
          <Modal
            visible={showDistrictModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDistrictModal(false)}
          >
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-background rounded-t-3xl max-h-[70%]">
                <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutrals900/10">
                  <AppText variant="heading3" weight="bold">
                    Select District
                  </AppText>
                  <TouchableOpacity
                    onPress={() => setShowDistrictModal(false)}
                    className="p-2"
                  >
                    <Icon name="X" className="w-5 h-5 text-foreground" />
                  </TouchableOpacity>
                </View>

                {loadingDistricts ? (
                  <View className="p-10 items-center justify-center">
                    <ActivityIndicator size="large" />
                  </View>
                ) : (
                  <FlatList
                    data={districts || []}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => {
                          form.setValue('districtCode', item.code);
                          setShowDistrictModal(false);
                        }}
                        className="px-5 py-4 border-b border-neutrals900/10"
                      >
                        <AppText variant="body">{item.name}</AppText>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddAddressModal;
