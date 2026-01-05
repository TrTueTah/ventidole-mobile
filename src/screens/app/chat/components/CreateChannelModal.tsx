import { AppButton, AppInput, AppText, Icon } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
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
import { Alert, Pressable, View } from 'react-native';
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
  const [isCommunityChannel, setIsCommunityChannel] = useState(false);
  const colors = useColors();

  const { createChannel, isCreating } = useCreateChannel();

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetRef.current?.present(),
    close: () => bottomSheetRef.current?.dismiss(),
  }));

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a channel name');
      return;
    }

    createChannel(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        isCommunityChannel,
        type: 'messaging',
      },
      {
        onSuccess: () => {
          setName('');
          setDescription('');
          setIsCommunityChannel(false);
          bottomSheetRef.current?.dismiss();
          onSuccess?.();
        },
        onError: (error: any) => {
          Alert.alert('Error', error.message || 'Failed to create channel');
        },
      },
    );
  }, [name, description, isCommunityChannel, createChannel, onSuccess]);

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

          {/* Community Channel Toggle */}
          <Pressable
            onPress={() => setIsCommunityChannel(!isCommunityChannel)}
            disabled={isCreating}
            className="flex-row items-start mb-6 p-4 border border-neutrals800 rounded-lg active:bg-neutrals900"
          >
            <View
              className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                isCommunityChannel
                  ? 'bg-primary border-primary'
                  : 'border-neutrals600'
              }`}
            >
              {isCommunityChannel && (
                <Icon name="Check" className="w-4 h-4 text-white" />
              )}
            </View>
            <View className="flex-1">
              <AppText variant="body" weight="medium" className="mb-1">
                Community Channel
              </AppText>
              <AppText variant="bodySmall" color="muted">
                Make this channel available to all your community members
              </AppText>
            </View>
          </Pressable>

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
