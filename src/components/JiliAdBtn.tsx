// 激励视频 按钮组件
import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef
} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Platform,
  PermissionsAndroid,
  Dimensions,
  ViewStyle
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppStore, useUserStore } from '@/store';
import { scaleSize } from '@/utils/scale';
import { APP_SIGN_ENUM } from '@/utils/constants';
import { usePointsStore } from '@/store/modules/points.store';

import { PangleAdManager, AdEvents, InitAdOptions } from '@/utils/PangleAd';
import { RewardedAd, RewardedAdEventType, AdEventType, TestIds } from 'react-native-google-mobile-ads';

import FullScreenLoader from '@/components/FullScreenLoader';


export type SpeakBtnRef = {
  destroy: () => void;
  start: () => void;
  stop: () => void;
};

type Props = {
  style?: ViewStyle;
  renderContent?: () => JSX.Element;
  clickHandle?: (data: any) => void; // 按钮点击回调
  adCloseHandle?: (data: any) => void; // 广告关闭回调
  onDestroy?: (data: any) => void; // 组件销毁回调
};

const JiliAdBtn = forwardRef<SpeakBtnRef, Props>(({
  renderContent = () => <View/>,
  style = {},
  clickHandle = () => null,
  adCloseHandle = () => null,
  onDestroy = () => null,
}, ref) => {
  const refreshPointsBalance = usePointsStore((state) => state.refreshPointsBalance);
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);

  const isGetRewarded = useRef(false); // 是否已获得奖励, 后面再看要不要加提示用户奖励成功弹窗

  const [adCodeId, setAdCodeId] = useState('969900432'); // 穿山甲广告位ID（9开头9位）
  const [rewardName, setRewardName] = useState('Points');   // 奖励名称（可选）
  const [rewardAmount, setRewardAmount] = useState(50);  // 奖励数量（可选）
  const [enableAdvancedReward, setEnableAdvancedReward] = useState(false); // 是否启用进阶奖励（可选）

  let googleRewarded: RewardedAd // 谷歌激励广告实例

  useEffect(() => {
    console.log('激励广告btn初始化，添加监听');
    let initSuccessListener: (() => void) | undefined
    let initFailListener: (() => void) | undefined
    let loadSuccessListener: (() => void) | undefined
    let loadFailListener: (() => void) | undefined
    let rewardListener: (() => void) | undefined
    let adCloseListener: (() => void) | undefined

    // 国内版本需要使用穿山甲广告SDK
    if (
      useAppStore.getState().appSign === APP_SIGN_ENUM.TYPE_MELON ||
      useAppStore.getState().appSign === APP_SIGN_ENUM.TYPE_MOMOR
    ) {
      // 3.1 监听「初始化成功」事件
      initSuccessListener = PangleAdManager.addEventListener(
        AdEvents.AD_INIT_SUCCESS,
        (data) => {
          // setAdStatus(data.msg); // 显示初始化成功信息（如“广告初始化成功（广告位ID：969875202）”）
          // Alert.alert('广告初始化成功', data.msg);
          console.log('RN接收到原生事件：广告初始化成功:', data.msg);
          
        }
      );

        // 3.2 监听「初始化失败」事件
      initFailListener = PangleAdManager.addEventListener(
        AdEvents.AD_INIT_FAILED,
        (data) => {
          // setAdStatus(`初始化失败：${data.msg}`);
          // Alert.alert('广告初始化失败', data.msg);
          console.log('广告初始化失败:', data.msg);
          setLoading(false)
          
        }
      );

      // 3.3 监听「广告加载成功」事件
      loadSuccessListener = PangleAdManager.addEventListener(
        AdEvents.AD_LOADED,
        (data) => {
          // setAdStatus(data.msg); // 显示加载成功信息（如“广告素材缓存完成（最佳展示时机）”）
          console.log('RN接收到原生事件广告加载成功:', data.msg);
          PangleAdManager.showAd();
          
        }
      );

      // 3.4 监听「广告加载失败」事件
      loadFailListener = PangleAdManager.addEventListener(
        AdEvents.AD_LOAD_FAILED,
        (data) => {
          // setAdStatus(`加载失败：${data.msg}（错误码：${data.code}）`);
          // Alert.alert('广告加载失败', `错误码：${data.code}\n原因：${data.msg}`);
          console.log('RN接收到原生事件广告加载失败', `错误码：${data.code}\n原因：${data.msg}`);
          setLoading(false)
          
        }
      );

      // 3.5 监听「奖励到账」事件（核心业务逻辑：用户看完广告后发放奖励）
      rewardListener = PangleAdManager.addEventListener(
        AdEvents.REWARD_ARRIVED,
        (data) => {
          if (data.isRewardValid) {
            // 奖励有效：执行发放逻辑（如调用API给用户加金币）
            // Alert.alert(
            //   '奖励到账',
            //   `恭喜获得 ${data.rewardAmount} ${data.rewardName}`
            // );
            console.log(`RN接收到原生事件奖励到账: 恭喜获得 ${data.rewardAmount} ${data.rewardName}`);
            isGetRewarded.current = true
            // 示例：调用后端接口发放奖励
            // fetch('/api/user/addReward', {
            //   method: 'POST',
            //   body: JSON.stringify({
            //     userId: '当前用户ID',
            //     rewardType: data.rewardName,
            //     rewardNum: data.rewardAmount
            //   })
            // });
          } else {
            // 奖励无效：提示用户
            // Alert.alert('奖励无效', `原因：${data.serverErrorMsg || '未知错误'}`);
            console.log('RN接收到原生事件奖励无效: ', `原因：${data.serverErrorMsg || '未知错误'}`);
          }
        }
      );

      // 3.6 监听「广告关闭」事件
      adCloseListener = PangleAdManager.addEventListener(
        AdEvents.AD_CLOSED,
        async (data) => {
          // setAdStatus('广告已关闭');
          console.log('RN接收到原生事件广告已关闭');
          setTimeout(async() => {
            await refreshPointsBalance()
            setLoading(false)
            adCloseHandle && adCloseHandle(isGetRewarded.current)
          })
        }
      );
    } else { // 国外版使用谷歌广告

    }
    // 销毁钩子
    return () => {
      console.log('激励广告btn卸载，移除监听');
      
      if (
        useAppStore.getState().appSign === APP_SIGN_ENUM.TYPE_MELON ||
        useAppStore.getState().appSign === APP_SIGN_ENUM.TYPE_MOMOR
      ) {
        console.log('RN端写在监听器');
        initSuccessListener && initSuccessListener();
        initFailListener && initFailListener();
        loadSuccessListener && loadSuccessListener();
        loadFailListener && loadFailListener();
        rewardListener && rewardListener();
        adCloseListener && adCloseListener();
        PangleAdManager.releaseAd(); // 释放广告资源，避免内存泄漏
      } else {
        googleRewarded && googleRewarded.removeAllListeners()
      }
      onDestroy && onDestroy(isGetRewarded.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 4.1 初始化广告（必选：传入广告位ID，可选传奖励信息/进阶奖励）
  const handleInitAd = async () => {
    isGetRewarded.current = false
    clickHandle && clickHandle(null)
    console.log('useAppStore.getState().appSign---', useAppStore.getState().appSign);
    if (
      useAppStore.getState().appSign === APP_SIGN_ENUM.TYPE_MELON ||
      useAppStore.getState().appSign === APP_SIGN_ENUM.TYPE_MOMOR
    ) {
      if (!adCodeId.trim()) {
        // Alert.alert('输入错误', '请输入有效的广告位ID（9开头9位数字）');
        console.log('请输入有效的广告位ID（9开头9位数字）');
        
        return;
      }

      // setAdStatus('正在初始化广告...');
      console.log('正在初始化广告...');
      
      try {
        // 构建可选参数（仅当需要设置奖励或启用进阶奖励时传递）
        const options: InitAdOptions = {};
        if (rewardName.trim() && rewardAmount > 0) {
          options.rewardName = rewardName;
          options.rewardAmount = rewardAmount;
        }
        if (enableAdvancedReward) {
          options.enableAdvancedReward = false;
        }

        // 调用原生initAd方法（核心：传入广告位ID + 可选参数）
        await PangleAdManager.initAd(adCodeId, options);
        await PangleAdManager.autoLoadRewardAd();
        // await PangleAdManager.showAd();
      } catch (error: any) {
        // setAdStatus(`初始化失败：${error.message}`);
        console.log('广告初始化失败:', error.message);
        
      }
    } else { // 国外版使用谷歌
      // googleRewarded = RewardedAd.createForAdRequest(TestIds.REWARDED, {
      //   // keywords: ['fashion', 'clothing'],
      // });
      if (!useUserStore.getState().token) {
        console.log('用户未登录，无法观看广告');
        return
      }
      if (Platform.OS === 'android') {
        setTimeout(async() => {
          isGetRewarded.current = true
          refreshPointsBalance()
          setLoading(false)
          adCloseHandle && adCloseHandle(isGetRewarded.current)
        })
        return
      }
      console.log('国外版使用谷歌');
      setLoading(true)
      googleRewarded = RewardedAd.createForAdRequest('ca-app-pub-2954543818912070/6675121612', {
        // keywords: ['fashion', 'clothing'],
        keywords: [],
        serverSideVerificationOptions: {
          userId: useUserStore.getState().token || '',
        }
      });
      googleRewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('谷歌激励广告加载完成');
        googleRewarded.show()
      })
      googleRewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
        console.log('谷歌激励广告获得奖励完成----', reward);
        isGetRewarded.current = true
      })
      googleRewarded.addAdEventListener(AdEventType.CLOSED, async () => {
        console.log('谷歌激励广告关闭----');
        setTimeout(async() => {
          await refreshPointsBalance()
          setLoading(false)
          adCloseHandle && adCloseHandle(isGetRewarded.current)
        })
        
      })
      googleRewarded.addAdEventListener(AdEventType.ERROR, () => {
        console.log('谷歌激励广告错误----');
        setLoading(false)
      })
      googleRewarded.load()
    }
  };
  

  // 💡暴露方法
  // useImperativeHandle(ref, () => ({
  //   destroy,
  //   start: downClick,
  //   stop: upClick
  // }));

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleInitAd}
        style={style}
      >
        {renderContent && renderContent()}
      </TouchableOpacity>

      <FullScreenLoader
        visible={loading}
        text={t('translate_screen.loading_text')}
      />
    </>
    
  );
});

export default JiliAdBtn;
