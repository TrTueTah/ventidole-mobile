import { AppText } from '@/components/ui';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, View } from 'react-native';
import WebView from 'react-native-webview';
import { useGetOrderStatus } from './hooks/useGetOrderStatus';

type PaymentStackParamList = {
  Payment: { orderId: string; paymentMethod: 'CREDIT' | 'COD' };
  PaymentSuccess: { orderId: string };
  PaymentFailure: { orderId: string };
};

type PaymentScreenRouteProp = RouteProp<PaymentStackParamList, 'Payment'>;

const PaymentScreen = () => {
  const route = useRoute<PaymentScreenRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<PaymentStackParamList>>();
  const { orderId, paymentMethod } = route.params;

  const { order, isLoading, error } = useGetOrderStatus({
    orderId,
    enabled: true,
  });

  // Handle WebView navigation - intercept deep link URLs before they load
  const handleShouldStartLoad = (request: any) => {
    const { url } = request;

    // Check if the URL is a payment success redirect
    if (url.includes('ventidole://payment/success')) {
      navigation.navigate('PaymentSuccess', { orderId });
      return false; // Prevent WebView from loading the URL
    }

    // Check if the URL is a payment failure redirect
    if (url.includes('ventidole://payment/failure')) {
      navigation.navigate('PaymentFailure', { orderId });
      return false; // Prevent WebView from loading the URL
    }

    // Allow all other URLs to load
    return true;
  };

  // Show loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
        <AppText variant="body" className="mt-2 text-neutrals500">
          Loading payment...
        </AppText>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-4">
        <AppText variant="body" className="text-red-500 text-center mb-4">
          Failed to load payment information
        </AppText>
      </View>
    );
  }

  // No checkout URL available
  if (!order?.payment?.checkoutUrl) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-4">
        <AppText variant="body" className="text-neutrals500 text-center">
          No payment information available
        </AppText>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <WebView
        source={{ uri: order.payment.checkoutUrl }}
        originWhitelist={['*']}
        style={{ flex: 1 }}
        startInLoadingState
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        renderLoading={() => (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
            <AppText variant="body" className="mt-2 text-neutrals500">
              Loading payment page...
            </AppText>
          </View>
        )}
        onError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          Alert.alert('Error', 'Failed to load payment page');
        }}
      />
    </View>
  );
};

export default PaymentScreen;
