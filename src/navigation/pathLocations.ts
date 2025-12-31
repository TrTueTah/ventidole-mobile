import { RootStackParamList } from './types';

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

export {
  authCompletePath,
  bottomTabPath,
  chooseCommunityPath,
  homePath,
  postStackPath,
  resetPasswordPath,
  signInPath,
  signUpPath,
  termAndUsePath,
  verifyEmailPath,
};
