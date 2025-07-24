import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import AppNavigator from './navigation/AppNavigator';
import EStyleSheet from 'react-native-extended-stylesheet';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
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
        <AppNavigator />
      </SafeAreaProvider>
    </LanguageProvider>
  );
};

export default App;
