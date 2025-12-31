import { AppText } from '@/components/ui';
import { View } from 'react-native';

const EmptyComments = () => {
  return (
    <View className="flex-1 items-center justify-center py-10">
      <AppText variant="body" color="muted" className="text-center mb-2">
        No comments yet
      </AppText>
      <AppText
        variant="bodySmall"
        color="muted"
        className="text-center opacity-70"
      >
        Be the first to comment!
      </AppText>
    </View>
  );
};

export default EmptyComments;
