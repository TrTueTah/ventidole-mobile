import { AppText } from '@/components/ui';
import { ScrollView, View } from 'react-native';

const OrdersScreen = () => {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <View className="items-center justify-center py-20">
          <AppText variant="heading3" className="mb-2">
            No Orders Yet
          </AppText>
          <AppText variant="body" color="muted" className="text-center">
            Your order history will appear here
          </AppText>
        </View>
      </View>
    </ScrollView>
  );
};

export default OrdersScreen;
