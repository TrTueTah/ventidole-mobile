import AuthCompleteScreen from '@/screens/auth/auth-complete/AuthCompleteScreen';
import ChooseCommunityScreen from '@/screens/auth/choose-community/ChooseCommunityScreen';
import ResetPasswordScreen from '@/screens/auth/reset-password/ResetPasswordScreen';
import SignInScreen from '@/screens/auth/sign-in/SignInScreen';
import SignUpScreen from '@/screens/auth/sign-up/SignUpScreen';
import TermAndUseScreen from '@/screens/auth/term-and-use/TermAndUseScreen';
import VerifyEmailScreen from '@/screens/auth/verify-email/VerifyEmailScreen';
import { NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  authCompletePath,
  chooseCommunityPath,
  resetPasswordPath,
  signInPath,
  signUpPath,
  termAndUsePath,
  verifyEmailPath,
} from './pathLocations';

const AuthStack = createNativeStackNavigator();

const AuthStackNavigator = () => {
  return (
    <NavigationIndependentTree>
      <AuthStack.Navigator
        screenOptions={{ headerShown: false, freezeOnBlur: true }}
      >
        <AuthStack.Screen
          key={signInPath}
          name={signInPath}
          component={SignInScreen}
        />
        <AuthStack.Screen
          key={chooseCommunityPath}
          name={chooseCommunityPath}
          component={ChooseCommunityScreen}
        />
        <AuthStack.Screen
          key={authCompletePath}
          name={authCompletePath}
          component={AuthCompleteScreen}
        />
        <AuthStack.Screen
          key={resetPasswordPath}
          name={resetPasswordPath}
          component={ResetPasswordScreen}
        />
        <AuthStack.Screen
          key={signUpPath}
          name={signUpPath}
          component={SignUpScreen}
        />
        <AuthStack.Screen
          key={verifyEmailPath}
          name={verifyEmailPath}
          component={VerifyEmailScreen}
        />
        <AuthStack.Screen
          key={termAndUsePath}
          name={termAndUsePath}
          component={TermAndUseScreen}
        />
      </AuthStack.Navigator>
    </NavigationIndependentTree>
  );
};

export default AuthStackNavigator;
