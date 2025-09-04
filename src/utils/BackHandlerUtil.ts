import { BackHandler, ToastAndroid, NativeModules, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // 导入导航焦点钩子
import { useCallback, useRef } from 'react';

const NativeKillBackgroundModule = NativeModules.NativeKillBackgroundModule;

export class BackHandlerUtil {
  private subscription: ReturnType<typeof BackHandler.addEventListener> | null = null;
  private lastBackPressed = 0;
  private exitText: string;
  private interval: number;

  constructor(exitText = '再按一次退出应用', interval: number = 2000) {
    this.exitText = exitText;
    this.interval = interval;
  }

  // 启动监听（页面获得焦点时调用）
  startListening() {
    if (this.subscription || Platform.OS !== 'android') return;

    const handleBackPress = () => {
      const now = Date.now();
      
      if (now - this.lastBackPressed < this.interval) {
        this.stopListening();
        this.killApp();
        return true;
      }

      this.lastBackPressed = now;
      ToastAndroid.show(this.exitText, ToastAndroid.SHORT);
      return true;
    };

    this.subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
  }

  // 停止监听（页面失去焦点时调用）
  stopListening() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.lastBackPressed = 0;
  }

  private killApp() {
    if (!NativeKillBackgroundModule?.killApp) {
      console.error('原生杀后台模块未初始化');
      ToastAndroid.show('退出失败', ToastAndroid.SHORT);
      return;
    }

    try {
      NativeKillBackgroundModule.killApp();
    } catch (error) {
      console.error('杀后台失败:', error);
      ToastAndroid.show('退出失败，请重试', ToastAndroid.SHORT);
    }
  }
}

/**
 * 适配导航框架的自定义Hook
 * 核心：根据页面焦点状态启动/停止监听
 */
export const useBackHandler = (exitText = '再按一次退出应用', interval = 2000) => {
  const backHandlerRef = useRef<BackHandlerUtil | null>(null);

  // 初始化工具类实例
  useFocusEffect(
    useCallback(() => {
      backHandlerRef.current = new BackHandlerUtil(exitText, interval);
      const handler = backHandlerRef.current;

      // 页面获得焦点时启动监听
      handler.startListening();

      // 页面失去焦点时停止监听（关键：子页面进入时触发）
      return () => {
        handler.stopListening();
        backHandlerRef.current = null;
      };
    }, [exitText, interval])
  );

  return backHandlerRef.current;
};

export default BackHandlerUtil;
