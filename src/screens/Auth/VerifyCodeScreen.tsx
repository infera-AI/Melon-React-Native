import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from './AuthNavigator';
import theme from '../../utils/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLoginCodeApi, verifyCode } from '../../api/login/auth';
import { useMessageModal } from '../../contexts/MessageModalContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../../store';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const newSize = based === 'height' ? size * screenHeight / 812 : size * screenWidth / 375;
  return Math.round(newSize);
};
const normalizeFontSize = (size: number) => {
  const newSize = size * screenWidth / 375;
  return Math.min(Math.round(newSize), size);
};

type VerifyCodeScreenRouteProp = RouteProp<AuthStackParamList, 'VerifyCode'>;
type VerifyCodeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'VerifyCode'>;


const CODE_LENGTH = 6;
const COUNTDOWN_SECONDS = 60;

const VerifyCodeScreen: React.FC = () => {
  const navigation = useNavigation<VerifyCodeScreenNavigationProp>();
  const route = useRoute<VerifyCodeScreenRouteProp>();
  const { t } = useLanguage();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const { show } = useMessageModal();
  // 假设 route.params.account 传递手机号或邮箱
  const account = route.params?.account || '';
  const type = route.params?.type || 'phone';

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 自动聚焦第一个输入框
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // 输入处理
  const handleChange = (text: string, idx: number) => {
    if (!/^[0-9]*$/.test(text)) return;
    const chars = text.split('');
    let newCode = [...code];
    if (chars.length === 1) {
      newCode[idx] = chars[0];
      setCode(newCode);
      if (chars[0] && idx < CODE_LENGTH - 1) {
        inputRefs.current[idx + 1]?.focus();
      }
    } else if (chars.length === CODE_LENGTH) {
      // 粘贴6位
      setCode(chars.slice(0, CODE_LENGTH));
      inputRefs.current[CODE_LENGTH - 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (code[idx]) {
        // 当前格有内容，清空当前格
        const newCode = [...code];
        newCode[idx] = '';
        setCode(newCode);
      } else if (idx > 0) {
        // 当前格为空，回退到前一个格并清空
        inputRefs.current[idx - 1]?.focus();
        const newCode = [...code];
        newCode[idx - 1] = '';
        setCode(newCode);
      }
    }
  };

  const handleResend = async () => {
    if (countdown === 0 && !isResending) {
      setIsResending(true);
      
      try {
        // 从路由参数获取账户信息
        const account = route.params?.account || '';
        const type = route.params?.type || 'phone';
        
        const params = {
          recipient_type: type,
          identifier: account,
          auth_purpose: 'forgot_password' as const, // 根据实际用途调整
        };
        
        console.log('重新发送验证码参数:', params);
        
        const response = await getLoginCodeApi(params);
        console.log('验证码重新发送成功:', response);
        
        setCountdown(COUNTDOWN_SECONDS);
        
      } catch (error) {
        console.error('重新发送验证码失败:', error);
        // 这里可以添加错误提示
      } finally {
        setIsResending(false);
      }
    }
  };

  const handleConfirm = async () => {
      // 先测试跳转到重置密码页面
    if (code.join('').length === CODE_LENGTH && !isConfirming) {
      setIsConfirming(true);

      // 验证码校验API
      const params = {
        recipient_type: type,
        identifier: account,
        auth_purpose: 'register' as const, // 根据实际用途调整
        verification_code: code.join(''),
      };
      try {
        const response = await verifyCode(params);
        console.log('验证码校验API', response);
        //存储action_token
        AsyncStorage.setItem('action_token', response.action_token);
        useUserStore.getState().setToken(response.action_token);
        navigation.navigate('ResetPassword');
      } catch (error) {
        console.log('验证码校验API', error);    
        show({
          message: "Verification code is incorrect",
        });
      }finally{
        setIsConfirming(false);
      }
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleChangeAccount = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 顶部返回和标题 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image source={require('../../../src/assets/main/page_return_icon.png')} style={styles.backArrow} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('verify_code.title')}</Text>
          <View style={{ width: normalize(40) }} />
        </View>

        {/* 副标题 */}
        <Text style={styles.subtitle}>
        Verification code has been sent to your {type === 'phone' ? 'phone' : 'email'}
        </Text>
        <Text style={styles.accountText}> {account||'18888888888'} </Text>

        {/* 验证码输入框 */}
        <View style={styles.codeInputRow}>
          {Array(CODE_LENGTH)
            .fill(0)
            .map((_, idx) => (
              <TextInput
                key={idx}
                ref={(ref: TextInput | null) => { inputRefs.current[idx] = ref; }}
                style={[styles.codeInput, code[idx] ? styles.codeInputFilled : null]}
                keyboardType="number-pad"
                maxLength={1}
                value={code[idx]}
                onChangeText={text => handleChange(text, idx)}
                onKeyPress={e => handleKeyPress(e, idx)}
                returnKeyType="next"
                selectionColor={theme.primary}
                autoFocus={idx === 0}
              />
            ))}
        </View>

        {/* 确认按钮 */}
        <TouchableOpacity
          style={[styles.confirmButton, code.join('').length === CODE_LENGTH ? styles.confirmButtonActive : null]}
          onPress={handleConfirm}
          disabled={code.join('').length !== CODE_LENGTH || isConfirming}
        >
          <Text style={[styles.confirmButtonText, code.join('').length === CODE_LENGTH ?  null: styles.disableButtonText]}>Next</Text>
        </TouchableOpacity>

        {/* 验证码倒计时与重新获取 */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            countdown === 0 ? styles.confirmButtonActive : null,
            { marginTop: 0, marginBottom: normalize(32, 'height') }
          ]}
          onPress={handleResend}
          disabled={countdown > 0 || isResending}
        >
          {countdown > 0 ? (
            <Text style={[styles.confirmButtonText, styles.disableButtonText]}>
              {t('verify_code.resend')}       {countdown}s
            </Text>
          ) : (
            <Text style={styles.confirmButtonText}>
              {t('verify_code.resend')}
            </Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: normalize(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? normalize(44, 'height') : normalize(24, 'height'),
    marginBottom: normalize(32, 'height'),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: theme.backgroundTertiary,
    borderRadius: normalize(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    width: normalize(24),
    height: normalize(24),
  },
  headerTitle: {
    flex: 1,
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
    marginLeft: -normalize(40),
  },
  subtitle: {
    paddingHorizontal: normalize(10),
    fontSize: normalizeFontSize(24),
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'left',
    flexWrap: 'wrap',
    marginTop: normalize(73, 'height'),
    marginBottom: normalize(6, 'height'),
  },
  accountText: {
    paddingHorizontal: normalize(10),
    fontSize: normalizeFontSize(16),
    color: theme.textPrimary,
    fontWeight: '400',
  },
  codeInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(32, 'height'),
    paddingHorizontal: normalize(10),
    marginTop: normalize(41, 'height'),
  },
  codeInput: {
    width: normalize(44),
    height: normalize(56, 'height'),
    borderRadius: normalize(12),
    backgroundColor: theme.backgroundSecondary,
    color: theme.textPrimary,
    fontSize: normalizeFontSize(24),
    textAlign: 'center',
    marginHorizontal: normalize(4),
    borderWidth: 1,
    borderColor: theme.backgroundTertiary,
  },
  codeInputFilled: {
    borderColor: theme.primary,
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: normalize(32, 'height'),
  },
  resendText: {
    fontSize: normalizeFontSize(14),
    color: theme.textSecondary,
  },
  resendActive: {
    color: theme.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  confirmButton: {
    width: '100%',
    height: normalize(56, 'height'),
    backgroundColor: theme.backgroundTertiary,
    borderRadius: 50,
    borderColor: theme.primary,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(24, 'height'),
  },
  disableButtonText: {
    color: theme.textPrimary,
  },
  confirmButtonActive: {
    backgroundColor: theme.primary,
  },
  getCodeButtonActive: {
    backgroundColor: theme.backgroundSecondary,
  },
  confirmButtonText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: theme.backgroundTertiary,
    textAlign: 'center',
  },
  getCodeButtonText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(8, 'height'),
  },
  bottomText: {
    fontSize: normalizeFontSize(13),
    color: theme.textSecondary,
  },
  changeAccountText: {
    fontSize: normalizeFontSize(13),
    color: theme.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default VerifyCodeScreen;
