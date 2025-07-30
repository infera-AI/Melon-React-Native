import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import theme from '../../utils/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { modifyPassword } from '../../api/login';
import { useMessageModal } from '../../contexts/MessageModalContext';
import { MainAppStackParamList } from '../../navigation/MainAppNavigator';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const newSize = based === 'height' ? size * screenHeight / 812 : size * screenWidth / 375;
  return Math.round(newSize);
};
const normalizeFontSize = (size: number) => {
  const newSize = size * screenWidth / 375;
  return Math.min(Math.round(newSize), size);
};

type ResetPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainApp'>;

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const { t } = useLanguage();  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { show } = useMessageModal();
  const handleBack = () => {
    navigation.goBack();
  };

  const handleConfirm = async() => {
    setError('');
    // 验证密码长度和格式：6-20个字符，包含字母和数字
    if (password.length < 6 || password.length > 20) {
      setError(t('reset_password.password_requirements'));
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/.test(password)) {
      setError(t('reset_password.password_requirements'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('reset_password.password_mismatch'));
      return;
    }
    setIsSubmitting(true);
    // TODO: 提交新密码API
    try {
      const response = await modifyPassword({
        new_password: password,
        old_password: 'melon_password',
        confirm_password: confirmPassword,
      });
      console.log('resetPassword', response);
      navigation.navigate('MainApp', {
        screen: 'Translate',
      });
    } catch (error: any) {
      show({
        message: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1}} edges={['top','bottom','left','right']}>
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
          <Text style={styles.headerTitle}>{t('reset_password.title')}</Text>
          <View style={{ width: normalize(40) }} />
        </View>

        {/* 副标题 */}
        <Text style={styles.subtitle}>{t('reset_password.subtitle')}</Text>

        {/* 新密码输入框 */}
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder={t('reset_password.new_password_placeholder')}
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image 
              source={showPassword ? require('../../../src/assets/login/login_eye_icon.png') : require('../../../src/assets/login/login_eye_icon.png')} 
              style={styles.inputIcon} 
            />
          </TouchableOpacity>
        </View>
        {/* 密码要求提示 */}
        <Text style={styles.passwordTip}>{t('reset_password.password_requirements')}</Text>
        {/* 确认新密码输入框 */}
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder={t('reset_password.confirm_password_placeholder')}
            placeholderTextColor={theme.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Image 
              source={showConfirmPassword ? require('../../../src/assets/login/login_eye_icon.png') : require('../../../src/assets/login/login_eye_icon.png')} 
              style={styles.inputIcon} 
            />
          </TouchableOpacity>
        </View>
        {/* 错误提示 */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* 确认按钮 */}
        <TouchableOpacity
          style={[styles.confirmButton, password.length >= 6 && confirmPassword.length >= 6 ? styles.confirmButtonActive : null]}
          onPress={handleConfirm}
          disabled={isSubmitting || password.length < 6 || confirmPassword.length < 6}
        >
          <Text style={[styles.confirmButtonText, password.length >= 6 && confirmPassword.length >= 6 ?styles.confirmButtonTextActive:null]}>{t('reset_password.confirm')}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
    </SafeAreaView>
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
    width: normalize(16),
    height: normalize(16),
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
    fontSize: normalizeFontSize(16),
    color: theme.textPrimary,
    textAlign: 'left',
    marginTop: normalize(122, 'height'),
    marginBottom: normalize(44, 'height'),
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    marginBottom: normalize(16, 'height'),
    height: normalize(56, 'height'),
  },
  inputIcon: {
    width: normalize(24),
    height: normalize(24),
    marginRight: normalize(12),
  },
  input: {
    flex: 1,
    color: theme.textPrimary,
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    height: normalize(56, 'height'),
  },
  passwordTip: {
    fontSize: normalizeFontSize(13),
    color: theme.textSecondary,
    marginBottom: normalize(8, 'height'),
    marginLeft: normalize(4),
  },
  errorText: {
    fontSize: normalizeFontSize(13),
    color: theme.error,
    marginBottom: normalize(8, 'height'),
    marginLeft: normalize(4),
  },
  confirmButton: {
    width: '100%',
    height: normalize(56, 'height'),
    backgroundColor: theme.backgroundTertiary,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(54, 'height'),
  },
  confirmButtonActive: {
    backgroundColor: theme.primary,
  },
  confirmButtonText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: theme.textTertiary,
    textAlign: 'center',
  },
  confirmButtonTextActive: {
    color: theme.backgroundTertiary,
  },
});

export default ResetPasswordScreen;
