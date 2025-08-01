import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import AppNavigator from './navigation/AppNavigator';
import EStyleSheet from 'react-native-extended-stylesheet';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MessageModalProvider } from './contexts/MessageModalContext';
import { useAppStore, useUserStore } from '@/store';
import MessageModalRegister from '@/components/MessageModalRegister';
import { Provider as PaperProvider} from 'react-native-paper';

const App = () => {
  React.useEffect(() => {
    // 使Zustand主动同步AsyncStorage中的数据
    useAppStore.persist.rehydrate()
    useUserStore.persist.rehydrate()
    if (!__DEV__) {
      console.log = () => {};
      console.info = () => {};
      console.warn = () => {};
      console.debug = () => {};
      console.error = () => {};
    }
  }, [])
  EStyleSheet.build({
    $spacing: 32,
  });
  return (
    <PaperProvider>
      <LanguageProvider>
        <SafeAreaProvider>
          {/* 透明沉浸式状态栏设置 */}
          <StatusBar
            translucent
            backgroundColor="transparent"
            barStyle="light-content" // 或 dark-content 看界面颜色
          />
          <MessageModalProvider>
            <AppNavigator />
            <MessageModalRegister/>
          </MessageModalProvider>
        </SafeAreaProvider>
      </LanguageProvider>
    </PaperProvider>
  );
};

export default App;
