import { AppText, Icon } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useRef, useState } from 'react';
import { Animated, Image, ListRenderItem, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CommunityHeader from '../community/components/CommunityHeader';
import PostsTab from './components/PostsTab';
import ProfileSkeleton from './components/ProfileSkeleton';
import ReactionsTab from './components/ReactionsTab';
import { useUserProfile } from './hooks/useUserProfile';

interface ProfileScreenParams {
  userId: string;
}

type TabType = 'posts' | 'reactions';

type ListItem = {
  type: 'header' | 'content';
};

const ProfileScreen = () => {
  const route =
    useRoute<RouteProp<{ params: ProfileScreenParams }, 'params'>>();
  const { userId } = route.params || {};
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const scrollY = useRef(new Animated.Value(0)).current;

  const { userProfile, isLoading, error } = useUserProfile({ userId });

  if (error || (!userProfile && !isLoading)) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-5">
        <AppText variant="body" color="muted" className="text-center">
          Failed to load profile. Please try again.
        </AppText>
      </View>
    );
  }

  if (isLoading || !userProfile) {
    return <ProfileSkeleton />;
  }

  const renderHeader = () => (
    <View>
      {/* Profile Header */}
      <View
        className="px-4 py-6 bg-background border-b border-neutrals900"
        style={{ paddingTop: insets.top + 60 }}
      >
        <View className="flex-row items-center mb-4">
          {/* Avatar */}
          <View className="mr-4">
            {userProfile.avatarUrl ? (
              <Image
                source={{ uri: userProfile.avatarUrl }}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <View
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.neutrals800 }}
              >
                <Icon name="User" className="w-10 h-10 text-neutrals500" />
              </View>
            )}
          </View>

          {/* User Info */}
          <View className="flex-1">
            <AppText variant="heading3" weight="bold" className="mb-1">
              {userProfile.username || 'Unknown User'}
            </AppText>
            {userProfile.email && (
              <AppText variant="bodySmall" color="muted">
                {userProfile.email}
              </AppText>
            )}
            {userProfile.bio && (
              <AppText variant="bodySmall" color="muted" className="mt-1">
                {userProfile.bio}
              </AppText>
            )}
          </View>
        </View>
      </View>

      {/* Tab Bar */}
      <View className="flex-row bg-background border-b border-neutrals900">
        <Pressable
          onPress={() => setActiveTab('posts')}
          className="flex-1 py-4 items-center"
          style={{
            borderBottomWidth: activeTab === 'posts' ? 2 : 0,
            borderBottomColor: colors.primary,
          }}
        >
          <AppText
            variant="body"
            weight={activeTab === 'posts' ? 'bold' : 'regular'}
            style={{
              color:
                activeTab === 'posts' ? colors.primary : colors.neutrals500,
            }}
          >
            Posts
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('reactions')}
          className="flex-1 py-4 items-center"
          style={{
            borderBottomWidth: activeTab === 'reactions' ? 2 : 0,
            borderBottomColor: colors.primary,
          }}
        >
          <AppText
            variant="body"
            weight={activeTab === 'reactions' ? 'bold' : 'regular'}
            style={{
              color:
                activeTab === 'reactions' ? colors.primary : colors.neutrals500,
            }}
          >
            Reactions
          </AppText>
        </Pressable>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return <PostsTab userId={userId} />;
      case 'reactions':
        return <ReactionsTab userId={userId} />;
      default:
        return null;
    }
  };

  const listData: ListItem[] = [{ type: 'header' }, { type: 'content' }];

  const renderItem: ListRenderItem<ListItem> = ({ item }) => {
    switch (item.type) {
      case 'header':
        return renderHeader();
      case 'content':
        return renderTabContent();
      default:
        return null;
    }
  };

  return (
    <>
      <View className="flex-1 bg-background">
        <CommunityHeader scrollY={scrollY} title={userProfile?.username} />
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
      </View>
    </>
  );
};

export default ProfileScreen;
