import InsetsHelper from '@/components/helpers/InsetsHelper.tsx';
import { LanguageHelper } from '@/components/helpers/LanguageHelper.tsx';
import BackendApiProvider from '@/components/providers/BackendApiProvider';
import { DialogProvider } from '@/components/ui/DialogProvider.tsx';
import { ToastProvider } from '@/components/ui/ToastProvider.tsx';
import '@/config/global.css';
import '@/config/i18n'; // Initialize i18n
import '@/config/i18n.ts';
import { useColors } from '@/hooks/useColors';
import Navigator from '@/navigation/Navigator';
import { useAppStore } from '@/store/appStore';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

if (__DEV__) {
  require('./ReactotronConfig');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC = () => {
  const theme = useAppStore(state => state.theme);
  const colors = useColors();

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <View style={{ flex: 1 }} className={theme === 'dark' ? 'dark' : ''}>
          <BackendApiProvider>
            <StatusBar
              translucent
              backgroundColor="transparent"
              barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
            />
            <NavigationContainer
              theme={{
                ...DefaultTheme,
                dark: theme === 'dark',
                colors: {
                  primary: colors.primary,
                  background: colors.background,
                  card: colors.neutrals800,
                  text: colors.foreground,
                  border: colors.neutrals700,
                  notification: colors.primary,
                },
              }}
            >
              <BottomSheetModalProvider>
                <SafeAreaProvider>
                  <DialogProvider>
                    <ToastProvider>
                      <InsetsHelper />
                      <LanguageHelper />
                      <Navigator />
                    </ToastProvider>
                  </DialogProvider>
                </SafeAreaProvider>
              </BottomSheetModalProvider>
            </NavigationContainer>
          </BackendApiProvider>
        </View>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
};

function App() {
  return <AppContent />;
}

export default App;
