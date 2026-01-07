import { AppButton, AppImage, AppText, Badge } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Package } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRetryPayment } from '../../payment/hooks/useRetryPayment';
import { useOrderDetails } from './hooks/useOrderDetails';

type OrderDetailsRouteParams = {
  OrderDetailsScreen: {
    orderId: string;
  };
};

type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PAID'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELED'
  | 'EXPIRED';

const OrderDetailsScreen = () => {
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<OrderDetailsRouteParams, 'OrderDetailsScreen'>>();
  const colors = useColors();
  const { orderId } = route.params;
  const [refreshing, setRefreshing] = useState(false);

  const { orderDetails, isLoading, error, refetch } = useOrderDetails(orderId);
  const { retryPayment, isRetrying } = useRetryPayment();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleRetryPayment = async () => {
    try {
      // Call retry payment API to get new payment link
      const result = await retryPayment(orderId);

      // Navigate to payment screen with the new payment info
      const paymentMethod = result.paymentMethod
        ? (String(result.paymentMethod) as 'CREDIT' | 'COD')
        : 'CREDIT';

      // @ts-ignore
      navigation.navigate('PaymentStack', {
        orderId: result.orderId,
        paymentMethod,
      });
    } catch (error) {
      console.error('Error retrying payment:', error);
      // Error will be shown by the mutation
    }
  };

  const getStatusColor = (
    status: string,
  ): 'success' | 'warning' | 'error' | 'primary' | 'default' | 'secondary' => {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'SHIPPING':
        return 'primary';
      case 'PAID':
        return 'secondary';
      case 'CONFIRMED':
        return 'warning';
      case 'PENDING_PAYMENT':
        return 'default';
      case 'CANCELED':
      case 'EXPIRED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      PENDING_PAYMENT: 'Pending Payment',
      PAID: 'Paid',
      CONFIRMED: 'Confirmed',
      SHIPPING: 'Shipping',
      DELIVERED: 'Delivered',
      CANCELED: 'Canceled',
      EXPIRED: 'Expired',
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('vi-VN')} VND`;
  };

  const getTimelineSteps = () => {
    if (!orderDetails) return [];

    const paymentMethod = orderDetails.paymentMethod;
    const currentStatus = orderDetails.status;

    // Define steps based on payment method
    if (paymentMethod === 'CREDIT') {
      // CREDIT Payment Flow
      const steps = [
        {
          title: 'Order Placed',
          description: 'Waiting for payment',
          time: formatDate(orderDetails.createdAt),
          status: 'PENDING_PAYMENT' as OrderStatus,
        },
        {
          title: 'Payment Confirmed',
          description: 'Payment verified',
          time: formatDate((orderDetails as any)?.paidAt),
          status: 'PAID' as OrderStatus,
        },
        {
          title: 'Shipping',
          description: 'Order is on the way',
          time: (orderDetails as any)?.shippedAt
            ? formatDate((orderDetails as any).shippedAt)
            : '-',
          status: 'SHIPPING' as OrderStatus,
        },
        {
          title: 'Delivered',
          description: 'Order delivered successfully',
          time: (orderDetails as any)?.deliveredAt
            ? formatDate((orderDetails as any).deliveredAt)
            : '-',
          status: 'DELIVERED' as OrderStatus,
        },
      ];

      // Handle canceled/expired states
      if (currentStatus === 'CANCELED' || currentStatus === 'EXPIRED') {
        steps.push({
          title: currentStatus === 'EXPIRED' ? 'Payment Expired' : 'Canceled',
          description:
            currentStatus === 'EXPIRED'
              ? 'Payment timeout (30 min)'
              : 'Order has been canceled',
          time: (orderDetails as any)?.canceledAt
            ? formatDate((orderDetails as any).canceledAt)
            : '-',
          status: currentStatus,
        });
      }

      const currentStatusIndex = steps.findIndex(
        step => step.status === currentStatus,
      );

      return steps.map((step, index) => ({
        ...step,
        isActive: index === currentStatusIndex,
        isCompleted: index < currentStatusIndex,
        isCanceled: currentStatus === 'CANCELED' || currentStatus === 'EXPIRED',
      }));
    } else {
      // COD Payment Flow
      const steps = [
        {
          title: 'Order Confirmed',
          description: 'Order is being prepared',
          time: formatDate(orderDetails.createdAt),
          status: 'CONFIRMED' as OrderStatus,
        },
        {
          title: 'Shipping',
          description: 'Order is on the way',
          time: (orderDetails as any)?.shippedAt
            ? formatDate((orderDetails as any).shippedAt)
            : '-',
          status: 'SHIPPING' as OrderStatus,
        },
        {
          title: 'Delivered',
          description: 'Pay cash on delivery',
          time: (orderDetails as any)?.deliveredAt
            ? formatDate((orderDetails as any).deliveredAt)
            : '-',
          status: 'DELIVERED' as OrderStatus,
        },
      ];

      // Handle canceled state
      if (currentStatus === 'CANCELED') {
        steps.push({
          title: 'Canceled',
          description: 'Order has been canceled',
          time: (orderDetails as any)?.canceledAt
            ? formatDate((orderDetails as any).canceledAt)
            : '-',
          status: 'CANCELED' as OrderStatus,
        });
      }

      const currentStatusIndex = steps.findIndex(
        step => step.status === currentStatus,
      );

      return steps.map((step, index) => ({
        ...step,
        isActive: index === currentStatusIndex,
        isCompleted: index < currentStatusIndex,
        isCanceled: currentStatus === 'CANCELED',
      }));
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="body" color="muted" className="mt-4">
          Loading order details...
        </AppText>
      </View>
    );
  }

  if (error || !orderDetails) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-4">
        <AppText variant="heading3" className="mb-2 text-error">
          Error Loading Order
        </AppText>
        <AppText variant="body" color="muted" className="text-center mb-4">
          {error || 'Order not found'}
        </AppText>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-lg"
          onPress={() => refetch()}
        >
          <AppText variant="body" className="text-white">
            Try Again
          </AppText>
        </TouchableOpacity>
      </View>
    );
  }

  const timelineSteps = getTimelineSteps();

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Order Header */}
      <View className="bg-neutrals900 rounded-xl p-4 m-4">
        <AppText variant="heading2" className="mb-2">
          #{(orderDetails as any).orderCode || orderDetails.id.slice(-8)}
        </AppText>
        <AppText variant="caption" color="muted" className="mb-3">
          Placed on {formatDate(orderDetails.createdAt)}
        </AppText>
        <Badge variant={getStatusColor(String(orderDetails.status))} size="md">
          {getStatusLabel(String(orderDetails.status))}
        </Badge>
      </View>

      {/* Order Timeline */}
      <View className="bg-neutrals900 rounded-xl p-4 m-4 mt-0">
        <AppText variant="heading3" className="mb-4">
          Order Status
        </AppText>
        {timelineSteps.map((step, index) => (
          <View key={index} className="flex-row mb-4 last:mb-0">
            {/* Timeline Dot */}
            <View className="items-center mr-3">
              <View
                className={`w-3 h-3 rounded-full ${
                  (step as any).isCanceled
                    ? 'bg-error'
                    : step.isCompleted
                    ? 'bg-success'
                    : step.isActive
                    ? 'bg-primary'
                    : 'bg-neutrals700'
                }`}
              />
              {index < timelineSteps.length - 1 && (
                <View
                  className={`w-0.5 flex-1 min-h-[40px] ${
                    (step as any).isCanceled
                      ? 'bg-error'
                      : step.isCompleted
                      ? 'bg-success'
                      : 'bg-neutrals700'
                  }`}
                />
              )}
            </View>

            {/* Timeline Content */}
            <View className="flex-1 pb-4">
              <AppText
                variant="body"
                className={
                  (step as any).isCanceled
                    ? 'text-error font-sans-semibold'
                    : step.isActive
                    ? 'text-primary font-sans-semibold'
                    : ''
                }
              >
                {step.title}
              </AppText>
              <AppText variant="caption" color="muted">
                {step.description}
              </AppText>
              <AppText variant="caption" color="muted" className="mt-1">
                {step.time}
              </AppText>
            </View>
          </View>
        ))}

        {/* Retry Payment Button */}
        {orderDetails.paymentMethod === 'CREDIT' &&
          orderDetails.status === 'PENDING_PAYMENT' && (
            <View className="mt-4">
              <AppButton
                variant="primary"
                onPress={handleRetryPayment}
                className="w-full"
                disabled={isRetrying}
              >
                {isRetrying ? 'Retrying...' : 'Retry Payment'}
              </AppButton>
            </View>
          )}
      </View>

      {/* Delivery Address */}
      {orderDetails.shippingAddress &&
        typeof orderDetails.shippingAddress === 'object' &&
        Object.keys(orderDetails.shippingAddress).length > 0 && (
          <View className="bg-neutrals900 rounded-xl p-4 m-4 mt-0">
            <AppText variant="heading3" className="mb-3">
              Delivery Address
            </AppText>
            <AppText variant="body">
              {(orderDetails.shippingAddress as any).firstName}{' '}
              {(orderDetails.shippingAddress as any).lastName}
            </AppText>
            <AppText variant="body" color="muted" className="mt-1">
              {(orderDetails.shippingAddress as any).phoneNumber}
            </AppText>
            <AppText variant="body" color="muted" className="mt-1">
              {(orderDetails.shippingAddress as any).detailAddress}
            </AppText>
            <AppText variant="body" color="muted">
              {(orderDetails.shippingAddress as any).districtName},{' '}
              {(orderDetails.shippingAddress as any).provinceName}
            </AppText>
          </View>
        )}

      {/* Order Items */}
      <View className="bg-neutrals900 rounded-xl p-4 m-4 mt-0">
        <AppText variant="heading3" className="mb-3">
          Order Items
        </AppText>
        {orderDetails.items?.map((item: any, index: number) => (
          <View
            key={item.id || index}
            className="flex-row items-center mb-3 last:mb-0 pb-3 last:pb-0 border-b border-neutrals800 last:border-b-0"
          >
            {/* Item Image */}
            {item.mediaUrls && item.mediaUrls.length > 0 ? (
              <AppImage
                source={{ uri: item.mediaUrls[0] }}
                className="w-16 h-16 rounded-lg mr-3"
                resizeMode="cover"
              />
            ) : (
              <View className="w-16 h-16 rounded-lg bg-neutrals800 items-center justify-center mr-3">
                <Package size={24} color={colors.neutrals500} />
              </View>
            )}

            {/* Item Info */}
            <View className="flex-1">
              <AppText variant="body" className="mb-1">
                {item.productName}
              </AppText>
              {item.variantName && (
                <AppText variant="caption" color="muted" className="mb-1">
                  {item.variantName}
                </AppText>
              )}
              <AppText variant="caption" color="muted">
                Quantity: {item.quantity}
              </AppText>
            </View>

            {/* Item Price */}
            <AppText variant="body" className="font-sans-semibold">
              {formatCurrency(item.price * item.quantity)}
            </AppText>
          </View>
        ))}
      </View>

      {/* Order Summary */}
      <View className="bg-neutrals900 rounded-xl p-4 m-4 mt-0 mb-8">
        <AppText variant="heading3" className="mb-3">
          Summary
        </AppText>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <AppText variant="heading3">Total</AppText>
            <AppText variant="heading3" className="text-primary">
              {formatCurrency(orderDetails.totalAmount)}
            </AppText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default OrderDetailsScreen;
