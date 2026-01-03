import { AppText } from '@/components/ui';
import { View } from 'react-native';

const PickupTab = () => {
  return (
    <View className="flex-1 items-center justify-center p-5">
      <AppText variant="heading3" weight="bold" className="mb-2">
        Pick up
      </AppText>
      <AppText variant="body" color="muted" className="text-center">
        Coming soon
      </AppText>
    </View>
  );
};

export default PickupTab;
