import { ChatStackParamList, RootStackParamList } from './types';

const signInPath: keyof RootStackParamList = 'SignIn';
const signUpPath: keyof RootStackParamList = 'SignUp';
const resetPasswordPath: keyof RootStackParamList = 'ResetPassword';
const verifyEmailPath: keyof RootStackParamList = 'VerifyEmail';
const authCompletePath: keyof RootStackParamList = 'AuthComplete';
const termAndUsePath: keyof RootStackParamList = 'TermAndUse';
const chooseCommunityPath: keyof RootStackParamList = 'ChooseCommunity';
const bottomTabPath: keyof RootStackParamList = 'Main';
const homePath: keyof RootStackParamList = 'Home';
const postStackPath: keyof RootStackParamList = 'PostStack';
const communityStackPath: keyof RootStackParamList = 'CommunityStack';
const shopPath: keyof RootStackParamList = 'Shop';
const shopDetailPath: keyof RootStackParamList = 'ShopDetail';
const shopProductPath: keyof RootStackParamList = 'ShopProduct';
const cartPath: keyof RootStackParamList = 'Cart';
const confirmOrderPath: keyof RootStackParamList = 'ConfirmOrder';
const paymentStackPath: keyof RootStackParamList = 'PaymentStack';
const paymentPath: keyof RootStackParamList = 'Payment';
const paymentSuccessPath: keyof RootStackParamList = 'PaymentSuccess';
const paymentFailurePath: keyof RootStackParamList = 'PaymentFailure';
const chatListPath: keyof ChatStackParamList = 'ChatList';
const chatWindowPath: keyof ChatStackParamList = 'ChatWindow';
export {
  authCompletePath,
  bottomTabPath,
  cartPath,
  chatListPath,
  chatWindowPath,
  chooseCommunityPath,
  communityStackPath,
  confirmOrderPath,
  homePath,
  paymentFailurePath,
  paymentPath,
  paymentStackPath,
  paymentSuccessPath,
  postStackPath,
  resetPasswordPath,
  shopDetailPath,
  shopPath,
  shopProductPath,
  signInPath,
  signUpPath,
  termAndUsePath,
  verifyEmailPath,
};
