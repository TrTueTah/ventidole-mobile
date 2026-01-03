import CartScreen from '@/screens/app/shop/cart/CartScreen';
import ConfirmOrderScreen from '@/screens/app/shop/confirm-order/ConfirmOrderScreen';
import PaymentFailureScreen from '@/screens/app/shop/payment/PaymentFailureScreen';
import PaymentScreen from '@/screens/app/shop/payment/PaymentScreen';
import PaymentSuccessScreen from '@/screens/app/shop/payment/PaymentSuccessScreen';
import ProductDetailScreen from '@/screens/app/shop/product-detail/ProductDetailScreen';
import ShopDetailScreen from '@/screens/app/shop/shop-detail/ShopDetailScreen';
import ShopMainScreen from '@/screens/app/shop/shop-main/ShopMainScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomScreenHeader from '../components/ScreenHeader';
import {
  cartPath,
  confirmOrderPath,
  paymentFailurePath,
  paymentPath,
  paymentSuccessPath,
  shopDetailPath,
  shopPath,
  shopProductPath,
} from '../pathLocations';

const ShopStack = createNativeStackNavigator();

const ShopStackNavigator = () => {
  return (
    <ShopStack.Navigator initialRouteName={shopPath}>
      <ShopStack.Screen
        name={shopPath}
        key={shopPath}
        component={ShopMainScreen}
        options={{
          headerShown: false,
        }}
      />
      <ShopStack.Screen
        name={shopDetailPath}
        key={shopDetailPath}
        component={ShopDetailScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.shopName || 'Shop Detail',
          header: props => <CustomScreenHeader {...props} />,
        })}
      />
      <ShopStack.Screen
        name={shopProductPath}
        key={shopProductPath}
        component={ProductDetailScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.shopName || 'Product Detail',
          header: props => <CustomScreenHeader {...props} />,
        })}
      />
      <ShopStack.Screen
        name={cartPath}
        key={cartPath}
        component={CartScreen}
        options={{
          headerShown: true,
          header: props => <CustomScreenHeader {...props} />,
        }}
      />
      <ShopStack.Screen
        name={confirmOrderPath}
        key={confirmOrderPath}
        component={ConfirmOrderScreen}
        options={{
          headerShown: true,
          header: props => <CustomScreenHeader {...props} />,
        }}
      />
      <ShopStack.Screen
        name={paymentPath}
        key={paymentPath}
        component={PaymentScreen}
        options={{
          headerShown: true,
          header: props => <CustomScreenHeader {...props} />,
        }}
      />
      <ShopStack.Screen
        name={paymentSuccessPath}
        key={paymentSuccessPath}
        component={PaymentSuccessScreen}
        options={{
          headerShown: true,
          title: 'Payment Success',
          header: props => <CustomScreenHeader {...props} />,
        }}
      />
      <ShopStack.Screen
        name={paymentFailurePath}
        key={paymentFailurePath}
        component={PaymentFailureScreen}
        options={{
          headerShown: true,
          title: 'Payment Failed',
          header: props => <CustomScreenHeader {...props} />,
        }}
      />
    </ShopStack.Navigator>
  );
};

export default ShopStackNavigator;
