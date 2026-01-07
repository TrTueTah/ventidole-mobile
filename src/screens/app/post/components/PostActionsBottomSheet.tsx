import { AppButton, AppText, Icon } from '@/components/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { useColors } from '@/hooks/useColors';
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { components } from '@/schemas/openapi';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { forwardRef, useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useReportPost } from '../hooks/useReportPost';

type PostDto = components['schemas']['PostDto'];

interface PostActionsBottomSheetProps {
  post: PostDto;
  onGotoCommunity?: () => void;
  onReportSuccess?: () => void;
  onEditSuccess?: () => void;
  onEditPress?: (post: PostDto) => void;
}

const PostActionsBottomSheet = forwardRef<
  BottomSheet,
  PostActionsBottomSheetProps
>(
  (
    { post, onGotoCommunity, onReportSuccess, onEditSuccess, onEditPress },
    ref,
  ) => {
    const colors = useColors();
    const { user } = useGetCurrentUser();
    const isAuthor = user?.id === post.author.id;
    const navigation = useNavigation();
    const { showSuccess, showError } = useToast();
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');

    const { reportPostAsync, isReporting } = useReportPost({
      onSuccess: () => {
        showSuccess('Post reported successfully');
        onReportSuccess?.();
      },
      onError: error => {
        showError('Failed to report post');
      },
    });

    const handleReportPress = () => {
      setShowReportModal(true);
    };

    const handleEditPress = () => {
      onEditPress?.(post);
    };

    const handleCancelReport = () => {
      setShowReportModal(false);
      setReportReason('');
    };

    const handleSubmitReport = async () => {
      try {
        await reportPostAsync(post.id, reportReason.trim() || undefined);
        if (typeof ref === 'object' && ref?.current) {
          ref.current.close();
        }
        setShowReportModal(false);
        setReportReason('');
        navigation.goBack();
      } catch (error) {
        console.error('Error reporting post:', error);
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

    const MenuItem = ({
      icon,
      label,
      onPress,
      isDanger = false,
    }: {
      icon: string;
      label: string;
      onPress?: () => void;
      isDanger?: boolean;
    }) => (
      <Pressable
        onPress={onPress}
        className="flex-row items-center gap-3 px-6 py-4 active:bg-neutrals900"
      >
        <View className="w-10 h-10 rounded-full bg-neutrals900 items-center justify-center">
          <Icon
            name={icon as any}
            className={`w-5 h-5 ${isDanger ? 'text-error' : 'text-foreground'}`}
          />
        </View>
        <Text
          className={`flex-1 text-base ${
            isDanger ? 'text-error' : 'text-foreground'
          }`}
        >
          {label}
        </Text>
      </Pressable>
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={showReportModal ? ['50%'] : ['40%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.background }}
      >
        <BottomSheetView>
          {showReportModal ? (
            <View className="px-6 py-4">
              <AppText variant="heading3" className="mb-4">
                Report Post
              </AppText>
              <AppText variant="body" color="muted" className="mb-3">
                Please provide a reason for reporting this post (optional):
              </AppText>
              <BottomSheetTextInput
                value={reportReason}
                onChangeText={setReportReason}
                placeholder="Enter reason..."
                multiline
                numberOfLines={4}
                style={{
                  backgroundColor: colors.neutrals900,
                  borderRadius: 8,
                  padding: 12,
                  minHeight: 100,
                  textAlignVertical: 'top',
                  color: colors.foreground,
                  fontSize: 14,
                }}
              />
              <View className="flex-row gap-3 mt-4">
                <AppButton
                  variant="outline"
                  onPress={handleCancelReport}
                  className="flex-1"
                  disabled={isReporting}
                >
                  Cancel
                </AppButton>
                <AppButton
                  variant="primary"
                  onPress={handleSubmitReport}
                  className="flex-1"
                  disabled={isReporting}
                >
                  {isReporting ? 'Reporting...' : 'Submit Report'}
                </AppButton>
              </View>
            </View>
          ) : (
            <View className="py-2">
              <MenuItem
                icon="Users"
                label="Go to Community"
                onPress={onGotoCommunity}
              />
              {isAuthor && (
                <MenuItem
                  icon="Pencil"
                  label="Edit"
                  onPress={handleEditPress}
                />
              )}
              <MenuItem
                icon="Flag"
                label="Report"
                onPress={handleReportPress}
                isDanger
              />
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

PostActionsBottomSheet.displayName = 'PostActionsBottomSheet';

export default PostActionsBottomSheet;
