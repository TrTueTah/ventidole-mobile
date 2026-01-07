import { AppText, Avatar, Badge } from '@/components/ui';
import { useToggleCommunity } from '@/hooks/useToggleCommunity';
import { formatNumber } from '@/utils';
import { useQueryClient } from '@tanstack/react-query';
import { memo, useCallback } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

interface CommunityItemProps {
  item: any;
  onPress: (communityId: string) => void;
}

const CommunityItem = memo(({ item, onPress }: CommunityItemProps) => {
  const queryClient = useQueryClient();

  const updateCommunityInCache = useCallback(
    async (communityId: string, isJoined: boolean) => {
      // Cancel any outgoing refetches to prevent AbortError
      await queryClient.cancelQueries({
        queryKey: ['get', '/v1/user/community'],
      });
      await queryClient.cancelQueries({
        queryKey: ['get', '/v1/user/community/joined'],
      });

      let communityToJoin: any = null;

      // First, find the community data if we're joining
      if (isJoined) {
        queryClient
          .getQueriesData({ queryKey: ['get', '/v1/user/community'] })
          .forEach(([, data]: any) => {
            if (data?.pages && !communityToJoin) {
              for (const page of data.pages) {
                const found = page.data?.find((c: any) => c.id === communityId);
                if (found) {
                  communityToJoin = {
                    ...found,
                    isJoined: true,
                    totalMember: (found.totalMember || 0) + 1,
                  };
                  break;
                }
              }
            }
          });
      }

      // Update all communities list
      queryClient.setQueriesData(
        { queryKey: ['get', '/v1/user/community'] },
        (oldData: any) => {
          if (!oldData?.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data?.map((community: any) =>
                community.id === communityId
                  ? {
                      ...community,
                      isJoined,
                      totalMember: isJoined
                        ? (community.totalMember || 0) + 1
                        : Math.max((community.totalMember || 0) - 1, 0),
                    }
                  : community,
              ),
            })),
          };
        },
      );

      // Update joined communities list
      queryClient.setQueriesData(
        { queryKey: ['get', '/v1/user/community/joined'] },
        (oldData: any) => {
          if (!oldData?.pages) return oldData;

          if (isJoined && communityToJoin) {
            // Add to joined list
            return {
              ...oldData,
              pages: oldData.pages.map((page: any, index: number) =>
                index === 0
                  ? {
                      ...page,
                      data: [communityToJoin, ...(page.data || [])],
                    }
                  : page,
              ),
            };
          } else if (!isJoined) {
            // Remove from joined list
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                data:
                  page.data?.filter(
                    (community: any) => community.id !== communityId,
                  ) || [],
              })),
            };
          }

          return oldData;
        },
      );
    },
    [queryClient],
  );

  const { joinCommunity, leaveCommunity, isJoining, isLeaving } =
    useToggleCommunity({
      onSuccess: isJoined => {
        updateCommunityInCache(item.id, isJoined);
      },
    });

  const handleJoinToggle = useCallback(() => {
    if (item.isJoined) {
      leaveCommunity(item.id);
    } else {
      joinCommunity(item.id);
    }
  }, [item.id, item.isJoined, joinCommunity, leaveCommunity]);

  return (
    <View className="flex-row items-center px-4 py-4 border-b border-neutrals800">
      <TouchableOpacity
        onPress={() => onPress(item.id)}
        className="flex-row items-center flex-1"
        activeOpacity={0.7}
      >
        <Avatar source={{ uri: item.avatarUrl }} size="lg" className="mr-3" />

        <View className="flex-1 justify-center">
          {item.isNew && (
            <Badge variant="default" className="mb-1 self-start">
              <AppText variant="labelSmall" className="text-white uppercase">
                NEW
              </AppText>
            </Badge>
          )}
          <AppText
            variant="body"
            weight="bold"
            numberOfLines={1}
            className="mb-1"
          >
            {item.name}
          </AppText>
          <AppText variant="bodySmall" color="muted">
            {formatNumber(item.totalMember || 0)} members
          </AppText>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleJoinToggle}
        disabled={isJoining || isLeaving}
        className={`h-10 px-3 flex-row items-center justify-center rounded-xl min-w-[80px] ${
          item.isJoined
            ? 'bg-transparent border border-neutrals700'
            : 'bg-primary'
        } ${isJoining || isLeaving ? 'opacity-80' : ''}`}
        activeOpacity={0.7}
      >
        {isJoining || isLeaving ? (
          <ActivityIndicator
            size="small"
            color={item.isJoined ? '#e85a5a' : '#ffffff'}
          />
        ) : (
          <AppText
            variant="bodySmall"
            weight="semibold"
            className={item.isJoined ? 'text-foreground' : 'text-white'}
          >
            {item.isJoined ? 'Joined' : 'Join'}
          </AppText>
        )}
      </TouchableOpacity>
    </View>
  );
});

CommunityItem.displayName = 'CommunityItem';

export default CommunityItem;
