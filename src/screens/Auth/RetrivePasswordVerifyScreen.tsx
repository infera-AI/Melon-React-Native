import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Image,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../utils/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { normalize, normalizeFontSize } from '../../utils/stylesUtil';
import { AuthStackParamList } from './AuthNavigator';

import { useMessageModal } from '../../contexts/MessageModalContext';
import { verifyCode, getLoginCodeApi } from '../../api/login/auth';

type RetrivePasswordVerifyScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'RetrivePasswordVerify'>;

const CODE_LENGTH = 6;
const COUNTDOWN_SECONDS = 60;

const RetrivePasswordVerifyScreen: React.FC = ({ route }: any) => {
  const { type, email, phoneNumber, countryCode = "+86", actionToken } = route.params;
  const navigation = useNavigation<RetrivePasswordVerifyScreenNavigationProp>();
  const { t } = useLanguage();
  const { show } = useMessageModal();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, _setIsSubmitting] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // 从路由参数获取手机号信息和action_token
  const fullPhoneNumber = `${countryCode} ${phoneNumber}`;

  console.log('RetrivePasswordVerifyScreen', type, email, phoneNumber, countryCode, actionToken);

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

  const handleBack = () => {
    navigation.goBack();
  };

  // 输入处理
  const handleChange = (text: string, idx: number) => {
    if (!/^[0-9A-Za-z]*$/.test(text)) return; // 允许数字和字母
    const chars = text.split('');
    let newCode = [...code];
    if (chars.length === 1) {
      newCode[idx] = chars[0].toUpperCase(); // 转换为大写
      setCode(newCode);
      if (chars[0] && idx < CODE_LENGTH - 1) {
        inputRefs.current[idx + 1]?.focus();
      }
    } else if (chars.length === CODE_LENGTH) {
      // 粘贴6位
      setCode(chars.slice(0, CODE_LENGTH).map(char => char.toUpperCase()));
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
        const account = route.params?.type === 'phone' ? phoneNumber : email;
        const type = route.params?.type || 'phone';


        const params = {
          recipient_type: type, // 'phone' 或 'email'
          identifier: account,
          auth_purpose: 'forgot_password' as const, // 根据页面用途设置
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

  const handleSubmit = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== CODE_LENGTH) {
      show({
        message: t('bind_phone_verify.incomplete_code'),
      });
      return;
    }

    _setIsSubmitting(true);

    try {
      // 根据type判断是手机号还是邮箱验证
      if (type === 'email') {
        // 邮箱验证码验证逻辑
        const response = await verifyCode({
          identifier: email,
          verification_code: verificationCode,
          auth_purpose: 'forgot_password',
          recipient_type: 'email',
        });

        console.log('邮箱验证码验证成功:', response);

        show({
          message: t('bind_phone_verify.bind_success'),
        });

        // 绑定成功，跳转到成功页面
        navigation.navigate('RetriveResetPassword', {
          bindType: 'email',
          bindValue: email,
          actionToken: response.action_token,
        });
      } else {
        // 手机号验证码验证逻辑
        const response = await verifyCode({
          identifier: phoneNumber,
          verification_code: verificationCode,
          auth_purpose: 'forgot_password',
          recipient_type: 'phone',
        });

        console.log('手机验证码验证成功:', response);

        show({
          message: t('bind_phone_verify.bind_success'),
        });

        // 绑定成功，跳转到成功页面
        navigation.navigate('RetriveResetPassword', {
          bindType: 'phone',
          bindValue: phoneNumber,
          actionToken: response.action_token,
        });
      }

    } catch (error: any) {
      console.error('验证码验证失败:', error);
      show({
        message: error.message || t('bind_phone_verify.bind_failed'),
      });
    } finally {
      _setIsSubmitting(false);
    }
  };

  const isCodeComplete = code.every(char => char !== '');

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      accessible={false}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor={theme.background} />

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* 顶部返回和标题 */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Image
                  source={require('@/assets/main/page_return_icon.png')}
                  style={styles.backArrow}
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Enter confirmation code</Text>
              <View style={{ width: normalize(40) }} />
            </View>

            {/* 主要内容区域 */}
            <View style={styles.content}>
              {/* 提示文字 */}
              <Text style={styles.instructionText}>
                {type === 'phone' ? 'Verification code has been sent to your phone' : 'Verification code has been sent to the email'}
              </Text>

              {/* 手机号显示 */}
              <Text style={styles.phoneNumberText}>
                {type === 'phone' ? fullPhoneNumber : email}
              </Text>

              {/* 验证码输入框 */}
              <View style={styles.codeContainer}>
                {Array(CODE_LENGTH).fill(0).map((_, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={styles.codeInput}
                    value={code[index]}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    maxLength={1}
                    keyboardType="default"
                    autoCapitalize="characters"
                    textAlign="center"
                    selectionColor={theme.primary}
                  />
                ))}
              </View>

              {/* 提交按钮 */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isCodeComplete ? styles.submitButtonActive : null
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting || !isCodeComplete}
              >
                <Text style={[
                  styles.submitButtonText,
                  isCodeComplete ? styles.submitButtonTextActive : null
                ]}>
                  {isSubmitting ? 'Submitting...' : 'Next'}
                </Text>
              </TouchableOpacity>

              {/* 重新发送验证码 */}
              <View style={styles.resendContainer}>
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResend}
                  disabled={countdown > 0 || isResending}
                >
                  <Text style={[
                    styles.resendButtonText,
                    (countdown > 0 || isResending) && styles.resendButtonTextDisabled
                  ]}>
                    Get verification code again  {countdown > 0 && (
                      <Text style={styles.countdownText}>
                        {countdown}s
                      </Text>
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? normalize(44) : normalize(24),
    marginBottom: normalize(32),
    paddingHorizontal: normalize(24),
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
    width: normalize(16),
    height: normalize(16),
  },
  headerTitle: {
    flex: 1,
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: normalize(24),
    alignItems: 'flex-start',
  },
  instructionText: {
    width: normalize(300),
    fontSize: normalizeFontSize(24),
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'left',
    lineHeight: normalize(32),
    marginBottom: normalize(8),
  },
  phoneNumberText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: normalize(48),
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: normalize(48),
  },
  codeInput: {
    width: normalize(48),
    height: normalize(56),
    borderWidth: 1,
    borderColor: theme.backgroundSecondary,
    borderRadius: normalize(8),
    fontSize: normalizeFontSize(20),
    fontWeight: '700',
    color: theme.textPrimary,
    backgroundColor: theme.backgroundSecondary,
  },
  submitButton: {
    width: '100%',
    height: normalize(56),
    backgroundColor: theme.backgroundTertiary,
    borderRadius: normalize(28),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(32),
  },
  submitButtonActive: {
    backgroundColor: theme.primary,
  },
  submitButtonText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: theme.textTertiary,
    textAlign: 'center',
  },
  submitButtonTextActive: {
    color: theme.backgroundTertiary,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendButton: {
    width: '100%',
    height: normalize(56),
    backgroundColor: theme.background,
    borderRadius: normalize(28),
    borderWidth: 1,
    borderColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: theme.textPrimary,
  },
  resendButtonTextDisabled: {
    color: theme.textTertiary,
  },
  countdownText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: theme.textPrimary,
  },
});

export default RetrivePasswordVerifyScreen; 