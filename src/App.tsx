import React, { useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import AppNavigator from './navigation/AppNavigator';
import EStyleSheet from 'react-native-extended-stylesheet';
import { StatusBar, AppState, Linking } from 'react-native';
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
import { usePointsStore } from '@/store/modules/points.store';

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
      let appSign = useAppStore.getState().appSign
      console.log('RN--AppSign--', appSign);
      
      // 如果没有设置 appSign，则从配置模块获取并设置
      if (!appSign) {
        const config = await ConfigModule.getConfig();
        useAppStore.getState().setAppSign(config.APP_SIGN);
        appSign = config.APP_SIGN
      }
      console.log('RN--AppSign2--', appSign);
      if (appSign === APP_SIGN_ENUM.TYPE_MELONS || appSign === APP_SIGN_ENUM.TYPE_MOMORS) {
        if (__DEV__) {
          mobileAds().setRequestConfiguration({
            testDeviceIdentifiers: [
              "238ac4067250bee05aadca80bef6b60c", // 你的设备 Test Device ID（从日志复制）
              "45a46753ed440d173ea44f0e40acc079"
            ],
          }).then(() => {
            console.log('谷歌广告测试设备已设置');
            
            mobileAds()
              .initialize()
              .then(adapterStatuses => {
                // Initialization complete!
                console.log('谷歌广告SDK初始化完成--', adapterStatuses);
                setIsInitialized(true);
              });
          })
          // mobileAds()
          //     .initialize()
          //     .then(adapterStatuses => {
          //       // Initialization complete!
          //       console.log('谷歌广告SDK初始化完成--', adapterStatuses);
          //       setIsInitialized(true);
          //     });
        } else {
          mobileAds()
            .initialize()
            .then(adapterStatuses => {
              // Initialization complete!
              console.log('谷歌广告SDK初始化完成--', adapterStatuses);
              setIsInitialized(true);
            });
        }
        
      } else {
        setIsInitialized(true);
      }
      // 应用打开初始化时，先检查是否有音乐生成任务在进行中
      useAppStore.getState().pollingGetStatusBycoverTaskId()
    });
    
    // 使Zustand主动同步AsyncStorage中的数据，Zustand主动会同步持久化数据，所以不写也可
    // useAppStore.persist.rehydrate()
    // useUserStore.persist.rehydrate()

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
   
    return () => {
      appStateSubscription.remove()
    }
  }, [])

  const handleAppStateChange = (nextAppState: any) => {
    if (nextAppState === 'active') {
      console.log('111111111');
      
      // App 切回前台时，再次检查是否有新的 URL 唤醒事件
      Linking.getInitialURL().then((url) => {
        console.log('2222222222222');
        usePointsStore.getState().refreshPointsBalance()
        if (url) { // 拿不到url
          // handleOpenURL({ url });
        }
      });
    }
  };

  // 处理唤醒事件的回调
  const handleOpenURL = (event: any) => {
    const url = event.url; // 完整的唤醒 URL，如 "com.melon.melons://?intent_id=12345&type=payment"
    console.log('被 Scheme 唤醒，URL：', url);

    // 解析参数
    const params = parseUrlParams(url);
    console.log('获取到的参数：', params); // { intent_id: '12345', type: 'payment' }

    
  };

  // 解析 URL 参数的工具函数
  const parseUrlParams = (url: any) => {
    const params: any = {};
    if (!url) return params;

    // 提取 ? 后的参数部分
    const queryString = url.split('?')[1];
    if (!queryString) return params;

    // 分割多个参数并解析
    queryString.split('&').forEach((item:any) => {
      const [key, value] = item?.split('=');
      if (key) {
        params[key] = decodeURIComponent(value || ''); // 解码特殊字符
      }
    });
    return params;
  };

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
