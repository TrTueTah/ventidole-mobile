import PaymentFailureScreen from '@/screens/app/payment/PaymentFailureScreen';
import PaymentScreen from '@/screens/app/payment/PaymentScreen';
import PaymentSuccessScreen from '@/screens/app/payment/PaymentSuccessScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomScreenHeader from '../components/ScreenHeader';
import {
  paymentFailurePath,
  paymentPath,
  paymentSuccessPath,
} from '../pathLocations';

const PaymentStack = createNativeStackNavigator();

const PaymentStackNavigator = ({ route }: { route: any }) => {
  const orderId = route?.params?.orderId;
  const paymentMethod = route?.params?.paymentMethod;

  return (
    <PaymentStack.Navigator>
      <PaymentStack.Screen
        name={paymentPath}
        component={PaymentScreen}
        options={{
          headerShown: false,
          title: 'Payment',
          header: props => <CustomScreenHeader {...props} />,
        }}
        initialParams={{ orderId, paymentMethod }}
      />
      <PaymentStack.Screen
        name={paymentSuccessPath}
        component={PaymentSuccessScreen}
        options={{
          headerShown: false,
          title: 'Payment Successful',
        }}
      />
      <PaymentStack.Screen
        name={paymentFailurePath}
        component={PaymentFailureScreen}
        options={{
          headerShown: false,
          title: 'Payment Failed',
        }}
      />
    </PaymentStack.Navigator>
  );
};

export default PaymentStackNavigator;
