import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { decode } from 'base-64';
import { jwtDecode } from 'jwt-decode';
import { appleAuth, AppleButton } from '@invertase/react-native-apple-authentication';
import { scaleFont, scaleSize } from '@/utils/scale';
import AwesomeIcons from 'react-native-vector-icons/FontAwesome';


//  polyfill for "atob"（jwtDecode 依赖）
global.atob = decode;

// 组件 props 类型（简洁版，保留核心回调）
interface AppleSignInButtonProps {
  beforeClickCheck?: () => boolean;
  onSuccess?: (userData: {
    userId: string;
    email: string;
    identityToken: string;
    nonce: string;
  }) => void;
  onError?: (error: Error) => void;
}

const AppleSignButton: React.FC<AppleSignInButtonProps> = ({
  beforeClickCheck,
  onSuccess,
  onError,
}) => {
  // 状态管理：设备是否支持苹果登录、用户凭证状态
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [credentialState, setCredentialState] = useState<any>('未知');
  // 用户信息（首次登录/后续登录通用）
  let userId = 'unknown';
  let userEmail = 'unknown';

  // 初始化：检查设备支持性 + 初始凭证状态
  useEffect(() => {
    const checkSupportAndCredentialState = async () => {
      try {
        // 1. 检查设备是否支持苹果登录（官方正确用法，无类型问题）
        const supported = appleAuth.isSupported;
        setIsSupported(supported);

        // 2. 若支持，校验已有凭证状态（如用户之前登录过）
        if (supported) {
          await fetchAndUpdateCredentialState();
        }
      } catch (error) {
        console.error('初始化失败:', error);
        onError && onError(error as Error);
      }
    };

    checkSupportAndCredentialState();
  }, [onError]);

  // 监听「凭证被吊销」事件（如用户在苹果设置中解绑应用）, 目前，app后台kill时， 在手机设置中取消登录授权， app再打开是拿不到回调的， 所以先不注册监听了
  // useEffect(() => {
  //   if (!isSupported) return;

  //   // 注册监听：当凭证被吊销时触发
  //   const unsubscribe = appleAuth.onCredentialRevoked(async () => {
  //     console.warn('用户苹果凭证已吊销');
  //     await fetchAndUpdateCredentialState();
  //     Alert.alert('登录失效', '你的苹果登录凭证已失效，请重新登录');
  //   });

  //   // 组件卸载时取消监听
  //   return () => unsubscribe();
  // }, [isSupported]);

  /**
   * 官方核心方法：获取并更新用户凭证状态
   * 状态值：AUTHORIZED（已授权）、REVOKED（已吊销）、NOT_FOUND（无凭证）
   */
  const fetchAndUpdateCredentialState = async () => {
    try {
      if (userId === 'unknown') {
        setCredentialState('用户未登录');
        return;
      }

      // 调用官方方法获取凭证状态
      const state = await appleAuth.getCredentialStateForUser(userId);
      setCredentialState(state);

      // 若凭证已吊销，触发错误回调
      if (state === appleAuth.State.REVOKED) {
        onError && onError(new Error('苹果登录凭证已吊销，请重新登录'));
      }
    } catch (error) {
      setCredentialState(`错误: ${(error as Error).message}`);
      onError && onError(error as Error);
    }
  };

  /**
   * 处理苹果登录（完全贴合官方流程）
   */
  const handleAppleSignIn = async () => {
    let isGoOn = true
    if (beforeClickCheck) {
      isGoOn = beforeClickCheck()
    }
    if (!isGoOn) {
      return
    }
    try {
      // 1. 发起苹果登录请求（官方枚举用法，无类型错误）
      const response = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN, // 登录操作
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME], // 请求邮箱、姓名权限
      });

      const {
        user: newUserId, // 用户唯一标识（永久不变）
        email: newUserEmail, // 首次登录返回，后续可能为 undefined
        identityToken, // JWT 身份令牌（传给后端校验）
        nonce, // 随机串（防重放攻击，需和后端一致）
        realUserStatus, // 真实用户校验（LIKELY_REAL 表示大概率真人）
      } = response;

      // 2. 更新用户信息（优先用 JWT 解码补全邮箱）
      userId = newUserId;
      // 首次登录用返回的 email，后续登录用 JWT 解码
      if (identityToken) {
        const decoded = jwtDecode(identityToken) as { email?: string };
        userEmail = newUserEmail || decoded.email || 'unknown';
      } else {
        userEmail = newUserEmail || 'unknown';
      }

      // 3. 校验真实用户状态（可选，防机器人）
      if (realUserStatus === appleAuth.UserStatus.LIKELY_REAL) {
        console.log('已确认：用户为真实用户');
      }

      // 4. 更新凭证状态 + 触发成功回调
      await fetchAndUpdateCredentialState();
      if (identityToken && nonce) {
        onSuccess && onSuccess({
          userId,
          email: userEmail,
          identityToken,
          nonce,
        });
        // Alert.alert('登录成功', `欢迎回来，${userEmail || '用户'}`);
      } else {
        console.log('未获取到身份令牌，登录失败');
        // throw new Error('');
      }

    } catch (error) {
      // 5. 错误处理（官方错误码用法）
      const err = error as Error & { code?: string };
      if (err.code === appleAuth.Error.CANCELED) {
        console.log('用户取消登录');
        return;
      }

      console.error('苹果登录失败:', err);
      // Alert.alert('登录失败', err.message || '请稍后再试');
      // onError && onError(err);
    }
  };

  // 设备不支持时，不渲染按钮
  if (!isSupported) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* 官方内置 AppleButton（符合苹果设计规范） */}
      {/* <AppleButton
        style={styles.appleButton}
        cornerRadius={8} // 圆角（建议 8px，符合苹果视觉规范）
        buttonStyle={AppleButton.Style.WHITE} // 黑色背景（可选：WHITE/WHITE_OUTLINE）
        buttonType={AppleButton.Type.SIGN_IN} // 按钮文字："Sign in with Apple"
        onPress={handleAppleSignIn}
      /> */}
      <TouchableOpacity
        onPress={handleAppleSignIn}
        style={styles.btnStyle}
      >
        <Text>
          <AwesomeIcons
            name='apple'
            color={'#000'}
            size={scaleFont(18)}
          />
        </Text>

      </TouchableOpacity>

      {/* 可选：显示当前凭证状态（调试用，正式环境可隐藏） */}
      {/* <Text style={styles.stateText}>凭证状态：{credentialState}</Text> */}
    </View>
  );
};

// 样式（贴合官方示例，简洁规范）
const styles = StyleSheet.create({
  container: {
    alignItems: 'center', // 按钮居中
  },
  appleButton: {
    width: 160, // 官方建议宽度：280px（适配大部分屏幕）
    height: 56, // 官方建议高度：56px（触摸友好）
  },
  unsupportedContainer: {
    alignItems: 'center',
    padding: 16,
  },
  unsupportedText: {
    color: '#666',
    fontSize: 14,
  },
  stateText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
  btnStyle: {
    width: scaleSize(36),
    height: scaleSize(36),
    borderRadius: '50%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppleSignButton;