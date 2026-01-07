import { AppText, Badge } from '@/components/ui';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { components } from 'src/schemas/openapi';

type OrderListDto = components['schemas']['OrderListDto'];

interface OrderCardProps {
  order: OrderListDto;
  onPress: (orderId: string) => void;
}

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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('vi-VN')} VND`;
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  return (
    <TouchableOpacity
      className="bg-background border border-neutrals800 shadow rounded-xl p-4 mb-3 mx-4"
      onPress={() => onPress(order.id)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-neutrals800">
        <AppText variant="heading3" className="flex-1">
          #{(order as any).orderCode || order.id.slice(-8)}
        </AppText>
        <Badge variant={getStatusColor(String(order.status))} size="sm">
          {getStatusLabel(String(order.status))}
        </Badge>
      </View>

      {/* Order Date */}
      <AppText variant="caption" color="muted" className="mb-3">
        Ordered on {formatDate(order.createdAt)}
      </AppText>

      {/* Order Summary */}
      <View className="space-y-2">
        <View className="flex-row justify-between">
          <AppText variant="body" color="muted">
            Items:
          </AppText>
          <AppText variant="body">{order.itemCount}</AppText>
        </View>
        <View className="flex-row justify-between">
          <AppText variant="body" color="muted">
            Payment:
          </AppText>
          <AppText variant="body">{order.paymentMethod}</AppText>
        </View>
        {order.paidAt && typeof order.paidAt === 'string' && (
          <View className="flex-row justify-between">
            <AppText variant="body" color="muted">
              Paid at:
            </AppText>
            <AppText variant="body">
              {formatDate(order.paidAt as string)}
            </AppText>
          </View>
        )}
      </View>

      {/* Footer */}
      <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-neutrals800">
        <AppText variant="body" color="muted">
          Total
        </AppText>
        <AppText variant="heading3" className="text-primary">
          {formatCurrency(order.totalAmount)}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};
