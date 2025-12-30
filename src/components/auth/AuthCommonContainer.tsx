import AuthTitle from '@/components/auth/AuthTitle';
import BackButton from '@/components/auth/BackButton';
import AppButton from '@/components/ui/AppButton';
import { useNavigation } from '@react-navigation/native';
import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';

interface AuthCommonContainerProps {
  title: string;
  children: ReactNode;
  bottomButtonText?: string;
  onBottomButtonPress?: () => void;
  bottomButtonDisabled?: boolean;
  bottomButtonLoading?: boolean;
  showBackButton?: boolean;
  showBottomButton?: boolean;
}

const AuthCommonContainer: React.FC<AuthCommonContainerProps> = ({
  title,
  children,
  bottomButtonText,
  onBottomButtonPress,
  bottomButtonDisabled = false,
  bottomButtonLoading = false,
  showBackButton = true,
  showBottomButton = true,
}) => {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="flex-1 justify-between px-4">
            {/* Header with Back Button */}
            <View>
              {showBackButton && (
                <View className="flex-row items-center py-4">
                  {navigation.canGoBack() && (
                    <BackButton onPress={() => navigation.goBack()} />
                  )}
                </View>
              )}

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                <View className="gap-6">
                  {/* Title */}
                  <AuthTitle title={title} />

                  {/* Content */}
                  {children}
                </View>
              </ScrollView>
            </View>

            {/* Bottom Button */}
            {showBottomButton && bottomButtonText && onBottomButtonPress && (
              <View className="py-4">
                <AppButton
                  variant="primary"
                  size="lg"
                  onPress={onBottomButtonPress}
                  loading={bottomButtonLoading}
                  disabled={bottomButtonDisabled || bottomButtonLoading}
                >
                  {bottomButtonText}
                </AppButton>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default AuthCommonContainer;
