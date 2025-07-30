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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';
import { verifyIdentityByPassword } from '../../../api/profile/profile';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const newSize = based === 'height' ? size * screenHeight / 812 : size * screenWidth / 375;
  return Math.round(newSize);
};

const normalizeFontSize = (size: number) => {
  const newSize = size * screenWidth / 375;
  return Math.min(Math.round(newSize), size);
};

type PasswordVerificationScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'PasswordVerification'>;

const PasswordVerificationScreen: React.FC = () => {
  const navigation = useNavigation<PasswordVerificationScreenNavigationProp>();
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleVerifyPassword = async () => {
    if (!password.trim()) {
      Alert.alert('提示', '请输入密码');
      return;
    }

    try {
      setIsVerifying(true);
      
      const response = await verifyIdentityByPassword({
        password: password.trim()
      });

      console.log('密码认证成功:', response);
      Alert.alert('成功', '密码认证成功！', [
        { text: '确定', onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      console.error('密码认证失败:', error);
      Alert.alert('失败', '密码认证失败，请检查密码是否正确');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image 
            source={require('../../../assets/main/page_return_icon.png')} 
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>密码认证</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.description}>
          请输入您的密码以验证身份
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>密码</Text>
          <TextInput
            style={styles.passwordInput}
            placeholder="请输入密码"
            placeholderTextColor="rgba(176, 176, 176, 0.5)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.verifyButton,
            isVerifying && styles.verifyButtonDisabled
          ]} 
          onPress={handleVerifyPassword}
          disabled={isVerifying}
        >
          <Text style={[
            styles.verifyButtonText,
            isVerifying && styles.verifyButtonTextDisabled
          ]}>
            {isVerifying ? '验证中...' : '验证密码'}
          </Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: normalizeFontSize(16),
    fontWeight: '400',
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: normalize(32),
    lineHeight: normalize(24),
  },
  inputContainer: {
    width: '100%',
    marginBottom: normalize(24),
  },
  inputLabel: {
    fontSize: normalizeFontSize(14),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: normalize(8),
  },
  passwordInput: {
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
  verifyButton: {
    backgroundColor: '#85F380',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(32),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: normalize(200),
  },
  verifyButtonDisabled: {
    backgroundColor: '#3E3E3E',
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: 'rgba(12, 12, 13, 0.7)',
    letterSpacing: -0.4,
  },
  verifyButtonTextDisabled: {
    color: '#B0B0B0',
  },
});

export default PasswordVerificationScreen;