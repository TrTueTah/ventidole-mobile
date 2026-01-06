import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Root Stack Navigator
export type RootStackParamList = {
  Main?: NavigatorScreenParams<MainTabParamList>;
  Settings: undefined;
  ComponentsDemo: undefined;
  AvatarDemo: undefined;
  BadgeDemo: undefined;
  ChipDemo: undefined;
  CheckboxDemo: undefined;
  ProgressBarDemo: undefined;
  AppButtonDemo: undefined;
  SliderDemo: undefined;
  SwitchDemo: undefined;
  SelectDemo: undefined;
  AppTextDemo: undefined;
  Login: undefined;
  Register: undefined;
  About: undefined;
  SignIn: undefined;
  SignUp: { email: string };
  ResetPassword: { email: string };
  VerifyEmail: { type: 'register' | 'resetPassword' };
  AuthComplete: { type: 'register' | 'resetPassword' };
  TermAndUse: undefined;
  ChooseCommunity: undefined;
  Home: undefined;
  PostStack: { postId: string; communityId?: string };
  CommunityStack: { communityId: string };
  ChatStack: NavigatorScreenParams<ChatStackParamList>;
  MoreStack: NavigatorScreenParams<MoreStackParamList>;
  PaymentStack: { orderId: string; paymentMethod: 'CREDIT' | 'COD' };
  Shop: undefined;
  ShopDetail: { shopId: string; shopName: string };
  ShopProduct: { productId: string; shopName: string };
  Cart: undefined;
  ConfirmOrder: undefined;
  Payment: { orderId: string; paymentMethod: 'CREDIT' | 'COD' };
  PaymentSuccess: { orderId: string };
  PaymentFailure: { orderId: string };
};

// Chat Stack Navigator
export type ChatStackParamList = {
  ChatList: undefined;
  ChatWindow: { channelId: string };
};

// More Stack Navigator
export type MoreStackParamList = {
  MoreMain: undefined;
  Profile: undefined;
  Orders: undefined;
  Privacy: undefined;
  Terms: undefined;
  Settings: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  HOME: undefined;
  CHAT: undefined;
  MARKETPLACE: undefined;
  MORE: undefined;
};

// Screen props types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  NativeStackScreenProps<MainTabParamList, T>;

export type ChatStackScreenProps<T extends keyof ChatStackParamList> =
  NativeStackScreenProps<ChatStackParamList, T>;

export type MoreStackScreenProps<T extends keyof MoreStackParamList> =
  NativeStackScreenProps<MoreStackParamList, T>;

// Navigation prop types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
