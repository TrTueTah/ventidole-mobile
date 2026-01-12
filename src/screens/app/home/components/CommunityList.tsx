import { AppText, Avatar, Icon } from '@/components/ui';
import { useNavigation } from '@react-navigation/native';
import { useRef } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { useGetJoinedCommunities } from '../hooks/useGetJoinedComunities';
import { CommunityItem } from './CommunityItem';
import CommunityListSkeleton from './CommunityListSkeleton';
import CommunityModal, { CommunityModalRef } from './CommunityModal';

const CommunityList = () => {
  const navigation = useNavigation();
  const communityModalRef = useRef<CommunityModalRef>(null);

  const { communities, isLoading: isLoadingCommunities } =
    useGetJoinedCommunities();

  const handleCommunityPress = (communityId: string) => {
    navigation.navigate('CommunityStack', { communityId });
  };

  return (
    <>
      <View className="bg-background rounded-xl shadow-md shadow-neutrals900/20">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ padding: 12 }}
          ListHeaderComponent={
            <View className="flex-row gap-3">
              {/* Add Community Button */}
              <TouchableOpacity
                onPress={() => communityModalRef.current?.present()}
                className="flex-col items-center justify-center w-20 h-20 bg-background border border-primary rounded-3xl shadow-sm shadow-neutrals900/10"
              >
                <Icon name="Plus" className="w-10 h-10 text-primary" />
              </TouchableOpacity>

              {/* Loading Skeletons */}
              {isLoadingCommunities && <CommunityListSkeleton />}
            </View>
          }
          data={communities}
          keyExtractor={(item: CommunityItem) => item.id}
          renderItem={({ item }: { item: CommunityItem }) => (
            <TouchableOpacity
              onPress={() => handleCommunityPress(item.id)}
              className="flex-col items-center gap-2 w-24"
            >
              <Avatar
                source={
                  item.avatarUrl ? { uri: String(item.avatarUrl) } : undefined
                }
                size="lg"
                className="shadow-sm shadow-neutrals900/10"
              />
              <AppText
                variant="labelSmall"
                className="text-center"
                numberOfLines={1}
              >
                {item.name}
              </AppText>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Community Modal */}
      <CommunityModal ref={communityModalRef} />
    </>
  );
};

export default CommunityList;
