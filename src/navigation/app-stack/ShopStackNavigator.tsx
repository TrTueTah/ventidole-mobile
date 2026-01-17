import CartScreen from '@/screens/app/shop/cart/CartScreen';
import ConfirmOrderScreen from '@/screens/app/shop/confirm-order/ConfirmOrderScreen';
import ProductDetailScreen from '@/screens/app/shop/product-detail/ProductDetailScreen';
import ShopDetailScreen from '@/screens/app/shop/shop-detail/ShopDetailScreen';
import ShopMainScreen from '@/screens/app/shop/shop-main/ShopMainScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import CustomScreenHeader from '../components/ScreenHeader';
import {
  cartPath,
  confirmOrderPath,
  shopDetailPath,
  shopPath,
  shopProductPath,
} from '../pathLocations';

const ShopStack = createNativeStackNavigator();

const ShopStackNavigator = () => {
  const { t } = useTranslation();
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
          title: t('HEADER.CART'),
          header: props => <CustomScreenHeader {...props} />,
        }}
      />
      <ShopStack.Screen
        name={confirmOrderPath}
        key={confirmOrderPath}
        component={ConfirmOrderScreen}
        options={{
          headerShown: true,
          title: t('HEADER.CONFIRM_ORDER'),
          header: props => <CustomScreenHeader {...props} />,
        }}
      />
    </ShopStack.Navigator>
  );
};

export default ShopStackNavigator;
