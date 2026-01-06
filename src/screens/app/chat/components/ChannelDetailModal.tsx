import Accordion from '@/components/other/Accordion';
import { AppText, Icon } from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import { useColors } from '@/hooks/useColors';
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { Channel } from 'stream-chat';
import { useLeaveChannel } from '../hooks/useLeaveChannel';

export interface ChannelDetailModalRef {
  open: (channel: Channel) => void;
  close: () => void;
}

interface ChannelDetailModalProps {
  onChannelLeft?: () => void;
}

const ChannelDetailModal = forwardRef<
  ChannelDetailModalRef,
  ChannelDetailModalProps
>(({ onChannelLeft }, ref) => {
  const colors = useColors();
  const { user } = useGetCurrentUser();
  const [visible, setVisible] = useState(false);
  const [channel, setChannel] = useState<Channel | null>(null);
  const { mutateAsync: leaveChannel, isPending: isLeaving } = useLeaveChannel();
  const [promotingMemberId, setPromotingMemberId] = useState<string | null>(
    null,
  );

  useImperativeHandle(ref, () => ({
    open: (ch: Channel) => {
      setChannel(ch);
      setVisible(true);
    },
    close: () => {
      setVisible(false);
      setTimeout(() => setChannel(null), 300);
    },
  }));

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => setChannel(null), 300);
  };

  const handleLeaveChannel = async () => {
    if (!channel) return;

    try {
      await leaveChannel({ channelId: channel.id || channel.cid || '' });
      handleClose();
      onChannelLeft?.();
    } catch (error) {
      console.error('Failed to leave channel:', error);
    }
  };

  if (!channel) return null;

  const channelName =
    (channel.data as any)?.name || channel.data?.name || 'Unnamed Channel';
  const channelDescription =
    (channel.data as any)?.description || channel.data?.description || '';
  const channelImage = (channel.data as any)?.image || channel.data?.image;
  const members = channel.state?.members || {};
  const memberList = Object.values(members);
  const createdById =
    (channel.data as any)?.created_by_id || channel.data?.created_by?.id;
  const isOwner = createdById === user?.id;

  // Check if current user is moderator or owner
  const currentUserMember = members[user?.id || ''];
  const currentUserRole = currentUserMember?.channel_role;
  const canManageMembers = isOwner || currentUserRole === 'moderator_member';

  const handlePromoteToTrusted = async (memberId: string) => {
    if (!channel || !canManageMembers) return;

    try {
      setPromotingMemberId(memberId);

      // Update member role to trusted_member using addMembers
      await channel.addMembers([
        {
          user_id: memberId,
          channel_role: 'trusted_member',
        },
      ]);

      console.log(`[ChannelDetail] Promoted ${memberId} to trusted_member`);
    } catch (error) {
      console.error('[ChannelDetail] Failed to promote member:', error);
    } finally {
      setPromotingMemberId(null);
    }
  };

  // Helper function to get role label
  const getRoleLabel = (channelRole: string): string => {
    switch (channelRole) {
      case 'moderator_member':
        return 'Moderator';
      case 'trusted_member':
        return 'Trusted Member';
      case 'default_member':
        return 'Fan';
      default:
        return channelRole;
    }
  };

  // Split members into idols/creators and fans based on channel_role
  const idolsAndCreators = memberList.filter(member => {
    const isCreator = member.user_id === createdById;
    const channelRole = member.channel_role;
    // Creator or moderator/trusted members are in this section
    return (
      isCreator ||
      channelRole === 'moderator_member' ||
      channelRole === 'trusted_member'
    );
  });

  const fans = memberList.filter(member => {
    const isCreator = member.user_id === createdById;
    const channelRole = member.channel_role;
    // Default members (fans) who are not creators
    return !isCreator && channelRole === 'default_member';
  });

  const renderMember = (member: any) => {
    const isCurrentUser = member.user_id === user?.id;
    const memberName = member.user?.name || member.user_id || 'User';
    const memberImage = member.user?.image;
    const channelRole = member.channel_role;
    const isCreator = member.user_id === createdById;
    const canPromote =
      canManageMembers && !isCurrentUser && channelRole === 'default_member';
    const isPromoting = promotingMemberId === member.user_id;

    return (
      <View
        key={member.user_id}
        className="flex-row items-center py-3 border-b border-neutrals900"
      >
        {memberImage ? (
          <Image
            source={{ uri: memberImage }}
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-neutrals900 items-center justify-center mr-3">
            <Icon name="User" className="w-5 h-5 text-muted" />
          </View>
        )}
        <View className="flex-1">
          <AppText variant="body">
            {memberName}
            {isCurrentUser ? ' (You)' : ''}
          </AppText>
          {channelRole && (
            <AppText variant="bodySmall" color="muted">
              {getRoleLabel(channelRole)}
            </AppText>
          )}
        </View>
        {isCreator && (
          <View className="bg-primary/20 px-2 py-1 rounded">
            <AppText variant="bodySmall" className="text-primary">
              Owner
            </AppText>
          </View>
        )}
        {canPromote && (
          <TouchableOpacity
            onPress={() => handlePromoteToTrusted(member.user_id)}
            disabled={isPromoting}
            className="ml-2 bg-primary/20 px-3 py-1.5 rounded"
          >
            {isPromoting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <AppText variant="bodySmall" className="text-primary">
                Promote
              </AppText>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 pt-safe-offset-2 border-b border-neutrals900">
          <Pressable onPress={handleClose} className="p-2">
            <Icon name="X" className="w-6 h-6 text-foreground" />
          </Pressable>
          <AppText variant="heading3">Channel Details</AppText>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1">
          {/* Channel Info */}
          <View className="items-center py-6 px-4">
            {channelImage ? (
              <Image
                source={{ uri: channelImage }}
                className="w-24 h-24 rounded-full mb-4"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-neutrals900 items-center justify-center mb-4">
                <Icon name="Hash" className="w-12 h-12 text-muted" />
              </View>
            )}
            <AppText variant="heading2" className="text-center mb-2">
              {channelName}
            </AppText>
            {isOwner && (
              <View className="bg-primary/20 px-3 py-1 rounded-full mb-2">
                <AppText variant="bodySmall" className="text-primary">
                  Owner
                </AppText>
              </View>
            )}
            {channelDescription ? (
              <AppText
                variant="body"
                color="muted"
                className="text-center mt-2"
              >
                {channelDescription}
              </AppText>
            ) : null}
          </View>

          {/* Members Section */}
          <View className="px-4 pb-4">
            <Accordion
              sections={[
                {
                  title: 'Idols & Creators',
                  count: idolsAndCreators.length,
                  members: idolsAndCreators,
                },
                {
                  title: 'Fans',
                  count: fans.length,
                  members: fans,
                },
              ].filter(section => section.members.length > 0)}
              activeSections={[0]}
              expandMultiple={true}
              renderHeader={(section, _, isActive) => (
                <View className="flex-row items-center justify-between py-3 border-b border-neutrals900">
                  <AppText variant="heading5">
                    {section.title} ({section.count})
                  </AppText>
                  <Icon
                    name={isActive ? 'ChevronUp' : 'ChevronDown'}
                    className="w-5 h-5 text-muted"
                  />
                </View>
              )}
              renderContent={section => (
                <View className="pb-2">
                  {section.members.map(renderMember)}
                </View>
              )}
            />
          </View>

          {/* Leave Button */}
          {!isOwner && (
            <View className="px-4 py-6 pb-safe-offset-6">
              <AppButton
                onPress={handleLeaveChannel}
                disabled={isLeaving}
                variant="default"
                className="bg-error"
                textClassname="text-secondary-foreground"
                loading={isLeaving}
              >
                Leave Channel
              </AppButton>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
});

ChannelDetailModal.displayName = 'ChannelDetailModal';

export default ChannelDetailModal;
