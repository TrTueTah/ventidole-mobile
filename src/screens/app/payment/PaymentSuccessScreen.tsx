import { AppButton, AppText, Icon } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { ActivityIndicator, View } from 'react-native';
import { useGetOrderDetails } from './hooks/useGetOrderDetails';

const successAnimation = require('../../../../assets/animations/success.json');

type PaymentStackParamList = {
  Payment: { orderId: string; paymentMethod: 'CREDIT' | 'COD' };
  PaymentSuccess: { orderId: string };
  PaymentFailure: { orderId: string };
};

type RootStackParamList = {
  Shop: undefined;
  OrderDetails?: { orderId: string };
};

type PaymentSuccessScreenRouteProp = RouteProp<
  PaymentStackParamList,
  'PaymentSuccess'
>;

const PaymentSuccessScreen = () => {
  const route = useRoute<PaymentSuccessScreenRouteProp>();
  const navigation = useNavigation();
  const colors = useColors();
  const { orderId } = route.params;

  const { orderDetails, isLoading } = useGetOrderDetails({
    orderId,
    enabled: true,
  });

  const handleContinueShopping = () => {
    // Navigate to Main tab and then to Shop
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Main' as never, params: { screen: 'MARKETPLACE' } }],
    });
  };

  const handleViewOrder = () => {
    // Navigate to order details (assuming you have an order details screen)
    // For now, just go back to shop
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Main' as never, params: { screen: 'MARKETPLACE' } }],
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
        <AppText variant="body" className="mt-2">
          Loading order details...
        </AppText>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6 py-12">
        {/* Success Animation */}
        <View className="w-48 h-48 mb-6">
          <LottieView
            source={successAnimation}
            autoPlay
            loop={false}
            style={{ width: '100%', height: '100%' }}
          />
        </View>

        {/* Success Message */}
        <AppText variant="heading2" className="text-center mb-2">
          Payment Successful!
        </AppText>
        <AppText variant="body" className="text-center mb-8">
          Your payment has been processed successfully.
        </AppText>

        {/* Order Details */}
        {orderDetails && (
          <View className="w-full bg-neutrals50 rounded-lg p-4 mb-6">
            <View className="flex-row justify-between mb-3">
              <AppText variant="body" weight="bold">
                Order ID
              </AppText>
              <AppText variant="body">{orderDetails.id}</AppText>
            </View>
            <View className="flex-row justify-between mb-3">
              <AppText variant="body" weight="bold">
                Status
              </AppText>
              <AppText variant="body" className="text-success500">
                {String(orderDetails.status)}
              </AppText>
            </View>
            <View className="flex-row justify-between mb-3">
              <AppText variant="body" weight="bold">
                Payment Method
              </AppText>
              <AppText variant="body">
                {String(orderDetails.paymentMethod) === 'CREDIT'
                  ? 'Credit Card'
                  : 'Cash on Delivery'}
              </AppText>
            </View>
            <View className="flex-row justify-between">
              <AppText variant="body" weight="bold">
                Total Amount
              </AppText>
              <AppText variant="body">
                ${orderDetails.totalAmount.toFixed(2)}
              </AppText>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <AppButton
          onPress={handleViewOrder}
          variant="primary"
          size="lg"
          className="w-full mb-3"
          icon={<Icon name="Eye" className="text-primary-foreground w-5 h-5" />}
        >
          <AppText variant="body" className="text-primary-foreground">
            View Order Details
          </AppText>
        </AppButton>

        <AppButton
          onPress={handleContinueShopping}
          variant="outline"
          size="lg"
          className="w-full"
          icon={<Icon name="ShoppingBag" className="text-foreground w-5 h-5" />}
        >
          <AppText variant="body" className="text-foreground">
            Continue Shopping
          </AppText>
        </AppButton>
      </View>
    </View>
  );
};

export default PaymentSuccessScreen;
