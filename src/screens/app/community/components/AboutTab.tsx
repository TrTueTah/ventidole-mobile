import { AppText, Avatar } from '@/components/ui';
import { components } from '@/schemas/openapi';
import { formatNumber } from '@/utils';
import { ScrollView, View } from 'react-native';

interface AboutTabProps {
  community: components['schemas']['CommunityDetailResponseDto'];
}

const AboutTab = ({ community }: AboutTabProps) => {
  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
    >
      <View className="p-4 gap-6">
        {/* Description */}
        <View className="gap-2">
          <AppText variant="body" weight="semibold">
            About
          </AppText>
          <AppText variant="bodySmall" color="muted">
            {String(community.description) || 'No description available.'}
          </AppText>
        </View>

        {/* Stats */}
        <View className="gap-2">
          <AppText variant="body" weight="semibold">
            Community Stats
          </AppText>
          <View className="flex-row flex-wrap gap-4">
            <View className="gap-1">
              <AppText variant="heading4" weight="bold">
                {formatNumber(community.followerCount)}
              </AppText>
              <AppText variant="bodySmall" color="muted">
                Members
              </AppText>
            </View>
          </View>
        </View>

        {/* Idols */}
        {community.idols && community.idols.length > 0 && (
          <View className="gap-2">
            <AppText variant="body" weight="semibold">
              Idols
            </AppText>
            <View className="flex-row flex-wrap gap-3">
              {community.idols.map((idol: any, index: number) => (
                <View key={index} className="items-center gap-1">
                  <Avatar
                    source={{ uri: idol.avatarUrl }}
                    text={idol.name}
                    size="lg"
                  />
                  <AppText variant="labelSmall" className="text-center">
                    {idol.name}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default AboutTab;
