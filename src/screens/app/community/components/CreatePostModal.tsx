import { AppButton, AppInput, AppText, Icon } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { components } from '@/schemas/openapi';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Image, Pressable, View } from 'react-native';
import { useUpdatePost } from '../../post/hooks/useUpdatePost';
import { useCreatePost } from '../hooks/useCreatePost';
import { usePostImagePicker } from '../hooks/usePostImagePicker';

type PostDto = components['schemas']['PostDto'];

interface CreatePostModalProps {
  communityId?: string;
  onSuccess?: () => void;
}

export interface CreatePostModalRef {
  open: (post?: PostDto) => void;
  close: () => void;
}

const CreatePostModal = forwardRef<CreatePostModalRef, CreatePostModalProps>(
  ({ communityId, onSuccess }, ref) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const [content, setContent] = useState('');
    const [editingPost, setEditingPost] = useState<PostDto | null>(null);
    const colors = useColors();

    const isEditMode = !!editingPost;

    // Extract hashtags from content
    const detectedTags = useMemo(() => {
      const hashtagRegex = /#[\w\u00C0-\u024F\u1E00-\u1EFF]+/g;
      const matches = content.match(hashtagRegex);
      if (!matches) return [];

      // Remove # symbol and remove duplicates
      const tags = matches.map(tag => tag.slice(1));
      return Array.from(new Set(tags));
    }, [content]);

    const {
      selectedImages,
      isUploading,
      openImagePicker,
      removeImage,
      uploadAllImages,
      clearImages,
      setSelectedImages,
    } = usePostImagePicker();

    const { createPost, isCreating } = useCreatePost({
      onSuccess: () => {
        handleCloseModal();
        onSuccess?.();
      },
    });

    const { updatePostAsync, isUpdating } = useUpdatePost({
      onSuccess: () => {
        handleCloseModal();
        onSuccess?.();
      },
    });

    const handleCloseModal = () => {
      setContent('');
      setEditingPost(null);
      clearImages();
      bottomSheetRef.current?.dismiss();
    };

    useImperativeHandle(ref, () => ({
      open: (post?: PostDto) => {
        if (post) {
          // Edit mode
          setEditingPost(post);
          setContent(post.content || '');
          setSelectedImages(post.mediaUrls || []);
        } else {
          // Create mode
          setEditingPost(null);
          setContent('');
          clearImages();
        }
        bottomSheetRef.current?.present();
      },
      close: () => handleCloseModal(),
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

      // Remove hashtags from content
      const hashtagRegex = /#[\w\u00C0-\u024F\u1E00-\u1EFF]+/g;
      const cleanedContent = content.replace(hashtagRegex, '').trim();

      if (isEditMode && editingPost) {
        // Edit mode
        await updatePostAsync(
          editingPost.id,
          cleanedContent,
          mediaUrls.length > 0 ? mediaUrls : undefined,
          detectedTags.length > 0 ? detectedTags : undefined,
        );
      } else {
        // Create mode
        createPost({
          content: cleanedContent,
          communityId: communityId!,
          mediaUrls,
          tags: detectedTags.length > 0 ? detectedTags : undefined,
        });
      }
    }, [
      content,
      selectedImages,
      isEditMode,
      editingPost,
      communityId,
      createPost,
      updatePostAsync,
      uploadAllImages,
      detectedTags,
    ]);

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
      isUpdating ||
      isUploading ||
      (!content.trim() && selectedImages.length === 0);

    const isProcessing = isCreating || isUpdating || isUploading;

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
                {isEditMode ? 'Edit Post' : 'Create Post'}
              </AppText>
              <Pressable
                onPress={handleCloseModal}
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
              editable={!isProcessing}
            />

            {/* Detected Tags */}
            {detectedTags.length > 0 && (
              <View className="gap-2">
                <AppText variant="bodySmall" color="muted">
                  Detected tags:
                </AppText>
                <View className="flex-row flex-wrap gap-2">
                  {detectedTags.map((tag, index) => (
                    <View
                      key={index}
                      className="px-3 py-1 bg-primary/10 rounded-full"
                    >
                      <AppText variant="bodySmall" className="text-primary">
                        #{tag}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            )}

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
                disabled={isProcessing || selectedImages.length >= 5}
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
              loading={isProcessing}
              className="w-full"
              variant="primary"
            >
              {isProcessing
                ? isUploading
                  ? 'Uploading...'
                  : isEditMode
                  ? 'Updating...'
                  : 'Posting...'
                : isEditMode
                ? 'Update'
                : 'Post'}
            </AppButton>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

CreatePostModal.displayName = 'CreatePostModal';

export default CreatePostModal;
