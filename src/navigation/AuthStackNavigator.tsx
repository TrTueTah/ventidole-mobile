import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationIndependentTree } from '@react-navigation/native';
import { authCompletePath, chooseIdolPath, resetPasswordPath, signInPath, signUpPath, termAndUsePath, verifyEmailPath } from './pathLocations';
import SignInScreen from '@/screens/auth/sign-in/SignInScreen';
import SignUpScreen from '@/screens/auth/sign-up/SignUpScreen';
import ResetPasswordScreen from '@/screens/auth/reset-password/ResetPasswordScreen';
import VerifyEmailScreen from '@/screens/auth/verify-email/VerifyEmailScreen';
import AuthCompleteScreen from '@/screens/auth/auth-complete/AuthCompleteScreen';
import TermAndUseScreen from '@/screens/auth/term-and-use/TermAndUseScreen';
import ChooseIdolScreen from '@/screens/auth/choose-idol/ChooseIdolScreen';

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
          key={signUpPath}
          name={signUpPath}
          component={SignUpScreen}
        />
        <AuthStack.Screen
          key={resetPasswordPath}
          name={resetPasswordPath}
          component={ResetPasswordScreen}
        />
        <AuthStack.Screen
          key={verifyEmailPath}
          name={verifyEmailPath}
          component={VerifyEmailScreen}
        />
        <AuthStack.Screen
          key={authCompletePath}
          name={authCompletePath}
          component={AuthCompleteScreen}
        />
        <AuthStack.Screen
          key={termAndUsePath}
          name={termAndUsePath}
          component={TermAndUseScreen}
        />
        <AuthStack.Screen
          key={chooseIdolPath}
          name={chooseIdolPath}
          component={ChooseIdolScreen}
        />
      </AuthStack.Navigator>
    </NavigationIndependentTree>
  );
};

export default AuthStackNavigator;
