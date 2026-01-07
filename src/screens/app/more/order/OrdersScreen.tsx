import { AppText, Chip } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import { MoreStackParamList } from '@/navigation/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { OrderCard } from './components/OrderCard';
import { useOrders } from './hooks/useOrders';

type OrderStatus =
  | 'all'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELED';

type OrdersScreenNavigationProp = NativeStackNavigationProp<
  MoreStackParamList,
  'Orders'
>;

const OrdersScreen = () => {
  const navigation = useNavigation<OrdersScreenNavigationProp>();
  const colors = useColors();
  const [activeFilter, setActiveFilter] = useState<OrderStatus>('all');

  const { orders, isLoading, error, refetch } = useOrders({
    status: activeFilter === 'all' ? undefined : activeFilter,
  });

  const filters: { label: string; value: OrderStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending Payment', value: 'PENDING_PAYMENT' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Shipping', value: 'SHIPPING' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Canceled', value: 'CANCELED' },
  ];

  const handleViewDetails = (orderId: string) => {
    navigation.navigate('OrderDetailsScreen', { orderId });
  };

  const handleRefresh = () => {
    refetch();
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20 px-4">
      <AppText variant="heading3" className="mb-2">
        No Orders Yet
      </AppText>
      <AppText variant="body" color="muted" className="text-center">
        {activeFilter === 'all'
          ? 'Your order history will appear here'
          : `No ${filters
              .find(f => f.value === activeFilter)
              ?.label.toLowerCase()} orders found`}
      </AppText>
    </View>
  );

  const renderError = () => (
    <View className="flex-1 items-center justify-center py-20 px-4">
      <AppText variant="heading3" className="mb-2 text-error">
        Error Loading Orders
      </AppText>
      <AppText variant="body" color="muted" className="text-center mb-4">
        {error || 'Failed to fetch orders'}
      </AppText>
      <TouchableOpacity
        className="bg-primary px-6 py-3 rounded-lg"
        onPress={handleRefresh}
      >
        <AppText variant="body" className="text-white">
          Try Again
        </AppText>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-grow-0 border-b border-neutrals800"
        contentContainerClassName="px-4 py-3"
      >
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.value}
            onPress={() => setActiveFilter(filter.value)}
            className="mr-2"
          >
            <Chip
              variant={activeFilter === filter.value ? 'primary' : 'outline'}
              size="sm"
            >
              {filter.label}
            </Chip>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText variant="body" color="muted" className="mt-4">
            Loading orders...
          </AppText>
        </View>
      ) : error ? (
        renderError()
      ) : orders.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={handleViewDetails} />
          )}
          contentContainerClassName="py-4"
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

export default OrdersScreen;
