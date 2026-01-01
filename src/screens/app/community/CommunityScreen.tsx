import { AppButton, AppText, Icon } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { formatNumber } from '@/utils';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ListRenderItem,
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';
import AboutTab from './components/AboutTab';
import ArtistTab from './components/ArtistTab';
import CommunityHeader from './components/CommunityHeader';
import CreatePostModal, {
  CreatePostModalRef,
} from './components/CreatePostModal';
import FanTab from './components/FanTab';
import { useCommunityDetail } from './hooks/useCommunityDetail';
import { useToggleCommunity } from './hooks/useToggleCommunity';

interface CommunityScreenParams {
  communityId: string;
}

type TabType = 'about' | 'artist' | 'fan';

type ListItem = {
  type: 'header' | 'tabBar' | 'content';
};

const CommunityScreen = () => {
  const route =
    useRoute<RouteProp<{ params: CommunityScreenParams }, 'params'>>();
  const { communityId } = route.params || {};
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const scrollY = useRef(new Animated.Value(0)).current;
  const createPostModalRef = useRef<CreatePostModalRef>(null);

  const { community, isLoading, error } = useCommunityDetail({ communityId });
  const { toggleCommunity, isLoading: isToggling } = useToggleCommunity();

  const handleToggleJoin = () => {
    if (community) {
      toggleCommunity(community.id, community.isJoined || false);
    }
  };

  if (error || (!community && !isLoading)) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-5">
        <AppText variant="body" color="muted" className="text-center">
          Failed to load community. Please try again.
        </AppText>
      </View>
    );
  }

  if (isLoading || !community) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderHeader = () => (
    <View>
      {/* Cover Image */}
      {community.backgroundUrl && (
        <Animated.Image
          source={{ uri: community.backgroundUrl as unknown as string }}
          className="w-full h-60"
          resizeMode="cover"
          style={{
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [-200, 0],
                  outputRange: [-100, 0],
                  extrapolate: 'clamp',
                }),
              },
              {
                scale: scrollY.interpolate({
                  inputRange: [-200, 0],
                  outputRange: [1.5, 1],
                  extrapolate: 'clamp',
                }),
              },
            ],
          }}
        />
      )}

      {/* Community Info */}
      <View className="px-4 py-4 bg-background border-b border-neutrals900">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 pr-3">
            <AppText variant="heading3" weight="bold" className="mb-1">
              {community.name}
            </AppText>
            <AppText variant="bodySmall" color="muted">
              {formatNumber(community.totalMember)} members
            </AppText>
          </View>

          <AppButton
            onPress={handleToggleJoin}
            disabled={isToggling}
            variant={community.isJoined ? 'default' : 'secondary'}
            size="sm"
            className="min-w-24"
          >
            {isToggling ? (
              <ActivityIndicator
                size="small"
                color={
                  community.isJoined
                    ? colors.foreground
                    : colors.primaryForeground
                }
              />
            ) : (
              <AppText
                variant="bodySmall"
                weight="medium"
                className={
                  community.isJoined
                    ? 'text-primaryForeground'
                    : 'text-foreground'
                }
              >
                {community.isJoined ? 'Joined' : 'Join'}
              </AppText>
            )}
          </AppButton>
        </View>
      </View>

      {/* Tab Bar */}
      <View className="flex-row bg-background border-b border-neutrals900">
        <Pressable
          onPress={() => setActiveTab('about')}
          className="flex-1 py-4 items-center"
          style={{
            borderBottomWidth: activeTab === 'about' ? 2 : 0,
            borderBottomColor: colors.primary,
          }}
        >
          <AppText
            variant="body"
            weight={activeTab === 'about' ? 'bold' : 'regular'}
            style={{
              color:
                activeTab === 'about' ? colors.primary : colors.neutrals500,
            }}
          >
            About
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('artist')}
          className="flex-1 py-4 items-center"
          style={{
            borderBottomWidth: activeTab === 'artist' ? 2 : 0,
            borderBottomColor: colors.primary,
          }}
        >
          <AppText
            variant="body"
            weight={activeTab === 'artist' ? 'bold' : 'regular'}
            style={{
              color:
                activeTab === 'artist' ? colors.primary : colors.neutrals500,
            }}
          >
            Artist
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('fan')}
          className="flex-1 py-4 items-center"
          style={{
            borderBottomWidth: activeTab === 'fan' ? 2 : 0,
            borderBottomColor: colors.primary,
          }}
        >
          <AppText
            variant="body"
            weight={activeTab === 'fan' ? 'bold' : 'regular'}
            style={{
              color: activeTab === 'fan' ? colors.primary : colors.neutrals500,
            }}
          >
            Fan
          </AppText>
        </Pressable>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return <AboutTab community={community} />;
      case 'artist':
        return <ArtistTab communityId={communityId} />;
      case 'fan':
        return <FanTab communityId={communityId} />;
      default:
        return null;
    }
  };

  const listData: ListItem[] = [
    { type: 'header' },
    { type: 'tabBar' },
    { type: 'content' },
  ];

  const renderItem: ListRenderItem<ListItem> = ({ item }) => {
    switch (item.type) {
      case 'header':
        return renderHeader();
      case 'tabBar':
        return null; // Tab bar is already in header
      case 'content':
        return renderTabContent();
      default:
        return null;
    }
  };

  return (
    <>
      <View className="flex-1 bg-background">
        <CommunityHeader scrollY={scrollY} title={community?.name} />
        <Animated.FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={item => item.type}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
        />

        {/* Floating Create Post Button - Only show on Fan tab */}
        {activeTab === 'fan' && (
          <TouchableOpacity
            onPress={() => createPostModalRef.current?.open()}
            className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg"
            style={{ backgroundColor: colors.primary }}
            activeOpacity={0.8}
          >
            <Icon name="Plus" className="w-6 h-6 text-white" />
          </TouchableOpacity>
        )}

        {/* Create Post Modal */}

        {/* Header - Rendered last so it's on top */}
      </View>
      <CreatePostModal ref={createPostModalRef} communityId={communityId} />
    </>
  );
};

export default CommunityScreen;
