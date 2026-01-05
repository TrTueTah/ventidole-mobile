import InsetsHelper from '@/components/helpers/InsetsHelper.tsx';
import { LanguageHelper } from '@/components/helpers/LanguageHelper.tsx';
import BackendApiProvider from '@/components/providers/BackendApiProvider';
import { StreamChatProvider } from '@/components/providers/StreamChatProvider';
import { AppText } from '@/components/ui';
import { DialogProvider } from '@/components/ui/DialogProvider.tsx';
import { ToastProvider } from '@/components/ui/ToastProvider.tsx';
import '@/config/global.css';
import '@/config/i18n'; // Initialize i18n
import '@/config/i18n.ts';
import { ChatChannelsProvider } from '@/contexts/ChatChannelsProvider';
import { useColors } from '@/hooks/useColors';
import Navigator from '@/navigation/Navigator';
import { useAppStore } from '@/store/appStore';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useRef } from 'react';
import { Linking, StatusBar, View } from 'react-native';
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
  const navigationRef = useRef<any>(null);

  React.useEffect(() => {
    console.log('Setting up deep link listeners...');

    // Get initial URL when app is opened from a deep link
    Linking.getInitialURL()
      .then(url => {
        console.log('getInitialURL result:', url);
        if (url) {
          console.log('Initial URL:', url);
        }
      })
      .catch(err => {
        console.error('Error getting initial URL:', err);
      });

    // Listen for deep links when app is already open
    const subscription = Linking.addEventListener('url', event => {
      console.log('Deep link event received:', event);
      console.log('Deep link URL:', event.url);
    });

    return () => {
      console.log('Removing deep link listener');
      subscription.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <View style={{ flex: 1 }} className={theme === 'dark' ? 'dark' : ''}>
          <BackendApiProvider>
            <StreamChatProvider>
              <ChatChannelsProvider>
                <StatusBar
                  translucent
                  backgroundColor="transparent"
                  barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
                />
                <NavigationContainer
                ref={navigationRef}
                onReady={() => console.log('Navigation is ready')}
                onStateChange={state =>
                  console.log(
                    'Navigation state changed:',
                    state?.routes?.[state.index]?.name,
                  )
                }
                linking={{
                  enabled: true,
                  prefixes: ['ventidole://', 'https://ventidole.com'],
                  config: {
                    screens: {
                      PaymentSuccess: 'payment/success/:orderId',
                      PaymentFailure: 'payment/failure/:orderId',
                      Main: '',
                    },
                  },
                }}
                fallback={
                  <View>
                    <AppText>Loading...</AppText>
                  </View>
                }
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
            </ChatChannelsProvider>
            </StreamChatProvider>
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
