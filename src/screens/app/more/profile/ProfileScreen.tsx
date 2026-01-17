import { AppButton, AppInput, AppText, Avatar } from '@/components/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { useAvatarPicker } from './hooks/useAvatarPicker';
import { useUpdateProfile } from './hooks/useUpdateProfile';

const ProfileScreen = () => {
  const { user, isLoading, error, refetch } = useGetCurrentUser();
  const { showInfo } = useToast();
  const { t } = useTranslation();

  const [isEditMode, setIsEditMode] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Avatar Picker Hook
  const { pickAndUploadAvatar, isUploading: isUploadingAvatar } =
    useAvatarPicker();

  // Update Profile Hook
  const { updateProfile, isUpdating } = useUpdateProfile({
    onSuccess: () => {
      setIsEditMode(false);
      setAvatarUrl(undefined); // Clear local avatar state
      refetch(); // Refresh user data
    },
  });

  // Update local state when user data is loaded (only on initial load)
  useEffect(() => {
    if (user && !isEditMode) {
      setEmail(user.email || '');
      setUsername(user.username || '');
      setBio(String(user.bio || ''));
    }
  }, [user?.email, user?.username, user?.bio, isEditMode]);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    // Reset to original values
    if (user) {
      setEmail(user.email || '');
      setUsername(user.username || '');
      setBio(String(user.bio || ''));
    }
    setAvatarUrl(undefined);
    setIsEditMode(false);
  };

  const handleSave = () => {
    // Call API to update user profile
    updateProfile({
      username: username || undefined,
      bio: bio || undefined,
      avatarUrl: avatarUrl || undefined,
    });
  };

  const handleChangeAvatar = async () => {
    const uploadedUrl = await pickAndUploadAvatar();
    if (uploadedUrl) {
      setAvatarUrl(uploadedUrl);
    }
  };

  const handleOpenPasswordModal = () => {
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
  };

  const getUserInitials = () => {
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-10">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-10">
        <AppText variant="body" color="muted" className="text-center">
          Failed to load profile
        </AppText>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
    >
      <View className="p-4">
        {/* Edit Button - Top Right */}
        {!isEditMode && (
          <View className="absolute top-4 right-4 z-10">
            <AppButton variant="outline" onPress={handleEdit} size="sm">
              {t('BUTTON.EDIT')}
            </AppButton>
          </View>
        )}

        {/* Avatar Section */}
        <View className="items-center py-6 gap-2">
          <View className="relative">
            <Avatar
              source={
                avatarUrl
                  ? { uri: avatarUrl }
                  : user?.avatarUrl
                    ? { uri: String(user.avatarUrl) }
                    : undefined
              }
              text={getUserInitials()}
              size="xl"
            />
            {isUploadingAvatar && (
              <View className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
                <ActivityIndicator size="small" color="white" />
              </View>
            )}
          </View>
          {isEditMode && (
            <TouchableOpacity
              onPress={handleChangeAvatar}
              disabled={isUploadingAvatar}
            >
              <AppText
                variant="body"
                className={isUploadingAvatar ? 'text-neutrals500' : 'text-primary'}
              >
                {isUploadingAvatar
                  ? t('APP.POST.UPLOADING')
                  : t('APP.PROFILE.CHANGE_AVATAR')}
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        {/* Personal Information */}
        <View className="mb-6">
          <AppText variant="heading4" className="mb-4">
            {t('APP.MORE.PERSONAL_INFO')}
          </AppText>

          <View className="gap-4">
            <View>
              <AppText variant="body" weight="medium" className="mb-2">
                Username
              </AppText>
              {isEditMode ? (
                <AppInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  autoCapitalize="none"
                />
              ) : (
                <View className="bg-neutrals900 rounded-xl p-3">
                  <AppText variant="body">{username || 'Not set'}</AppText>
                </View>
              )}
            </View>

            <View>
              <AppText variant="body" weight="medium" className="mb-2">
                Email
              </AppText>
              <View className="bg-neutrals900 rounded-xl p-3">
                <AppText variant="body" color="muted">
                  {email || 'Not set'}
                </AppText>
              </View>
            </View>

            <View>
              <AppText variant="body" weight="medium" className="mb-2">
                Bio
              </AppText>
              {isEditMode ? (
                <AppInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Enter bio"
                  variant="textarea"
                  numberOfLines={3}
                  className="min-h-[80px]"
                />
              ) : (
                <View className="bg-neutrals900 rounded-xl p-3">
                  <AppText variant="body">{bio || 'Not set'}</AppText>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {isEditMode && (
          <View className="gap-3">
            <AppButton
              onPress={handleSave}
              disabled={isUpdating || isUploadingAvatar}
              loading={isUpdating}
              variant="primary"
            >
              {isUpdating ? t('APP.PROFILE.SAVING') : t('APP.PROFILE.SAVE_CHANGES')}
            </AppButton>
            <AppButton
              variant="outline"
              onPress={handleCancel}
              disabled={isUpdating || isUploadingAvatar}
            >
              {t('BUTTON.CANCEL')}
            </AppButton>
          </View>
        )}

        {/* Change Password Button - Always Visible when not editing */}
        {!isEditMode && (
          <View className="mt-3">
            <AppButton variant="outline" onPress={handleOpenPasswordModal}>
              {t('APP.PROFILE.CHANGE_PASSWORD')}
            </AppButton>
          </View>
        )}

        <View className="pb-safe-offset-8" />
      </View>

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={handleClosePasswordModal}
        currentEmail={email}
      />
    </ScrollView>
  );
};

export default ProfileScreen;
