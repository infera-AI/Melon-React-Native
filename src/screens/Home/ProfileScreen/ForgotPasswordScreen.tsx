import React, { useState, useRef, useEffect } from 'react';
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
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../../utils/theme';
import { useLanguage } from '../../../contexts/LanguageContext';
import { normalize, normalizeFontSize } from '../../../utils/stylesUtil';
import { ProfileStackParamList } from './ProfileNavigator';
import { getLoginCodeApi, verifyCode } from '../../../api/login';
import { useMessageModal } from '../../../contexts/MessageModalContext';
import { forgotPasswordReset } from '../../../api/profile/profile';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ForgotPassword'>;

type Step = 1 | 2 | 3;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { t } = useLanguage();
  const { show } = useMessageModal();
  
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [actionToken, setActionToken] = useState('');

  const codeInputRef = useRef<TextInput>(null);
  const newPasswordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
      setError('');
    } else {
      navigation.goBack();
    }
  };

  // 验证邮箱或手机号格式
  const validateEmailOrPhone = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-()]+$/;
    
    if (emailRegex.test(value)) {
      return 'email';
    } else if (phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10) {
      return 'phone';
    }
    return null;
  };

  // 步骤1：发送验证码
  const handleSendVerificationCode = async () => {
    setError('');
    
    if (!emailOrPhone.trim()) {
      setError(t('forgot_password.email_or_phone_required'));
      return;
    }

    const type = validateEmailOrPhone(emailOrPhone);
    if (!type) {
      setError(t('forgot_password.invalid_email_format'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      await getLoginCodeApi({
        recipient_type: type,
        identifier: emailOrPhone.trim(),
        auth_purpose: 'forgot_password'
      });
      
      show({ message: t('forgot_password.code_sent_success') });
      setCountdown(60);
      setCurrentStep(2);      
    } catch (error: any) {
      console.error('发送验证码失败:', error);
      setError(error.message || t('forgot_password.code_sent_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 步骤2：验证验证码
  const handleVerifyCode = async () => {
    setError('');
    
    if (!verificationCode.trim()) {
      setError(t('forgot_password.verification_code_required'));
      return;
    }

    if (verificationCode.length !== 6) {
      setError(t('forgot_password.incomplete_verification_code'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      const type = validateEmailOrPhone(emailOrPhone);
      const response = await verifyCode({
        recipient_type: type!,
        identifier: emailOrPhone.trim(),
        verification_code: verificationCode.trim(),
        auth_purpose: 'forgot_password'
      });
      setActionToken(response.action_token);
      show({ message: t('forgot_password.verification_success') });
      setCurrentStep(3);
      
    } catch (error: any) {
      console.error('验证码验证失败:', error);
      setError(error.message || t('forgot_password.verification_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 步骤3：重置密码
  const handleResetPassword = async () => {
    setError('');
    
    if (!newPassword.trim()) {
      setError(t('forgot_password.new_password_required'));
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 20) {
      setError(t('forgot_password.password_requirements'));
      return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/.test(newPassword)) {
      setError(t('forgot_password.password_requirements'));
      return;
    }

    if (!confirmPassword.trim()) {
      setError(t('forgot_password.confirm_password_required'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('forgot_password.password_mismatch'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      const type = validateEmailOrPhone(emailOrPhone);
      
      // 使用新的忘记密码重设接口
      await forgotPasswordReset({
        action_token: actionToken, // 这里需要从验证步骤获取
        auth_type: type!,
        identifier: emailOrPhone.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      show({ message: t('forgot_password.reset_success') });
      
      // 密码重置成功，返回上一页
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
      
    } catch (error: any) {
      console.error('密码重置失败:', error);
      setError(error.message || t('forgot_password.reset_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepContainer}>
        <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
          <Text style={[styles.stepNumber, currentStep >= 1 && styles.stepNumberActive]}>1</Text>
        </View>
        <Text style={[styles.stepText, currentStep >= 1 && styles.stepTextActive]}>
          {t('forgot_password.step_1')}
        </Text>
      </View>
      <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
      <View style={styles.stepContainer}>
        <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
          <Text style={[styles.stepNumber, currentStep >= 2 && styles.stepNumberActive]}>2</Text>
        </View>
        <Text style={[styles.stepText, currentStep >= 2 && styles.stepTextActive]}>
          {t('forgot_password.step_2')}
        </Text>
      </View>
      <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />
      <View style={styles.stepContainer}>
        <View style={[styles.stepCircle, currentStep >= 3 && styles.stepCircleActive]}>
          <Text style={[styles.stepNumber, currentStep >= 3 && styles.stepNumberActive]}>3</Text>
        </View>
        <Text style={[styles.stepText, currentStep >= 3 && styles.stepTextActive]}>
          {t('forgot_password.step_3')}
        </Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.inputLabel}>{t('forgot_password.email_or_phone')}</Text>
      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder={t('forgot_password.email_or_phone_placeholder')}
          placeholderTextColor={theme.textSecondary}
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={handleSendVerificationCode}
        />
      </View>
      
      <TouchableOpacity
        style={[
          styles.primaryButton,
          emailOrPhone.trim() ? styles.primaryButtonActive : null
        ]}
        onPress={handleSendVerificationCode}
        disabled={isSubmitting || !emailOrPhone.trim()}
      >
        <Text style={[
          styles.primaryButtonText,
          emailOrPhone.trim() ? styles.primaryButtonTextActive : null
        ]}>
          {isSubmitting ? t('forgot_password.sending') : t('forgot_password.send_verification_code')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.inputLabel}>{t('forgot_password.verification_code')}</Text>
      <View style={styles.inputBox}>
        <TextInput
          ref={codeInputRef}
          style={styles.input}
          placeholder={t('forgot_password.verification_code_placeholder')}
          placeholderTextColor={theme.textSecondary}
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="number-pad"
          maxLength={6}
          returnKeyType="next"
          onSubmitEditing={handleVerifyCode}
        />
      </View>
      
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>
          {t('forgot_password.verification_code_placeholder')}
        </Text>
        {countdown > 0 ? (
          <Text style={styles.countdownText}>{countdown}s</Text>
        ) : (
          <TouchableOpacity onPress={handleSendVerificationCode} disabled={isSubmitting}>
            <Text style={styles.resendButtonText}>{t('forgot_password.resend_code')}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity
        style={[
          styles.primaryButton,
          verificationCode.length === 6 ? styles.primaryButtonActive : null
        ]}
        onPress={handleVerifyCode}
        disabled={isSubmitting || verificationCode.length !== 6}
      >
        <Text style={[
          styles.primaryButtonText,
          verificationCode.length === 6 ? styles.primaryButtonTextActive : null
        ]}>
          {isSubmitting ? t('forgot_password.verifying') : t('forgot_password.verify')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>{t('forgot_password.new_password')}</Text>
        <View style={styles.inputBox}>
          <TextInput
            ref={newPasswordInputRef}
            style={styles.input}
            placeholder={t('forgot_password.new_password_placeholder')}
            placeholderTextColor={theme.textSecondary}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
          />
          <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
            <Image 
              source={require('../../../assets/login/login_eye_icon.png')} 
              style={styles.inputIcon} 
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.passwordTip}>
          {t('forgot_password.password_requirements')}
        </Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>{t('forgot_password.confirm_password')}</Text>
        <View style={styles.inputBox}>
          <TextInput
            ref={confirmPasswordInputRef}
            style={styles.input}
            placeholder={t('forgot_password.confirm_password_placeholder')}
            placeholderTextColor={theme.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            returnKeyType="done"
            onSubmitEditing={handleResetPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Image 
              source={require('../../../assets/login/login_eye_icon.png')} 
              style={styles.inputIcon} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.primaryButton,
          newPassword.length >= 6 && confirmPassword.length >= 6 && newPassword === confirmPassword 
            ? styles.primaryButtonActive : null
        ]}
        onPress={handleResetPassword}
        disabled={isSubmitting || newPassword.length < 6 || confirmPassword.length < 6 || newPassword !== confirmPassword}
      >
        <Text style={[
          styles.primaryButtonText,
          newPassword.length >= 6 && confirmPassword.length >= 6 && newPassword === confirmPassword 
            ? styles.primaryButtonTextActive : null
        ]}>
          {isSubmitting ? t('forgot_password.resetting') : t('forgot_password.reset_password')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.background} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 顶部返回和标题 */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Image 
                  source={require('../../../assets/main/page_return_icon.png')} 
                  style={styles.backArrow} 
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t('forgot_password.title')}</Text>
              <View style={{ width: normalize(40) }} />
            </View>

            {/* 步骤指示器 */}
            {renderStepIndicator()}

            {/* 说明文字 */}
            <Text style={styles.subtitle}>
              {t('forgot_password.subtitle')}
            </Text>

            {/* 错误提示 */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* 步骤内容 */}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingHorizontal: normalize(24),
    paddingBottom: normalize(40),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? normalize(44) : normalize(24),
    marginBottom: normalize(32),
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(32),
    paddingHorizontal: normalize(20),
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: theme.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(8),
  },
  stepCircleActive: {
    backgroundColor: theme.primary,
  },
  stepNumber: {
    fontSize: normalizeFontSize(14),
    fontWeight: '600',
    color: theme.textSecondary,
  },
  stepNumberActive: {
    color: theme.background,
  },
  stepText: {
    fontSize: normalizeFontSize(12),
    color: theme.textSecondary,
    textAlign: 'center',
  },
  stepTextActive: {
    color: theme.textPrimary,
  },
  stepLine: {
    flex: 1,
    height: normalize(2),
    backgroundColor: theme.backgroundTertiary,
    marginHorizontal: normalize(8),
  },
  stepLineActive: {
    backgroundColor: theme.primary,
  },
  subtitle: {
    fontSize: normalizeFontSize(16),
    color: theme.textPrimary,
    textAlign: 'left',
    marginBottom: normalize(32),
    lineHeight: normalizeFontSize(24),
  },
  stepContent: {
    flex: 1,
  },
  inputSection: {
    marginBottom: normalize(24),
  },
  inputLabel: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: normalize(12),
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    height: normalize(56),
  },
  input: {
    flex: 1,
    color: theme.textPrimary,
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    height: normalize(56),
  },
  inputIcon: {
    width: normalize(24),
    height: normalize(24),
  },
  passwordTip: {
    fontSize: normalizeFontSize(13),
    color: theme.textSecondary,
    marginTop: normalize(8),
    marginLeft: normalize(4),
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(24),
  },
  resendText: {
    fontSize: normalizeFontSize(14),
    color: theme.textSecondary,
  },
  countdownText: {
    fontSize: normalizeFontSize(14),
    color: theme.primary,
    fontWeight: '600',
  },
  resendButtonText: {
    fontSize: normalizeFontSize(14),
    color: theme.primary,
    fontWeight: '600',
  },
  errorText: {
    fontSize: normalizeFontSize(13),
    color: theme.error,
    marginBottom: normalize(16),
    marginLeft: normalize(4),
  },
  primaryButton: {
    width: '100%',
    height: normalize(56),
    backgroundColor: theme.backgroundTertiary,
    borderRadius: normalize(28),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(32),
  },
  primaryButtonActive: {
    backgroundColor: theme.primary,
  },
  primaryButtonText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: theme.textTertiary,
    textAlign: 'center',
  },
  primaryButtonTextActive: {
    color: theme.backgroundTertiary,
  },
});

export default ForgotPasswordScreen; 