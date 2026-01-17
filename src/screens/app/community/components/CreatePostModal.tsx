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
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
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

/* =========================
   Helpers
========================= */

const HASHTAG_REGEX = /#[\w\u00C0-\u024F\u1E00-\u1EFF]+/g;

function extractTagsAndContent(raw: string) {
  const matches = raw.match(HASHTAG_REGEX) || [];
  const tags = Array.from(new Set(matches.map(tag => tag.slice(1))));

  const cleanedContent = raw
    .replace(HASHTAG_REGEX, '')
    .replace(/\n{2,}/g, '\n')
    .trim();

  return { tags, cleanedContent };
}

function buildContentFromPost(tags?: string[], content?: string) {
  if (!tags || tags.length === 0) {
    return content || '';
  }

  return `${tags.map(tag => `#${tag}`).join(' ')}\n${content || ''}`.trim();
}

/* =========================
   Component
========================= */

const CreatePostModal = forwardRef<CreatePostModalRef, CreatePostModalProps>(
  ({ communityId, onSuccess }, ref) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const [content, setContent] = useState('');
    const [editingPost, setEditingPost] = useState<PostDto | null>(null);

    const colors = useColors();
    const { t } = useTranslation();

    const isEditMode = !!editingPost;

    /* ===== Tags derived from content (single source of truth) ===== */
    const detectedTags = useMemo(() => {
      return extractTagsAndContent(content).tags;
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

    /* ===== Imperative API ===== */
    useImperativeHandle(ref, () => ({
      open: (post?: PostDto) => {
        if (post) {
          setEditingPost(post);
          setContent(buildContentFromPost(post.tags, post.content));
          setSelectedImages(post.mediaUrls || []);
        } else {
          setEditingPost(null);
          setContent('');
          clearImages();
        }
        bottomSheetRef.current?.present();
      },
      close: handleCloseModal,
    }));

    /* ===== Submit ===== */
    const handleSubmit = useCallback(async () => {
      if (!content.trim() && selectedImages.length === 0) return;

      let mediaUrls: string[] = [];

      if (selectedImages.length > 0) {
        mediaUrls = await uploadAllImages();
        if (mediaUrls.length === 0) return;
      }

      const { tags, cleanedContent } = extractTagsAndContent(content);

      if (isEditMode && editingPost) {
        await updatePostAsync(
          editingPost.id,
          cleanedContent,
          mediaUrls.length > 0 ? mediaUrls : undefined,
          tags.length > 0 ? tags : undefined,
        );
      } else {
        createPost({
          content: cleanedContent,
          communityId: communityId!,
          mediaUrls,
          tags: tags.length > 0 ? tags : undefined,
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

    const isProcessing = isCreating || isUpdating || isUploading;

    const isSubmitDisabled =
      isProcessing || (!content.trim() && selectedImages.length === 0);

    /* =========================
       Render
    ========================= */

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
                {isEditMode
                  ? t('APP.POST.EDIT_POST')
                  : t('APP.POST.CREATE_POST')}
              </AppText>
              <Pressable
                onPress={handleCloseModal}
                className="w-8 h-8 items-center justify-center"
              >
                <Icon name="X" className="w-6 h-6 text-foreground" />
              </Pressable>
            </View>

            {/* Content */}
            <AppInput
              variant="textarea"
              placeholder={t('PLACEHOLDER.POST_CONTENT')}
              value={content}
              onChangeText={setContent}
              multiline
              editable={!isProcessing}
            />

            {/* Detected Tags */}
            {detectedTags.length > 0 && (
              <View className="gap-2">
                <AppText variant="bodySmall" color="muted">
                  {t('APP.POST.DETECTED_TAGS')}
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

            {/* Images */}
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
                      disabled={isProcessing}
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
                  {t('BUTTON.ADD_PHOTO', { count: selectedImages.length })}
                </AppText>
              </Pressable>
            </View>

            {/* Submit */}
            <AppButton
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
              loading={isProcessing}
              className="w-full"
              variant="primary"
            >
              {isEditMode ? t('BUTTON.UPDATE') : t('BUTTON.POST')}
            </AppButton>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

CreatePostModal.displayName = 'CreatePostModal';

export default CreatePostModal;
