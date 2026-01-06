import { AppButton, AppInput, AppText, Icon } from '@/components/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { useColors } from '@/hooks/useColors';
import { useEnhancedImagePicker } from '@/hooks/useEnhancedImagePicker';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Image, Pressable, TouchableOpacity, View } from 'react-native';
import { useCreateChannel } from '../hooks/useCreateChannel';

export interface CreateChannelModalRef {
  open: () => void;
  close: () => void;
}

interface CreateChannelModalProps {
  onSuccess?: () => void;
}

const CreateChannelModal = forwardRef<
  CreateChannelModalRef,
  CreateChannelModalProps
>(({ onSuccess }, ref) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const colors = useColors();
  const { openPickerWithAndroidFixes } = useEnhancedImagePicker();
  const { showError } = useToast();

  const { createChannel, isCreating } = useCreateChannel();

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetRef.current?.present(),
    close: () => bottomSheetRef.current?.dismiss(),
  }));

  const handleImagePick = useCallback(async () => {
    try {
      const result = await openPickerWithAndroidFixes({
        width: 800,
        height: 800,
        cropping: true,
        cropperCircleOverlay: true,
      });
      if (result) {
        setImageUri(result.path);
      }
    } catch (error) {
      console.log('Image picker cancelled or error:', error);
    }
  }, [openPickerWithAndroidFixes]);

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      showError('Please enter a channel name');
      return;
    }

    createChannel(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        image: imageUri || undefined,
        type: 'messaging',
      },
      {
        onSuccess: () => {
          setName('');
          setDescription('');
          setImageUri(null);
          bottomSheetRef.current?.dismiss();
          onSuccess?.();
        },
        onError: (error: any) => {
          showError(error.message || 'Failed to create channel');
        },
      },
    );
  }, [name, description, imageUri, createChannel, onSuccess, showError]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  const isSubmitDisabled = isCreating || !name.trim();

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['90%']}
      enablePanDownToClose
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.neutrals600 }}
    >
      <BottomSheetScrollView className="flex-1">
        <View className="px-6 py-4 gap-2">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <AppText variant="heading3" weight="bold">
              Create Channel
            </AppText>
            <Pressable
              onPress={() => bottomSheetRef.current?.dismiss()}
              className="w-8 h-8 items-center justify-center"
            >
              <Icon name="X" className="w-6 h-6 text-foreground" />
            </Pressable>
          </View>

          {/* Channel Name */}
          <View className="mb-4">
            <AppText variant="body" weight="medium" className="mb-2">
              Channel Name <AppText className="text-error">*</AppText>
            </AppText>
            <AppInput
              variant="default"
              placeholder="Enter channel name"
              value={name}
              onChangeText={setName}
              editable={!isCreating}
              maxLength={100}
            />
            <AppText variant="bodySmall" color="muted" className="mt-1">
              Choose a clear, descriptive name for your channel
            </AppText>
          </View>

          {/* Description */}
          <View className="mb-4">
            <AppText variant="body" weight="medium" className="mb-2">
              Description (Optional)
            </AppText>
            <AppInput
              variant="textarea"
              placeholder="Describe what this channel is about"
              value={description}
              onChangeText={setDescription}
              multiline
              editable={!isCreating}
              maxLength={500}
            />
            <AppText variant="bodySmall" color="muted" className="mt-1">
              Help members understand the purpose of this channel
            </AppText>
          </View>

          {/* Channel Image */}
          <View className="mb-6">
            <AppText variant="body" weight="medium" className="mb-2">
              Channel Image (Optional)
            </AppText>
            <TouchableOpacity
              onPress={handleImagePick}
              disabled={isCreating}
              className="items-center justify-center border-2 border-dashed border-neutrals800 rounded-lg p-6"
            >
              {imageUri ? (
                <View className="items-center">
                  <Image
                    source={{ uri: imageUri }}
                    className="w-24 h-24 rounded-full mb-2"
                  />
                  <AppText variant="bodySmall" color="muted">
                    Tap to change image
                  </AppText>
                </View>
              ) : (
                <View className="items-center">
                  <View className="w-16 h-16 rounded-full bg-neutrals800 items-center justify-center mb-2">
                    <Icon name="Image" className="w-8 h-8 text-muted" />
                  </View>
                  <AppText variant="body" color="muted">
                    Add channel image
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View className="bg-neutrals900 rounded-lg p-4 mb-6">
            <AppText variant="bodySmall" color="muted">
              💡 After creating your channel, you can invite members and start
              chatting!
            </AppText>
          </View>

          {/* Submit Button */}
          <AppButton
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
            loading={isCreating}
            className="w-full"
          >
            Create Channel
          </AppButton>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

CreateChannelModal.displayName = 'CreateChannelModal';

export default CreateChannelModal;
