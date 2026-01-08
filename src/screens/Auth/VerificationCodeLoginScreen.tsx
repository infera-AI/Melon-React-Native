import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from './AuthNavigator';
import { loginByVerificationCode } from '../../api/login/auth';
import { getDeviceInfoForAPI } from '../../utils/deviceInfo';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const newSize = based === 'height' ? size * screenHeight / 812 : size * screenWidth / 375;
  return Math.round(newSize);
};

const normalizeFontSize = (size: number) => {
  const newSize = size * screenWidth / 375;
  return Math.min(Math.round(newSize), size);
};

type VerificationCodeLoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'VerificationCodeLogin'>;

const VerificationCodeLoginScreen: React.FC = () => {
  const navigation = useNavigation<VerificationCodeLoginScreenNavigationProp>();
  const [authType, setAuthType] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAuthTypeChange = (type: 'email' | 'phone') => {
    setAuthType(type);
    setIdentifier('');
    setVerificationCode('');
  };

  const handleLogin = async () => {
    if (!identifier.trim()) {
      Alert.alert('提示', `请输入${authType === 'email' ? '邮箱地址' : '手机号码'}`);
      return;
    }

    if (!verificationCode.trim()) {
      Alert.alert('提示', '请输入验证码');
      return;
    }

    try {
      setIsLoading(true);

      // 获取设备信息
      const deviceInfo = getDeviceInfoForAPI();
      console.log('设备信息:', deviceInfo);

      const response = await loginByVerificationCode({
        auth_type: authType,
        identifier: identifier.trim(),
        verification_code: verificationCode.trim(),
        device_info: deviceInfo,
      });

      console.log('验证码登录成功:', response);
      
      // 保存登录token
      // await AsyncStorage.setItem('token', response.data.token);
      
      Alert.alert('成功', '登录成功！', [
        { 
          text: '确定', 
          onPress: () => {
            // 跳转到主页面
            // navigation.reset({
            //   index: 0,
            //   routes: [{ name: 'MainApp' }],
            // });
          }
        }
      ]);

    } catch (error) {
      console.error('验证码登录失败:', error);
      Alert.alert('失败', '登录失败，请检查验证码是否正确');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholder = () => {
    return authType === 'email' ? '请输入邮箱地址' : '请输入手机号码';
  };

  const getIdentifierLabel = () => {
    return authType === 'email' ? '邮箱地址' : '手机号码';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image 
            source={require('../../assets/main/page_return_icon.png')} 
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>验证码登录</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 登录方式选择 */}
        <View style={styles.authTypeContainer}>
          <TouchableOpacity 
            style={[
              styles.authTypeButton,
              authType === 'email' && styles.authTypeButtonActive
            ]}
            onPress={() => handleAuthTypeChange('email')}
          >
            <Text style={[
              styles.authTypeText,
              authType === 'email' && styles.authTypeTextActive
            ]}>
              邮箱登录
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.authTypeButton,
              authType === 'phone' && styles.authTypeButtonActive
            ]}
            onPress={() => handleAuthTypeChange('phone')}
          >
            <Text style={[
              styles.authTypeText,
              authType === 'phone' && styles.authTypeTextActive
            ]}>
              手机登录
            </Text>
          </TouchableOpacity>
        </View>

        {/* 输入表单 */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{getIdentifierLabel()}</Text>
            <TextInput
              style={styles.input}
              placeholder={getPlaceholder()}
              placeholderTextColor="rgba(176, 176, 176, 0.5)"
              value={identifier}
              onChangeText={setIdentifier}
              keyboardType={authType === 'email' ? 'email-address' : 'phone-pad'}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>验证码</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入验证码"
              placeholderTextColor="rgba(176, 176, 176, 0.5)"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
        </View>

        {/* 登录按钮 */}
        <TouchableOpacity 
          style={[
            styles.loginButton,
            isLoading && styles.loginButtonDisabled
          ]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={[
            styles.loginButtonText,
            isLoading && styles.loginButtonTextDisabled
          ]}>
            {isLoading ? '登录中...' : '登录'}
          </Text>
        </TouchableOpacity>

        {/* 其他选项 */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionText}>获取验证码</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionText}>密码登录</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
    paddingHorizontal: normalize(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(10),
    marginBottom: normalize(32),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: normalize(16),
    height: normalize(16),
  },
  headerSpacer: {
    width: normalize(40),
  },
  title: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  authTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    padding: normalize(4),
    marginBottom: normalize(32),
  },
  authTypeButton: {
    flex: 1,
    paddingVertical: normalize(12),
    alignItems: 'center',
    borderRadius: normalize(8),
  },
  authTypeButtonActive: {
    backgroundColor: '#85F380',
  },
  authTypeText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '500',
    color: '#B0B0B0',
  },
  authTypeTextActive: {
    color: '#000000',
  },
  formContainer: {
    marginBottom: normalize(32),
  },
  inputContainer: {
    marginBottom: normalize(20),
  },
  inputLabel: {
    fontSize: normalizeFontSize(14),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: normalize(8),
  },
  input: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    fontSize: normalizeFontSize(16),
    fontWeight: '400',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3E3E3E',
  },
  loginButton: {
    backgroundColor: '#85F380',
    borderRadius: normalize(12),
    paddingVertical: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(24),
  },
  loginButtonDisabled: {
    backgroundColor: '#3E3E3E',
    opacity: 0.5,
  },
  loginButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: 'rgba(12, 12, 13, 0.7)',
    letterSpacing: -0.4,
  },
  loginButtonTextDisabled: {
    color: '#B0B0B0',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    paddingVertical: normalize(8),
  },
  optionText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: '#85F380',
  },
});

export default VerificationCodeLoginScreen;