import React, { useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import AppNavigator from './navigation/AppNavigator';
import EStyleSheet from 'react-native-extended-stylesheet';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MessageModalProvider } from './contexts/MessageModalContext';
import { useAppStore, useUserStore } from '@/store';
import MessageModalRegister from '@/components/MessageModalRegister';
import { Provider as PaperProvider} from 'react-native-paper';
import { NativeModules } from 'react-native';
const { ConfigModule } = NativeModules;
import { ThemeProvider } from './contexts/ThemeContext';
import mobileAds from 'react-native-google-mobile-ads';
import { APP_SIGN_ENUM } from './utils';

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  React.useEffect(() => {
    if (!__DEV__) {
      console.log = () => {};
      console.info = () => {};
      console.warn = () => {};
      console.debug = () => {};
      console.error = () => {};
    }
    useAppStore.persist.onFinishHydration(async() => {
      // zustand 持久化数据已加载完成

      // 获取应用标识
      const appSign = useAppStore.getState().appSign
      console.log('RN--AppSign--', appSign);
      
      // 如果没有设置 appSign，则从配置模块获取并设置
      if (!appSign) {
        const config = await ConfigModule.getConfig();
        useAppStore.getState().setAppSign(config.APP_SIGN);
      }
      if (appSign === APP_SIGN_ENUM.TYPE_MELONS || appSign === APP_SIGN_ENUM.TYPE_MOMORS) {
        mobileAds()
          .initialize()
          .then(adapterStatuses => {
            // Initialization complete!
            console.log('谷歌广告SDK初始化完成--', adapterStatuses);
            setIsInitialized(true);
          });
      } else {
        setIsInitialized(true);
      }
    });
    
    // 使Zustand主动同步AsyncStorage中的数据，Zustand主动会同步持久化数据，所以不写也可
    // useAppStore.persist.rehydrate()
    // useUserStore.persist.rehydrate()
   
  }, [])

  EStyleSheet.build({
    $spacing: 32,
  });
  return (
    <PaperProvider>
      <ThemeProvider>
        <LanguageProvider>
          <SafeAreaProvider>
            {/* 透明沉浸式状态栏设置 */}
            <StatusBar
              translucent
              backgroundColor="transparent"
              barStyle="light-content" // 或 dark-content 看界面颜色
            />
            <MessageModalProvider>
              {
                isInitialized &&
                <AppNavigator />
              }
              <MessageModalRegister/>
            </MessageModalProvider>
          </SafeAreaProvider>
        </LanguageProvider>
      </ThemeProvider>
    </PaperProvider>
  );
};

export default App;
