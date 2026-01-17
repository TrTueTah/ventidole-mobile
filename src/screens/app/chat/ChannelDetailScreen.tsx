import type { DropdownMenuItem, DropdownMenuRef } from '@/components/ui';
import { AppText, DropdownMenu, Icon } from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import { useToast } from '@/components/ui/ToastProvider';
import { useChatChannels } from '@/hooks/useChatChannels';
import { useColors } from '@/hooks/useColors';
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { ChatStackParamList } from '@/navigation/types';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
  View,
} from 'react-native';
import { Channel } from 'stream-chat';
import { useChatContext } from 'stream-chat-react-native';
import { useLeaveChannel } from './hooks/useLeaveChannel';

type ChannelDetailRouteProp = RouteProp<ChatStackParamList, 'ChannelDetail'>;
type ChannelDetailNavigationProp = NativeStackNavigationProp<
  ChatStackParamList,
  'ChannelDetail'
>;

const ChannelDetailScreen = () => {
  const route = useRoute<ChannelDetailRouteProp>();
  const navigation = useNavigation();
  const { channelId } = route.params;
  const { client } = useChatContext();
  const colors = useColors();
  const { t } = useTranslation();
  const { user } = useGetCurrentUser();
  const { refetch } = useChatChannels();
  const { showError, showWarning } = useToast();
  const [channel, setChannel] = useState<Channel | null>(null);
  const { leaveChannel, isLeaving } = useLeaveChannel();
  const [promotingMemberId, setPromotingMemberId] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMembers, setHasMoreMembers] = useState(false);
  const [idolsAndCreators, setIdolsAndCreators] = useState<any[]>([]);
  const [fans, setFans] = useState<any[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const dropdownRef = useRef<DropdownMenuRef>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // Load channel and members
  useEffect(() => {
    const loadChannel = async () => {
      if (!client || !channelId) return;

      try {
        setIsLoadingInitial(true);
        const cleanId = channelId.replace('messaging:', '');
        const ch = client.channel('messaging', cleanId);

        await ch.watch();

        setChannel(ch);

        // Load idols & creators (moderators and trusted members) - fetch all
        const idolsResponse = await ch.queryMembers(
          {
            channel_role: { $in: ['moderator_member', 'trusted_member'] },
          },
          {},
          { limit: 300 },
        );

        console.log(
          '[ChannelDetail] Idols response:',
          idolsResponse.members.length,
        );
        console.log(
          '[ChannelDetail] Sample roles:',
          idolsResponse.members.slice(0, 5).map(m => m.channel_role),
        );

        // Filter client-side to ensure only moderators and trusted members
        const filteredIdols = idolsResponse.members.filter(
          m =>
            m.channel_role === 'moderator_member' ||
            m.channel_role === 'trusted_member',
        );

        console.log(
          '[ChannelDetail] Filtered idols count:',
          filteredIdols.length,
        );

        setIdolsAndCreators(filteredIdols);

        // Load first batch of fans (default members)
        const fansResponse = await ch.queryMembers(
          { channel_role: 'default_member' },
          {},
          { limit: 100 },
        );

        setFans(fansResponse.members);

        // Check if there are more fans to load
        const totalCount = ch.data?.member_count || 0;
        const idolsCount = idolsResponse.members.length;
        const fansCount = fansResponse.members.length;
        setHasMoreMembers(idolsCount + fansCount < totalCount);
      } catch (error) {
        console.error('[ChannelDetail] Failed to load channel:', error);
        showError('Failed to load channel details.');
      } finally {
        setIsLoadingInitial(false);
      }
    };

    loadChannel();
  }, [client, channelId]);

  const handleLeaveChannel = async () => {
    if (!channel) return;

    // Get community ID from channel data or extract from channel ID (remove "community_" prefix)
    const rawId = (channel.data as any)?.communityId || channel.id || '';
    const communityId = rawId.replace('community_', '');

    if (!communityId) {
      showError('Cannot leave channel: Community ID not found');
      return;
    }

    await leaveChannel(communityId, {
      onSuccess: () => {
        // Pop to the top of the stack (ChatList) to restore bottom tabs
        navigation.goBack();
        navigation.goBack();
      },
      onError: error => {
        console.error('Failed to leave channel:', error);
        showError('Failed to leave channel');
      },
    });
  };

  const handleDeleteChannel = async () => {
    if (!channel) return;

    showWarning('Deleting channel...');
    try {
      setIsDeleting(true);
      await channel.delete();
      setTimeout(() => {
        refetch({ silent: true });
      }, 500);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to delete channel:', error);
      showError('Failed to delete channel. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLoadMoreMembers = () => {
    if (!channel || isLoadingMore || !hasMoreMembers) return;

    setIsLoadingMore(true);
    const currentFansCount = fans.length;

    console.log('[ChannelDetail] Current fans count:', currentFansCount);

    // Query for more fans only
    channel
      .queryMembers(
        { channel_role: 'default_member' },
        {},
        { limit: 100, offset: currentFansCount },
      )
      .then(response => {
        console.log(
          '[ChannelDetail] Loaded more fans:',
          response.members.length,
        );

        // Append new fans to existing list
        setFans(prev => {
          const newFans = [...prev, ...response.members];
          console.log('[ChannelDetail] Previous fans count:', prev.length);
          console.log('[ChannelDetail] New fans count:', newFans.length);
          return newFans;
        });

        // Update hasMoreMembers based on response
        const totalCount = channel.data?.member_count || 0;
        const newTotalLoaded =
          idolsAndCreators.length + currentFansCount + response.members.length;
        setHasMoreMembers(newTotalLoaded < totalCount);

        console.log('[ChannelDetail] New total loaded:', newTotalLoaded);
      })
      .catch(error => {
        console.error('[ChannelDetail] Failed to load more members:', error);
        showError('Failed to load more members. Please try again.');
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
  };

  if (isLoadingInitial || !channel) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
        <AppText variant="bodySmall" color="muted" className="mt-4">
          Loading channel details...
        </AppText>
      </View>
    );
  }

  const channelName =
    (channel.data as any)?.name || channel.data?.name || 'Unnamed Channel';
  const channelDescription =
    (channel.data as any)?.description || channel.data?.description || '';
  const channelImage = (channel.data as any)?.image || channel.data?.image;
  const totalMemberCount =
    channel.data?.member_count || idolsAndCreators.length + fans.length;
  const members = channel.state?.members || {};
  const createdById =
    (channel.data as any)?.created_by_id || channel.data?.created_by?.id;
  const isOwner = createdById === user?.id;

  // Check if current user is moderator or owner - use membership for current user's role
  const currentUserRole = channel.state?.membership?.channel_role;
  const canManageMembers = isOwner || currentUserRole === 'moderator_member';

  console.log('[ChannelDetail] Current user role:', currentUserRole);
  console.log('[ChannelDetail] Current user ID:', user?.id);
  console.log('[ChannelDetail] Membership:', channel.state?.membership);

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

      // Move member from fans to idols/creators
      const promotedMember = fans.find(f => f.user_id === memberId);
      if (promotedMember) {
        setFans(prev => prev.filter(f => f.user_id !== memberId));
        setIdolsAndCreators(prev => [
          ...prev,
          { ...promotedMember, channel_role: 'trusted_member' },
        ]);
      }
    } catch (error) {
      console.error('[ChannelDetail] Failed to promote member:', error);
      showError('Failed to promote member');
    } finally {
      setPromotingMemberId(null);
    }
  };

  const handleDemoteToFan = async (memberId: string) => {
    if (!channel || !canManageMembers) return;

    try {
      setPromotingMemberId(memberId);

      // Demote member to default_member
      await channel.addMembers([
        {
          user_id: memberId,
          channel_role: 'default_member',
        },
      ]);

      console.log(`[ChannelDetail] Demoted ${memberId} to default_member`);

      // Move member from idols/creators to fans
      const demotedMember = idolsAndCreators.find(f => f.user_id === memberId);
      if (demotedMember) {
        setIdolsAndCreators(prev => prev.filter(f => f.user_id !== memberId));
        setFans(prev => [
          { ...demotedMember, channel_role: 'default_member' },
          ...prev,
        ]);
      }

      showWarning('Member demoted to fan');
    } catch (error) {
      console.error('[ChannelDetail] Failed to demote member:', error);
      showError('Failed to demote member');
    } finally {
      setPromotingMemberId(null);
    }
  };

  const handleBanMember = async (memberId: string) => {
    if (!channel || !canManageMembers) return;

    try {
      setPromotingMemberId(memberId);

      // Ban member from channel
      await channel.banUser(memberId, {
        reason: 'Banned by moderator',
      });

      console.log(`[ChannelDetail] Banned ${memberId}`);

      // Remove member from lists
      setFans(prev => prev.filter(f => f.user_id !== memberId));
      setIdolsAndCreators(prev => prev.filter(f => f.user_id !== memberId));

      showWarning('Member banned from channel');
    } catch (error) {
      console.error('[ChannelDetail] Failed to ban member:', error);
      showError('Failed to ban member');
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
      <View className="flex-row items-center py-3 px-4 border-b border-neutrals900">
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
        {canManageMembers && !isCurrentUser && (
          <TouchableOpacity
            onPress={() => {
              setSelectedMember(member);
              dropdownRef.current?.open();
            }}
            disabled={isPromoting}
            className="ml-2 w-8 h-8 items-center justify-center"
          >
            {isPromoting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Icon
                name="EllipsisVertical"
                className="w-5 h-5 text-foreground"
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderListHeader = () => (
    <>
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
          <AppText variant="body" color="muted" className="text-center mt-2">
            {channelDescription}
          </AppText>
        ) : null}

        {/* Leave/Delete Button */}
        {!isOwner ? (
          <View className="w-full max-w-sm mt-6">
            <AppButton
              onPress={handleLeaveChannel}
              disabled={isLeaving}
              variant="default"
              className="bg-error"
              textClassname="text-secondary-foreground"
              loading={isLeaving}
            >
              {t('BUTTON.LEAVE_COMMUNITY')}
            </AppButton>
          </View>
        ) : (
          <View className="w-full max-w-sm mt-6">
            <AppButton
              onPress={handleDeleteChannel}
              disabled={isDeleting}
              variant="default"
              className="bg-error"
              textClassname="text-secondary-foreground"
              loading={isDeleting}
            >
              {t('BUTTON.DELETE_CHANNEL')}
            </AppButton>
          </View>
        )}
      </View>

      {/* Members Count */}
      <View className="px-4 pb-2">
        <AppText variant="body" color="muted">
          {t('APP.CHAT.TOTAL_MEMBERS')}: {totalMemberCount}
        </AppText>
      </View>

      {/* Idols & Creators Section */}
      {idolsAndCreators.length > 0 && (
        <View className="mb-4">
          <View className="px-4 py-3 border-b border-neutrals900">
            <AppText variant="heading5">
              {t('APP.CHAT.IDOL_CREATOR')} ({idolsAndCreators.length})
            </AppText>
          </View>
          {idolsAndCreators.map(member => (
            <View key={member.user_id}>{renderMember(member)}</View>
          ))}
        </View>
      )}

      {/* Fans Section Header */}
      {currentUserRole !== 'default_member' && fans.length > 0 && (
        <View className="px-4 py-3 border-b border-neutrals900">
          <AppText variant="heading5">
            {t('APP.CHAT.FAN')} ({fans.length})
          </AppText>
        </View>
      )}
    </>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" />
      </View>
    );
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollToTop(offsetY > 300);
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <View className="flex-1 bg-background">
      {currentUserRole === 'default_member' ? (
        <FlatList
          ref={flatListRef}
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={renderListHeader}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListEmptyComponent={
            <View className="px-4 py-8 items-center">
              <AppText variant="body" color="muted" className="text-center">
                You don't have permission to view the fans list
              </AppText>
            </View>
          }
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={fans}
          renderItem={({ item }) => renderMember(item)}
          keyExtractor={item => item.user_id}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMoreMembers}
          onEndReachedThreshold={0.5}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListEmptyComponent={
            fans.length === 0 && !isLoadingInitial ? (
              <View className="px-4 py-8 items-center">
                <AppText variant="body" color="muted" className="text-center">
                  No fans yet
                </AppText>
              </View>
            ) : null
          }
        />
      )}

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <TouchableOpacity
          onPress={scrollToTop}
          className="absolute bottom-20 right-4 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Icon name="ArrowUp" className="w-6 h-6 text-primary-foreground" />
        </TouchableOpacity>
      )}

      {/* Member Actions Dropdown */}
      <DropdownMenu
        ref={dropdownRef}
        items={[
          ...(selectedMember?.channel_role === 'default_member'
            ? [
                {
                  label: 'Promote to Trusted',
                  icon: 'ArrowUp',
                  onPress: () =>
                    selectedMember &&
                    handlePromoteToTrusted(selectedMember.user_id),
                } as DropdownMenuItem,
              ]
            : []),
          ...(selectedMember?.channel_role === 'trusted_member'
            ? [
                {
                  label: 'Demote to Fan',
                  icon: 'ArrowDown',
                  onPress: () =>
                    selectedMember && handleDemoteToFan(selectedMember.user_id),
                } as DropdownMenuItem,
              ]
            : []),
          {
            label: 'Ban Member',
            icon: 'Ban',
            onPress: () =>
              selectedMember && handleBanMember(selectedMember.user_id),
            variant: 'danger' as const,
          },
        ]}
      />
    </View>
  );
};

export default ChannelDetailScreen;
