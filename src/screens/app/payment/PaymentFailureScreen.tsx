import { AppButton, AppText, Icon } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useGetOrderDetails } from './hooks/useGetOrderDetails';
import { useRetryPayment } from './hooks/useRetryPayment';

type PaymentStackParamList = {
  Payment: { orderId: string; paymentMethod: 'CREDIT' | 'COD' };
  PaymentSuccess: { orderId: string };
  PaymentFailure: { orderId: string };
};

type RootStackParamList = {
  Cart: undefined;
  Shop: undefined;
};

type PaymentFailureScreenRouteProp = RouteProp<
  PaymentStackParamList,
  'PaymentFailure'
>;

const PaymentFailureScreen = () => {
  const route = useRoute<PaymentFailureScreenRouteProp>();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<PaymentStackParamList & RootStackParamList>
    >();
  const colors = useColors();
  const { orderId } = route.params;

  const { orderDetails, isLoading } = useGetOrderDetails({
    orderId,
    enabled: true,
  });

  const { retryPayment, isRetrying } = useRetryPayment();

  const handleRetryPayment = async () => {
    try {
      // Call retry payment API to get new payment link
      const result = await retryPayment(orderId);

      // Navigate to payment screen with the new payment info
      const paymentMethod = result.paymentMethod
        ? (String(result.paymentMethod) as 'CREDIT' | 'COD')
        : 'CREDIT';

      // Navigate back to payment screen in the same stack
      navigation.navigate('Payment', {
        orderId: result.orderId,
        paymentMethod,
      });
    } catch (error) {
      console.error('Error retrying payment:', error);
      // You might want to show an error toast here
    }
  };

  const handleBackToCart = () => {
    // Navigate to Main tab, MARKETPLACE screen, and then to Cart
    navigation.getParent()?.reset({
      index: 0,
      routes: [
        {
          name: 'Main' as never,
          state: {
            routes: [
              { name: 'HOME' },
              { name: 'CHAT' },
              {
                name: 'MARKETPLACE',
                state: {
                  routes: [{ name: 'Shop' }, { name: 'Cart' }],
                  index: 1,
                },
              },
              { name: 'MORE' },
            ],
            index: 2, // MARKETPLACE tab index
          },
        },
      ],
    });
  };

  const handleContactSupport = () => {
    // Navigate to support/help screen or open email
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
        {/* Failure Icon */}
        <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mb-6">
          <Icon name="X" className="text-error" />
        </View>

        {/* Failure Message */}
        <AppText variant="heading2" className="text-center mb-2">
          Payment Failed
        </AppText>
        <AppText variant="body" className="text-center mb-8">
          We couldn't process your payment. Please try again or use a different
          payment method.
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
              <AppText variant="body" className="text-error500">
                {String(orderDetails.status)}
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
          onPress={handleRetryPayment}
          variant="primary"
          size="lg"
          className="w-full mb-3"
          disabled={isRetrying}
          icon={
            <Icon
              name="RefreshCw"
              className="text-primary-foreground w-5 h-5"
            />
          }
        >
          <AppText variant="body" className="text-primary-foreground">
            {isRetrying ? 'Retrying...' : 'Retry Payment'}
          </AppText>
        </AppButton>

        <AppButton
          onPress={handleBackToCart}
          variant="outline"
          size="lg"
          className="w-full mb-3"
          icon={
            <Icon name="ShoppingCart" className="text-foreground w-5 h-5" />
          }
        >
          <AppText variant="body" className="text-foreground">
            Back to Cart
          </AppText>
        </AppButton>

        {/* <AppButton
          onPress={handleContactSupport}
          variant="link"
          size="lg"
          className="w-full"
          icon={<Icon name="MessageCircle" className="text-primary w-5 h-5" />}
        >
          <AppText variant="body" className="text-primary">
            Contact Support
          </AppText>
        </AppButton> */}
      </View>
    </View>
  );
};

export default PaymentFailureScreen;
