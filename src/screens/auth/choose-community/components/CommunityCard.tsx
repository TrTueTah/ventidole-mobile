import AppText from '@/components/ui/AppText';
import Icon from '@/components/ui/Icon';
import { useColors } from '@/hooks/useColors';
import { components } from '@/schemas/openapi';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, TouchableOpacity, View } from 'react-native';

type Community = components['schemas']['CommunityListDto'];

interface CommunityCardProps {
  item: Community;
  isSelected: boolean;
  onPress: () => void;
}

const CommunityCard = ({ item, isSelected, onPress }: CommunityCardProps) => {
  const { t } = useTranslation();
  const colors = useColors();
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 48) / 2; // 48 = padding (16*2) + gap (16)

  return (
    <TouchableOpacity
      onPress={onPress}
      className="rounded-2xl mb-4"
      style={{
        width: itemWidth,
        backgroundColor: colors.background,
        shadowColor: colors.neutrals100,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: isSelected ? 2 : 0,
        borderColor: isSelected ? '#0CF4B4' : 'transparent',
      }}
    >
      <View className="p-3 overflow-hidden rounded-2xl">
        {/* Community Avatar */}
        <View className="items-center mb-3">
          {item.avatarUrl ? (
            <Image
              source={{ uri: item.avatarUrl as any }}
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <View className="w-20 h-20 rounded-full bg-neutrals100 items-center justify-center">
              <Icon name="Users" className="w-10 h-10 text-neutrals400" />
            </View>
          )}
          {/* Selection Indicator */}
          <View
            className="absolute top-0 right-0 w-6 h-6 rounded-full border-2 items-center justify-center"
            style={{
              borderColor: isSelected ? colors.primary : colors.border,
              backgroundColor: isSelected ? colors.primary : colors.background,
            }}
          >
            {isSelected && (
              <Icon name="Check" className="w-4 h-4 text-background" />
            )}
          </View>
        </View>

        {/* Community Info */}
        <View className="items-center">
          <AppText
            className="text-sm font-semibold text-foreground text-center"
            numberOfLines={1}
          >
            {item.name}
          </AppText>
          <AppText className="text-xs text-neutrals400 mt-1">
            {t('AUTH.CHOOSE_COMMUNITY.MEMBERS', { count: item.totalMember })}
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CommunityCard;
