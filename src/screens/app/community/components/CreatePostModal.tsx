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
import { ActivityIndicator, Image, Pressable, View } from 'react-native';
import { useCreatePost } from '../hooks/useCreatePost';
import { usePostImagePicker } from '../hooks/usePostImagePicker';

interface CreatePostModalProps {
  communityId: string;
  onSuccess?: () => void;
}

export interface CreatePostModalRef {
  open: () => void;
  close: () => void;
}

const CreatePostModal = forwardRef<CreatePostModalRef, CreatePostModalProps>(
  ({ communityId, onSuccess }, ref) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const [content, setContent] = useState('');
    const colors = useColors();

    const {
      selectedImages,
      isUploading,
      openImagePicker,
      removeImage,
      uploadAllImages,
      clearImages,
    } = usePostImagePicker();

    const { createPost, isCreating } = useCreatePost({
      onSuccess: () => {
        setContent('');
        clearImages();
        bottomSheetRef.current?.dismiss();
        onSuccess?.();
      },
    });

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.present(),
      close: () => bottomSheetRef.current?.dismiss(),
    }));

    const handleSubmit = useCallback(async () => {
      if (!content.trim() && selectedImages.length === 0) {
        return;
      }

      let mediaUrls: string[] = [];

      if (selectedImages.length > 0) {
        mediaUrls = await uploadAllImages();
        if (mediaUrls.length === 0) {
          return; // Upload failed
        }
      }

      createPost({
        content: content.trim(),
        communityId,
        mediaUrls,
      });
    }, [content, selectedImages, communityId, createPost, uploadAllImages]);

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

    const isSubmitDisabled =
      isCreating ||
      isUploading ||
      (!content.trim() && selectedImages.length === 0);

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
                Create Post
              </AppText>
              <Pressable
                onPress={() => bottomSheetRef.current?.dismiss()}
                className="w-8 h-8 items-center justify-center"
              >
                <Icon name="X" className="w-6 h-6 text-foreground" />
              </Pressable>
            </View>

            {/* Content Input */}
            <AppInput
              variant="textarea"
              placeholder="What's on your mind?"
              value={content}
              onChangeText={setContent}
              multiline
              editable={!isCreating && !isUploading}
            />

            {/* Image Grid */}
            {selectedImages.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-4">
                {selectedImages.map((image, index) => (
                  <View key={index} className="relative w-24 h-24">
                    <Image
                      source={{ uri: image }}
                      className="w-full h-full rounded-lg"
                      resizeMode="cover"
                    />
                    <Pressable
                      onPress={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-error rounded-full items-center justify-center"
                      disabled={isUploading || isCreating}
                    >
                      <Icon name="X" className="w-4 h-4 text-white" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* Actions */}
            <View className="flex-row gap-3 mb-6">
              <Pressable
                onPress={openImagePicker}
                disabled={
                  isUploading || isCreating || selectedImages.length >= 5
                }
                className="flex-row items-center gap-2 px-4 py-2 border border-neutrals800 rounded-lg active:bg-neutrals900"
              >
                <Icon name="Image" className="w-5 h-5 text-foreground" />
                <AppText variant="bodySmall">
                  Add Photo ({selectedImages.length}/5)
                </AppText>
              </Pressable>
            </View>

            {/* Submit Button */}
            <AppButton
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
              className="w-full"
            >
              {isCreating || isUploading ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator
                    size="small"
                    color={colors.primaryForeground}
                  />
                  <AppText variant="body" className="text-primaryForeground">
                    {isUploading ? 'Uploading...' : 'Posting...'}
                  </AppText>
                </View>
              ) : (
                <AppText variant="body" className="text-primaryForeground">
                  Post
                </AppText>
              )}
            </AppButton>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

CreatePostModal.displayName = 'CreatePostModal';

export default CreatePostModal;
