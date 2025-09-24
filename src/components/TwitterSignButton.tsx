import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ImageSourcePropType,
  Platform,
  Linking,
} from 'react-native';
import { authorize, revoke } from 'react-native-app-auth';
import { jwtDecode } from 'jwt-decode';
import { scaleSize } from '@/utils/scale';

// 谷歌登录按钮的 Props 类型
interface TwitterSignInButtonProps {
  beforeClickCheck?: () => boolean;
  startLoading?:() => void;
  // 登录成功回调（返回用户信息和令牌）
  onSuccess?: (userId: string) => void;
  // 登录失败回调
  onError?: () => void;
}

const TwitterSignButton: React.FC<TwitterSignInButtonProps> = ({
  beforeClickCheck,
  startLoading,
  onSuccess,
  onError,
}) => {

  // 海外推特应用ID
  const MELONS_CLIENT_ID = 'cWJOTFc5MEdVTjBsTFZ4NTc0ODk6MTpjaQ'

  // 2. 处理谷歌登录
  const handleSignIn = async () => {
    let isGoOn = true
    if (beforeClickCheck) {
      isGoOn = beforeClickCheck()
    }
    if (!isGoOn) {
      return
    }
    startLoading && startLoading()
    setTimeout(() => {
        const config = {
      issuer: 'https://x.com', // 对 PKCE 流程不是必须
      clientId: MELONS_CLIENT_ID,
      redirectUrl: Platform.OS === 'ios' ? 'com.sinobiz.melons://' : 'com.melon.melons://',
      scopes: ['users.email', 'users.read','tweet.read'], // 最少要有 tweet.read 和 users.read
      serviceConfiguration: {
        authorizationEndpoint: 'https://x.com/i/oauth2/authorize',
        tokenEndpoint: 'https://api.x.com/2/oauth2/token',
        revocationEndpoint: 'https://api.x.com/2/oauth2/revoke', // 可选：用于 logout/revoke
      },
      useNonce: true,
      usePKCE: true,
      // iosPrefersEphemeralSession: true
      // skipCodeExchange: true,
    };
    // await revoke(config, {tokenToRevoke: });


    authorize(config).then(async (authResult) => {
      console.log('11111-----', authResult);
      if (!authResult?.accessToken) {
        console.log('数据不完整');
        return
      }
      const r = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          Authorization: `Bearer ${authResult.accessToken}`
        },
      });
      const me = await r.json();
      console.log('推特用户数据----', me);
      if (me?.data?.id) {
        onSuccess && onSuccess(me?.data?.id);
      } else {
        onError && onError()
      }
      
      
    }).catch((err) => {
      console.log('222222222---', err);
      onError && onError()
    })
    }, 0)
    
    
    
  };

  const exchangeCodeForGoogleToken = async(authorizationCode: string, codeVerifier: string) => {
    // Google的Token端点固定为：https://oauth2.googleapis.com/token
    const tokenEndpoint = 'https://oauth2.googleapis.com/token';
    try {
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=authorization_code&code=${encodeURIComponent(authorizationCode)}&client_id=${encodeURIComponent(MELONS_APP_ID)}&redirect_uri=${encodeURIComponent('com.melon.melons:/oauth2redirect')}&code_verifier=${encodeURIComponent(codeVerifier)}`,
      });

      const tokenData = await response.json();

      console.log('解析前--', tokenData);
      if (tokenData?.id_token) {
        // 解析id_token为对象
        const decodedIdToken = jwtDecode(tokenData?.id_token);
        console.log('解析id_token-----', decodedIdToken);
        return decodedIdToken
      }

      // 处理Google返回的错误（如code无效、过期等）
      // if (!response.ok) {
      //   throw new Error(`Google令牌交换失败: ${tokenData.error_description || tokenData.error}`);
      // }

      return null;
    } catch (error) {
      console.error('Google令牌交换出错:', error);
      throw error;
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.btnStyle}
        onPress={handleSignIn}
      >
        <Image
          source={require('@/assets/login/twitter_icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

// 样式（贴合谷歌官方设计规范：蓝色背景、白色文字、Logo 居左）
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logo: {
    width: scaleSize(20),
    height: scaleSize(20),
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

export default TwitterSignButton;