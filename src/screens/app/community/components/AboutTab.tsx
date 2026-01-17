import { AppText, Avatar } from '@/components/ui';
import { components } from '@/schemas/openapi';
import { formatNumber } from '@/utils';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

interface AboutTabProps {
  community: components['schemas']['CommunityDetailDto'];
}

const AboutTab = ({ community }: AboutTabProps) => {
  const { t } = useTranslation();
  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
    >
      <View className="p-4 gap-6">
        {/* Description */}
        <View className="gap-2">
          <AppText variant="body" weight="semibold">
            {t('APP.COMMUNITY.ABOUT')}
          </AppText>
          <AppText variant="bodySmall" color="muted">
            {community.description
              ? String(community.description)
              : t('APP.COMMUNITY.NO_DESCRIPTION')}
          </AppText>
        </View>

        {/* Stats */}
        <View className="gap-2">
          <AppText variant="body" weight="semibold">
            {t('APP.COMMUNITY.COMMUNITY_STAT')}
          </AppText>
          <View className="flex-row flex-wrap gap-4">
            <View className="gap-1">
              <AppText variant="heading4" weight="bold">
                {formatNumber(community.totalMember)}
              </AppText>
              <AppText variant="bodySmall" color="muted">
                {t('APP.COMMUNITY.MEMBERS')}
              </AppText>
            </View>
          </View>
        </View>

        {/* Idols */}
        {community.idols && community.idols.length > 0 && (
          <View className="gap-2">
            <AppText variant="body" weight="semibold">
              {t('APP.COMMUNITY.IDOLS')}
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
