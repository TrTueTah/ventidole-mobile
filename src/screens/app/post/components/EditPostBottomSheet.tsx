import { AppButton, AppText } from '@/components/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { useColors } from '@/hooks/useColors';
import { components } from '@/schemas/openapi';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useUpdatePost } from '../hooks/useUpdatePost';

type PostDto = components['schemas']['PostDto'];

interface EditPostBottomSheetProps {
  post: PostDto | null;
  onSuccess?: () => void;
}

export interface EditPostBottomSheetRef {
  open: (post: PostDto) => void;
  close: () => void;
}

const EditPostBottomSheet = forwardRef<
  EditPostBottomSheetRef,
  EditPostBottomSheetProps
>(({ post: initialPost, onSuccess }, ref) => {
  const colors = useColors();
  const { showSuccess, showError } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [post, setPost] = useState<PostDto | null>(initialPost);
  const [content, setContent] = useState('');

  const { updatePostAsync, isUpdating } = useUpdatePost({
    onSuccess: () => {
      showSuccess('Post updated successfully');
      onSuccess?.();
      handleClose();
    },
    onError: () => {
      showError('Failed to update post');
    },
  });

  const handleOpen = useCallback((postData: PostDto) => {
    setPost(postData);
    setContent(postData.content || '');
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Reset after animation
    setTimeout(() => {
      setPost(null);
      setContent('');
    }, 300);
  }, []);

  useEffect(() => {
    if (ref && typeof ref === 'object') {
      ref.current = {
        open: handleOpen,
        close: handleClose,
      };
    }
  }, [ref, handleOpen, handleClose]);

  const handleSubmit = async () => {
    if (!post) return;

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      showError('Post content cannot be empty');
      return;
    }

    try {
      await updatePostAsync(
        post.id,
        trimmedContent,
        post.mediaUrls ?? undefined,
      );
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

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

  return (
    <BottomSheet
      index={isOpen ? 0 : -1}
      snapPoints={['70%']}
      enablePanDownToClose
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.neutrals500 }}
    >
      <BottomSheetScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-6 py-4 flex-1">
          <AppText variant="heading3" className="mb-2">
            Edit Post
          </AppText>
          <AppText variant="bodySmall" color="muted" className="mb-4">
            Update your post content:
          </AppText>
          <BottomSheetTextInput
            value={content}
            onChangeText={setContent}
            placeholder="What's on your mind?"
            multiline
            numberOfLines={8}
            style={{
              backgroundColor: colors.neutrals900,
              borderRadius: 8,
              padding: 12,
              minHeight: 200,
              maxHeight: 300,
              textAlignVertical: 'top',
              color: colors.foreground,
              fontSize: 16,
              fontFamily: 'System',
            }}
          />
          <View className="flex-row gap-3 mt-6">
            <AppButton
              variant="outline"
              onPress={handleClose}
              className="flex-1"
              disabled={isUpdating}
            >
              <AppText variant="body" weight="medium">
                Cancel
              </AppText>
            </AppButton>
            <AppButton
              variant="primary"
              onPress={handleSubmit}
              className="flex-1"
              disabled={isUpdating || !content.trim()}
            >
              <AppText
                variant="body"
                weight="medium"
                className="text-primaryForeground"
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </AppText>
            </AppButton>
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

EditPostBottomSheet.displayName = 'EditPostBottomSheet';

export default EditPostBottomSheet;
