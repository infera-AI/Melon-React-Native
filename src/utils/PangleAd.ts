import { NativeModules, DeviceEventEmitter, NativeEventEmitter } from 'react-native';

// 获取原生Module（名称必须与PangleAdModule.getName()一致）
const { PangleAd } = NativeModules;

let pangleAdEmitter: NativeEventEmitter | null

// 广告事件常量（与原生端完全一致，不可修改）
export const AdEvents = {
  // 初始化相关
  AD_INIT_SUCCESS: 'PangleAd_onInitSuccess',
  AD_INIT_FAILED: 'PangleAd_onInitFailed',
  // 加载相关
  AD_LOADED: 'PangleAd_onAdLoaded',
  AD_LOAD_FAILED: 'PangleAd_onAdLoadFailed',
  // 展示相关
  AD_SHOWN: 'PangleAd_onAdShown',
  AD_SHOW_FAILED: 'PangleAd_onAdShowFailed',
  // 交互相关
  AD_CLICKED: 'PangleAd_onAdClicked',
  AD_CLOSED: 'PangleAd_onAdClosed',
  // 视频相关
  VIDEO_COMPLETED: 'PangleAd_onVideoCompleted',
  VIDEO_ERROR: 'PangleAd_onVideoError',
  VIDEO_SKIPPED: 'PangleAd_onVideoSkipped',
  // 奖励相关
  REWARD_ARRIVED: 'PangleAd_onRewardArrived',
  ADVANCED_REWARD: 'PangleAd_onAdvancedReward',
};

// 可选参数类型定义（初始化广告时的可选配置）
export interface InitAdOptions {
  rewardName?: string;        // 奖励名称（如“金币”）
  rewardAmount?: number;      // 奖励数量（如100）
  enableAdvancedReward?: boolean; // 是否启用进阶奖励（默认false）
}

// 广告管理类（RN端调用入口）
export const PangleAdManager = {
  /**
   * 1. 初始化广告（对应原生initAd()）
   * @param adCodeId 广告位ID（必传，9开头9位数字）
   * @param options 可选配置（奖励、进阶奖励）
   */
  initAd: async (adCodeId: string, options?: InitAdOptions) => {
    if (!PangleAd) throw new Error('PangleAd模块未注册，请检查原生配置');
    if (!adCodeId.trim() || !/^9\d{8}$/.test(adCodeId)) {
      throw new Error('请传入有效的广告位ID（9开头9位数字）');
    }

    try {
      // 调用原生initAd方法，传递广告位ID和可选参数
      return await PangleAd.initAd(adCodeId, options || {});
    } catch (error: any) {
      console.error('广告初始化失败:', error.message);
      throw error;
    }
  },

  /**
   * 2. 加载广告（对应原生autoLoadRewardAd()）
   * 注意：必须先调用initAd且初始化成功
   */
  autoLoadRewardAd: async () => {
    if (!PangleAd) throw new Error('PangleAd模块未注册');

    try {
      return await PangleAd.autoLoadRewardAd("11");
    } catch (error: any) {
      console.error('广告加载失败:', error.message);
      throw error;
    }
  },

  /**
   * 3. 展示广告（对应原生showAd()，无需传参）
   * 注意：必须先调用autoLoadRewardAd且加载成功
   */
  showAd: async () => {
    if (!PangleAd) throw new Error('PangleAd模块未注册');

    try {
      return await PangleAd.showAd("1");
    } catch (error: any) {
      console.error('广告展示失败:', error.message);
      throw error;
    }
  },

  /**
   * 4. 释放广告资源（页面卸载时调用）
   */
  releaseAd: async () => {
    if (!PangleAd) throw new Error('PangleAd模块未注册');

    try {
      return await PangleAd.releaseAd("1");
    } catch (error: any) {
      console.error('释放广告资源失败:', error.message);
      throw error;
    }
  },

  /**
   * 5. 监听广告事件（RN端接收原生回调）
   * @param eventName 事件名称（从AdEvents中获取）
   * @param callback 事件回调函数
   * @returns 取消监听的函数（组件卸载时调用）
   */
  addEventListener: (eventName: string, callback: (data: any) => void) => {
    if (!pangleAdEmitter) {
        pangleAdEmitter = new NativeEventEmitter(PangleAd);
    }
    const listener = pangleAdEmitter.addListener(eventName, callback);
    return () => listener.remove(); // 取消监听
  },
};