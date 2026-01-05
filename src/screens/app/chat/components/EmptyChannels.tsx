import { AppText, Icon } from '@/components/ui';
import { View } from 'react-native';

const EmptyChannels = () => {
  return (
    <View className="flex-1 items-center justify-center p-5">
      <Icon name="MessageCircle" className="w-16 h-16 text-neutrals500 mb-4" />
      <AppText variant="body" weight="semibold" className="text-center mb-2">
        No conversations yet
      </AppText>
      <AppText variant="small" color="muted" className="text-center">
        Start a conversation to connect with others
      </AppText>
    </View>
  );
};

export default EmptyChannels;
