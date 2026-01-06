import {
  ChatStackParamList,
  MoreStackParamList,
  RootStackParamList,
} from './types';

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
const chatStackPath: keyof RootStackParamList = 'ChatStack';
const moreStackPath: keyof RootStackParamList = 'MoreStack';
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
const moreMainPath: keyof MoreStackParamList = 'MoreMain';
const profilePath: keyof MoreStackParamList = 'Profile';
const ordersPath: keyof MoreStackParamList = 'Orders';
const privacyPath: keyof MoreStackParamList = 'Privacy';
const termsPath: keyof MoreStackParamList = 'Terms';
const settingPath: keyof MoreStackParamList = 'Settings';
export {
  authCompletePath,
  bottomTabPath,
  cartPath,
  chatListPath,
  chatStackPath,
  chatWindowPath,
  chooseCommunityPath,
  communityStackPath,
  confirmOrderPath,
  homePath,
  moreMainPath,
  moreStackPath,
  ordersPath,
  paymentFailurePath,
  paymentPath,
  paymentStackPath,
  paymentSuccessPath,
  postStackPath,
  privacyPath,
  profilePath,
  resetPasswordPath,
  settingPath,
  shopDetailPath,
  shopPath,
  shopProductPath,
  signInPath,
  signUpPath,
  termAndUsePath,
  termsPath,
  verifyEmailPath,
};
