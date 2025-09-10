import React, { useState } from 'react';
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
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../../utils/theme';
import { useLanguage } from '../../../contexts/LanguageContext';
import { normalize, normalizeFontSize } from '../../../utils/stylesUtil';
import { AuthStackParamList } from '../../../navigation/AuthNavigator';
import { modifyPassword } from '../../../api/login';
import { useMessageModal } from '../../../contexts/MessageModalContext';

type ResetPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const { show } = useMessageModal();
  const { t } = useLanguage();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleComplete = async () => {
    setError('');

    // 验证原密码
    if (!oldPassword.trim()) {
      setError('Please enter the original password');
      return;
    }

    // 验证新密码长度和格式：6-20个字符，包含字母和数字
    if (newPassword.length < 6 || newPassword.length > 20) {
      setError('6-20 characters, including letters and numbers');
      return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/.test(newPassword)) {
      setError('Please enter a password between 6 and 20 characters');
      return;
    }

    // 验证确认密码
    if (newPassword !== confirmPassword) {
      setError('The passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      // 调用修改密码API
      const response = await modifyPassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      console.log('修改密码成功:', response);

      // 显示成功消息
      show({
        message: 'Password updated successfully',
      });
      navigation.goBack();
    } catch (error: any) {
      console.error('修改密码失败:', error);
      setError(error.message || 'Password update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('Auth', { screen: 'RetrivePassword' });
  };

  const isFormValid = oldPassword.trim() &&
    newPassword.length >= 6 &&
    confirmPassword.length >= 6 &&
    newPassword === confirmPassword;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
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
                  source={require('@/assets/main/page_return_icon.png')}
                  style={styles.backArrow}
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Change Password</Text>
              <View style={{ width: normalize(40) }} />
            </View>

            {/* 说明文字 */}
            <Text style={styles.subtitle}>
              Please set a secure login password for your Melon account.
            </Text>

            {/* 原密码输入框 */}
            <View style={styles.inputSection}>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder={"Please enter the original password"}
                  placeholderTextColor={theme.textSecondary}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry={!showOldPassword}
                />
                <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                  <Image
                    source={!showOldPassword ? require('@/assets/login/login_eye_icon.png') : require('@/assets/login/login_eyeshow_icon.png')}
                    style={styles.inputIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 新密码输入框 */}
            <View style={styles.inputSection}>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder={'Please enter your password'}
                  placeholderTextColor={theme.textSecondary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Image
                    source={showNewPassword ? require('@/assets/login/login_eyeshow_icon.png') : require('@/assets/login/login_eye_icon.png')}
                    style={styles.inputIcon}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.passwordTip}>
                Please enter a password between 6 and 20 characters
              </Text>
            </View>

            {/* 确认新密码输入框 */}
            <View style={styles.inputSection}>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder={'Re-enter new password'}
                  placeholderTextColor={theme.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Image
                    source={showConfirmPassword ? require('@/assets/login/login_eyeshow_icon.png') : require('@/assets/login/login_eye_icon.png')}
                    style={styles.inputIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 错误提示 */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* 完成修改按钮 */}
            <TouchableOpacity
              style={[
                styles.completeButton,
                isFormValid ? styles.completeButtonActive : null
              ]}
              onPress={handleComplete}
              disabled={isSubmitting || !isFormValid}
            >
              <Text style={[
                styles.completeButtonText,
                isFormValid ? styles.completeButtonTextActive : null
              ]}>
                {isSubmitting ? 'Updating...' : 'Complete modifications'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>{t('login_phone.forgot_password')} </Text>
            </TouchableOpacity>
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
  subtitle: {
    width: normalize(320),
    fontSize: normalizeFontSize(24),
    color: theme.textPrimary,
    fontWeight: '700',
    textAlign: 'left',
    lineHeight: normalize(32),
    marginBottom: normalize(40),
    marginTop: normalize(40),
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
  errorText: {
    fontSize: normalizeFontSize(13),
    color: theme.error,
    marginBottom: normalize(16),
    marginLeft: normalize(4),
  },
  completeButton: {
    width: '100%',
    height: normalize(56),
    backgroundColor: theme.backgroundTertiary,
    borderRadius: normalize(28),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(32),
  },
  completeButtonActive: {
    backgroundColor: theme.primary,
  },
  completeButtonText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: theme.textTertiary,
    textAlign: 'center',
  },
  completeButtonTextActive: {
    color: theme.backgroundTertiary,
  },
  forgotPasswordText: {
    fontSize: normalizeFontSize(13),
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: normalize(16),
  },
});

export default ResetPasswordScreen;
