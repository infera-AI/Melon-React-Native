import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import AppNavigator from './navigation/AppNavigator';
import EStyleSheet from 'react-native-extended-stylesheet';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MessageModalProvider } from './contexts/MessageModalContext';
import { useAppStore, useUserStore } from '@/store';

const App = () => {
  React.useEffect(() => {
    // 使Zustand主动同步AsyncStorage中的数据
    useAppStore.persist.rehydrate()
    useUserStore.persist.rehydrate()
  }, [])
  EStyleSheet.build({
    $spacing: 32,
  });
  return (
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
        </MessageModalProvider>
      </SafeAreaProvider>
    </LanguageProvider>
  );
};

export default App;
