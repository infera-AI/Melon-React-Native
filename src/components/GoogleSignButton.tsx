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
import { GoogleAuth, GoogleAuthScopes } from 'react-native-google-auth';
import {authorize} from 'react-native-app-auth';
import { jwtDecode } from 'jwt-decode';
import { scaleSize } from '@/utils/scale';

export interface GoogleUser {
  id: string;
  email: string | null;
  name: string | null;
  photo?: string | null;
  familyName?: string | null;
  givenName?: string | null;
}

// 谷歌登录按钮的 Props 类型
interface GoogleSignInButtonProps {
  beforeClickCheck?: () => boolean;
  // 登录成功回调（返回用户信息和令牌）
  onSuccess?: (userId: string) => void;
  // 登录失败回调
  onError?: (error: Error) => void;
  // 登出成功回调
  onSignOut?: () => void;
}

const GoogleSignButton: React.FC<GoogleSignInButtonProps> = ({
  beforeClickCheck,
  onSuccess,
  onError,
  onSignOut,
}) => {
  // 状态：当前登录用户、是否加载中
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 海外Android谷歌登录客户端ID
  const MELONS_ANDROID_CLIENT_ID = '549484704507-4ai92ogl7pfo2hq6kdgvbescifih3rrt'

  // 2. 处理谷歌登录
  const handleSignIn = async () => {
    let isGoOn = true
    if (beforeClickCheck) {
      isGoOn = beforeClickCheck()
    }
    if (!isGoOn) {
      return
    }
    if (Platform.OS === 'ios') {
      try {
        await GoogleAuth.signOut();
        // 配置谷歌登录（替换为你的 Client ID）
        await GoogleAuth.configure({
          iosClientId: '549484704507-v1pbobq2bi9i3us0am468ivki12avb5k.apps.googleusercontent.com', // iOS Client ID
          androidClientId: `${MELONS_ANDROID_CLIENT_ID}.apps.googleusercontent.com`, // Android Client ID
          scopes: [GoogleAuthScopes.EMAIL, GoogleAuthScopes.PROFILE, GoogleAuthScopes.OPENID], // 基础权限
          // webClientId: '可选，用于后端验证（如果后端需要）',
        });
        const response: any = await GoogleAuth.signIn();
        console.log('response---', response);
        if (response?.data?.user?.id) {
          onSuccess && onSuccess(response?.data?.user?.id);
        }
        
        // if (response.type === 'success' && response.data) {
        //   const { user, idToken } = response.data;
        //   setCurrentUser(user);
        //   // 登录成功：通知父组件（传递用户信息和令牌）
        //   onSuccess && onSuccess({ user, idToken });
        //   Alert.alert('登录成功', `欢迎，${user.name}！`);
        // } else if (response.type === 'cancelled') {
        //   console.log('用户取消谷歌登录');
        //   // 无需调用 onError，用户主动取消属于正常流程
        // }
      } catch (error) {
        console.error('谷歌登录失败:', error);
      }
    } else {
      const config = {
        issuer: 'https://accounts.google.com',
        // clientId: '549484704507-t37fmo0vpr921sj93v6dlltajpmm6kem',
        clientId: MELONS_ANDROID_CLIENT_ID, // android
        redirectUrl: 'com.melon.melons:/oauth2redirect',
        scopes: ['openid', 'profile', 'email'],
        serviceConfiguration: {
          authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenEndpoint: 'https://oauth2.googleapis.com/token',
        },
        useNonce: true,
        usePKCE: true,
        skipCodeExchange: true
      };

      authorize(config).then(async (authResult) => {
        console.log('11111-----', authResult);
        if (!authResult.authorizationCode || !authResult.codeVerifier) {
          console.log('数据不完整');
          return
        }
        // 2. 用授权码交换令牌（包含idToken）
        const tokenResult = await exchangeCodeForGoogleToken(
          authResult.authorizationCode,
          authResult.codeVerifier
        );
        if (tokenResult?.sub) {
          onSuccess && onSuccess(tokenResult?.sub);
        }
        console.log('tokenResult---', tokenResult);
        
        
      }).catch((err) => {
        console.log('222222222---', err);
        
      })

    }
    
    
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
        body: `grant_type=authorization_code&code=${encodeURIComponent(authorizationCode)}&client_id=${encodeURIComponent(MELONS_ANDROID_CLIENT_ID)}&redirect_uri=${encodeURIComponent('com.melon.melons:/oauth2redirect')}&code_verifier=${encodeURIComponent(codeVerifier)}`,
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

  // 3. 处理谷歌登出
  const handleSignOut = async () => {

    try {
      await GoogleAuth.signOut();
      setCurrentUser(null);
      onSignOut && onSignOut();
      Alert.alert('登出成功');
    } catch (error) {
      console.error('谷歌登出失败:', error);
      Alert.alert('登出失败', (error as Error).message || '请稍后再试');
      onError && onError(error as Error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.btnStyle}
        onPress={handleSignIn}
      >
        <Image
          source={require('@/assets/login/google_icon.png')}
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

export default GoogleSignButton;