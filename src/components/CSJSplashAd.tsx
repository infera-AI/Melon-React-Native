import React, { useEffect, useRef, useCallback, useMemo, forwardRef, ForwardedRef } from 'react';
import {
  requireNativeComponent,
  View,
  NativeEventEmitter,
  findNodeHandle,
  UIManager,
  ViewStyle,
  NativeSyntheticEvent,
  EmitterSubscription,
  NativeModules
} from 'react-native';

// 1. 定义原生组件属性类型
interface NativeCSJSplashAdViewProps {
  style?: ViewStyle;
}

// 2. 引入原生UI组件（与原生ViewManager名称一致）
const NativeCSJSplashAdView = requireNativeComponent<NativeCSJSplashAdViewProps>('CSJSplashAdView');

// 3. 定义广告错误事件参数类型
interface SplashAdErrorEvent {
  errorMsg: string;
}

// 4. 定义组件对外属性类型
interface CSJSplashAdProps {
  /** 穿山甲开屏广告代码位ID（8开头9位数字，必传） */
  adCodeId: string;
  /** 广告加载超时时间（毫秒，默认4000ms，建议>3500） */
  timeout?: number;
  /** 广告加载成功回调 */
  onLoadSuccess?: () => void;
  /** 广告渲染成功回调 */
  onRenderSuccess?: () => void;
  /** 广告展示回调 */
  onAdShow?: () => void;
  /** 广告点击回调 */
  onAdClick?: () => void;
  /** 广告关闭回调（跳过/倒计时结束） */
  onAdClose?: () => void;
  /** 广告错误回调（加载/渲染失败） */
  onError?: () => void;
  /** 强制跳主界面回调（生命周期触发） */
  onForceGoMain?: () => void;
  /** 自定义广告容器样式（可选） */
  style?: ViewStyle;
}

// 5. 定义组件对外暴露的方法类型（供父组件通过ref调用）
export interface CSJSplashAdMethods {
  /** 处理页面切回前台（与Activity的onResume同步） */
  onResume: () => void;
  /** 处理页面切到后台（与Activity的onStop同步） */
  onStop: () => void;
  /** 手动销毁广告（防止内存泄漏） */
  destroy: () => void;
}

// 6. 创建事件发射器（绑定原生ViewManager，确保事件通信）
const SplashAdEventEmitter = new NativeEventEmitter(NativeModules.CSJSplashAdViewManager);

// const SplashAdEventEmitter = (() => {
//   // 验证 NativeModules.CSJSplashAdViewManager 是否存在
//   console.log('[CSJSplashAd][事件发射器] 初始化验证：', {
//     CSJSplashAdViewManagerExists: !!NativeModules.CSJSplashAdViewManager,
//     allNativeModules: Object.keys(NativeModules), // 打印所有已注册的原生模块
//     timestamp: new Date().toLocaleTimeString()
//   });

//   // 若模块不存在，返回空对象并警告（避免崩溃）
//   if (!NativeModules.CSJSplashAdViewManager) {
//     console.error('[CSJSplashAd][事件发射器] 严重错误：NativeModules.CSJSplashAdViewManager 未注册！');
//     return {
//       addListener: () => ({ remove: () => {} }) // 空实现，避免调用崩溃
//     };
//   }

//   return new NativeEventEmitter(NativeModules.CSJSplashAdViewManager);
// })();

// 7. 使用forwardRef转发引用（解决函数组件无法直接使用ref的问题）
const CSJSplashAd = forwardRef<CSJSplashAdMethods, CSJSplashAdProps>(
  (props: CSJSplashAdProps, ref: ForwardedRef<CSJSplashAdMethods>) => {
    // 原生组件引用（绑定NativeCSJSplashAdView）
    const adRef = useRef<React.ElementRef<typeof NativeCSJSplashAdView> | null>(null);
    // 事件订阅引用（用于组件卸载时清理）
    const subscriptions = useRef<EmitterSubscription[]>([]);
    // 标记是否已打印过组件挂载成功日志（避免重复打印）
    const hasReportedMount = useRef<boolean>(false);

    // 解构组件属性并设置默认值
    const {
      adCodeId,
      timeout = 4000,
      onLoadSuccess = () => {},
      onRenderSuccess = () => {},
      onAdShow = () => {},
      onAdClick = () => {},
      onAdClose = () => {},
      onError = () => {},
      onForceGoMain = () => {},
      style
    } = props;

    // -------------------------- 核心：调用原生方法的通用函数（带全链路日志） --------------------------
    const callNativeMethod = useCallback((methodName: string, ...args: any[]) => {
      console.log('[CSJSplashAd][callNativeMethod] 触发原生方法调用', {
        methodName,
        args,
        adRefCurrent: adRef.current ? '存在（有效）' : 'null（无效）',
        timestamp: new Date().toLocaleTimeString()
      });

      // 1. 校验原生组件是否已挂载
      if (!adRef.current) {
        console.warn('[CSJSplashAd][callNativeMethod] 调用失败：原生组件未挂载（adRef.current为null）');
        return;
      }

      // 2. 获取组件的nodeHandle（RN识别原生组件的唯一标识）
      const nodeHandle = findNodeHandle(adRef.current);
      if (!nodeHandle) {
        console.warn('[CSJSplashAd][callNativeMethod] 调用失败：无法获取组件nodeHandle（组件未渲染）');
        return;
      }

      // 3. 校验原生ViewManager是否已注册（确保原生端已配置）
      const viewConfig = UIManager.getViewManagerConfig('CSJSplashAdView');

       // 打印所有已注册的原生方法
      console.log('[验证][已注册方法]', {
        methodNames: Object.keys(viewConfig.Commands || {}),
        commandMap: viewConfig.Commands
      });

      // 检查关键方法是否存在
    const requiredMethods = ['loadAd', 'destroy', 'onResume', 'onStop'];
    requiredMethods.forEach(method => {
      const hasMethod = viewConfig.Commands?.[method] !== undefined;
      console.log(`[验证][方法${hasMethod ? '存在' : '缺失'}]`, method);
    });

      if (!viewConfig) {
        console.warn('[CSJSplashAd][callNativeMethod] 调用失败：未找到CSJSplashAdView的ViewManager（原生未注册）');
        return;
      }

      // 4. 校验目标方法是否存在于原生ViewManager中
      const commandId = viewConfig.Commands?.[methodName];
      if (commandId === undefined) {
        console.warn('[CSJSplashAd][callNativeMethod] 调用失败：原生方法不存在', {
          methodName,
          availableCommands: viewConfig.Commands || '无可用方法',
          tip: '请检查原生SplashAdViewManager中是否有@ReactMethod注解的对应方法'
        });
        return;
      }

      // 5. 发送命令到原生，执行目标方法
      console.log('[CSJSplashAd][callNativeMethod] 调用成功：准备发送命令到原生', {
        methodName,
        commandId,
        nodeHandle,
        args
      });
      UIManager.dispatchViewManagerCommand(nodeHandle, commandId, args);
    }, []); // 无依赖：callNativeMethod引用不变，避免警告

    // -------------------------- 方案一核心：监听组件挂载状态（无依赖警告） --------------------------
    const checkComponentMount = useCallback(() => {
      // 仅在“未报告过挂载成功”且“组件已挂载”时打印日志
      if (!hasReportedMount.current && adRef.current) {
        console.log('[CSJSplashAd][组件挂载] 状态：NativeCSJSplashAdView 已成功挂载', {
          adRefCurrent: adRef.current,
          timestamp: new Date().toLocaleTimeString()
        });
        hasReportedMount.current = true; // 标记为已报告，防止重复打印
      }
    }, []); // 无依赖：adRef是Ref对象，引用不变；hasReportedMount是Ref内部值，不影响依赖

    // 执行挂载状态检查（组件挂载后立即执行 + 延迟补查）
    useEffect(() => {
      console.log('[CSJSplashAd][组件挂载] 开始初始化挂载检查');
      // 初始检查（组件挂载后第一时间执行）
      checkComponentMount();

      // 延迟100ms补查（应对极端慢挂载场景，如RN渲染队列拥挤）
      const delayCheckTimer = setTimeout(() => {
        if (!hasReportedMount.current) {
          console.warn('[CSJSplashAd][组件挂载] 补查：adRef.current 仍为 null（组件可能未挂载）', {
            timestamp: new Date().toLocaleTimeString(),
            tip: '若持续为null，检查原生ViewManager是否正确注册'
          });
        }
      }, 100);

      // 组件卸载时清理定时器
      return () => clearTimeout(delayCheckTimer);
    }, [checkComponentMount]); // 依赖checkComponentMount（函数引用不变，无警告）

    // -------------------------- 定义组件对外暴露的方法（用useMemo缓存） --------------------------
    const methods = useMemo<CSJSplashAdMethods>(() => ({
      onResume: () => callNativeMethod('onResume'),
      onStop: () => callNativeMethod('onStop'),
      destroy: () => callNativeMethod('destroy')
    }), [callNativeMethod]); // 依赖callNativeMethod（引用不变，无警告）

    // -------------------------- 将方法绑定到ref（供父组件调用） --------------------------
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          console.log('[CSJSplashAd][ref绑定] 类型：函数式ref，开始绑定方法');
          ref(methods);
        } else {
          console.log('[CSJSplashAd][ref绑定] 类型：对象式ref，开始绑定方法');
          ref.current = methods;
        }
        console.log('[CSJSplashAd][ref绑定] 结果：方法已成功绑定到ref', { methods });
      }
    }, [ref, methods]); // 依赖ref和methods（均为稳定引用，无警告）

    // -------------------------- 注册原生广告事件监听（与原生通信） --------------------------
    useEffect(() => {
      console.log('[CSJSplashAd][事件监听] 开始初始化原生事件订阅');
      subscriptions.current = [
        // 广告加载成功
        SplashAdEventEmitter.addListener('onSplashAdLoadSuccess', () => {
          console.log('[CSJSplashAd][事件] 收到：onSplashAdLoadSuccess（广告物料加载完成）');
          onLoadSuccess();
        }),
        // 广告渲染成功
        SplashAdEventEmitter.addListener('onSplashAdRenderSuccess', () => {
          console.log('[CSJSplashAd][事件] 收到：onSplashAdRenderSuccess（广告视图渲染完成）');
          onRenderSuccess();
        }),
        // 广告展示
        SplashAdEventEmitter.addListener('onSplashAdShow', () => {
          console.log('[CSJSplashAd][事件] 收到：onSplashAdShow（广告已展示给用户）');
          onAdShow();
        }),
        // 广告点击
        SplashAdEventEmitter.addListener('onSplashAdClick', () => {
          console.log('[CSJSplashAd][事件] 收到：onSplashAdClick（用户点击广告）');
          onAdClick();
        }),
        // 广告关闭
        SplashAdEventEmitter.addListener('onSplashAdClose', () => {
          console.log('[CSJSplashAd][事件] 收到：onSplashAdClose（广告关闭/跳过）');
          onAdClose();
        }),
        // 广告错误
        SplashAdEventEmitter.addListener(
          'onSplashAdError',
          () => {
            console.warn('[CSJSplashAd][事件] 收到：onSplashAdError（广告异常）');
            onError();
          }
        ),
        // 强制跳主界面
        SplashAdEventEmitter.addListener('onSplashAdForceGoMain', () => {
          console.log('[CSJSplashAd][事件] 收到：onSplashAdForceGoMain（生命周期触发强制跳转）');
          onForceGoMain();
        })
      ];

    }, [onLoadSuccess, onRenderSuccess, onAdShow, onAdClick, onAdClose, onError, onForceGoMain, callNativeMethod]);

    useEffect(() => {
      // 组件卸载时清理事件订阅 + 销毁广告
      return () => {
        console.log('[CSJSplashAd][事件监听] 开始清理原生事件订阅');
        subscriptions.current.forEach(sub => sub.remove());
        callNativeMethod('destroy'); // 确保广告资源释放
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // -------------------------- 加载开屏广告（核心业务逻辑） --------------------------
    useEffect(() => {
      console.log('[CSJSplashAd][加载广告] 开始触发广告加载逻辑', {
        adCodeId: adCodeId ? `已提供（${adCodeId}）` : '未提供（为空）',
        timeout: `${timeout}ms`,
        currentMountState: adRef.current ? '已挂载' : '未挂载'
      });

      // 1. 校验广告代码位ID是否有效
      if (!adCodeId || adCodeId.trim() === '') {
        const errorMsg = '广告加载失败：请提供有效的开屏广告代码位ID（adCodeId）';
        console.warn('[CSJSplashAd][加载广告] 校验失败：', errorMsg);
        onError();
        return;
      }

      // 2. 延迟300ms加载（确保原生组件完全挂载，避免adRef.current为null）
      const loadAdTimer = setTimeout(() => {
        // 加载前再检查一次挂载状态
        checkComponentMount();
        console.log('[CSJSplashAd][加载广告] 延迟加载：开始调用原生loadAd方法', {
          adCodeId,
          timeout,
          finalMountState: adRef.current ? '已挂载（可加载）' : '未挂载（加载可能失败）'
        });
        // 调用原生loadAd方法，传递广告ID和超时时间
        callNativeMethod('loadAd', adCodeId, timeout);
      }, 300);

      // 组件卸载时清理定时器
      return () => clearTimeout(loadAdTimer);
    }, [adCodeId, timeout, callNativeMethod, onError, checkComponentMount]);

    // -------------------------- 组件渲染（全屏广告容器） --------------------------
    return (
      <View
        style={[
          // 默认样式：全屏覆盖，zIndex最高（确保广告在最上层）
          {
            flex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: '#ffffff' // 背景色：避免广告加载前黑屏
          },
          // 用户自定义样式（优先级更高，可覆盖默认样式）
          style
        ]}
      >
        {/* 原生开屏广告组件 */}
        <NativeCSJSplashAdView
          ref={adRef} // 绑定组件引用，用于后续调用原生方法
          style={{ width: '100%', height: '100%' }} // 广告宽高：全屏（符合穿山甲要求）
        />
      </View>
    );
  }
);

// 8. 设置组件显示名称（便于RN DevTools调试）
CSJSplashAd.displayName = 'CSJSplashAd';

// 9. 导出组件（供外部使用）
export default CSJSplashAd;