import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from './AuthNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';

type ThirdPartyLoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ThirdPartyLogin'>;

const ThirdPartyLoginScreen: React.FC = () => {
  const navigation = useNavigation<ThirdPartyLoginScreenNavigationProp>();
  const { t } = useLanguage();
  const { text, textSecondary, bg } = useGlobalTheme();
  const [email, setEmail] = useState('');
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLogin = () => {
    if (!email.trim()) {
      // 显示错误提示
      return;
    }
    if (!isAgreementChecked) {
      // 显示需要同意协议的提示
      return;
    }
    // 处理登录逻辑
    console.log('登录邮箱:', email);
  };

  const handleThirdPartyLogin = (platform: string) => {
    console.log('第三方登录:', platform);
    // 处理第三方登录逻辑
  };

  const handleAgreementToggle = () => {
    setIsAgreementChecked(!isAgreementChecked);
  };

  const handleUserAgreement = () => {
    navigation.navigate('UserServiceAgreement');
  };

  const handlePrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* 顶部导航栏 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image 
              source={require('@/assets/main/page_return_icon.png')} 
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Register Melon account</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* 邮箱输入框 */}
        <View style={styles.inputContainer}>
          <Image 
            source={require('@/assets/login/login_email_icon.png')} 
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={'Email'}
            placeholderTextColor="#B0B0B0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* 登录按钮 */}
        <TouchableOpacity 
          style={[
            styles.loginButton,
            email.trim() && isAgreementChecked && styles.loginButtonActive
          ]} 
          onPress={handleLogin}
          disabled={!email.trim() || !isAgreementChecked}
        >
          <Text style={[
            styles.loginButtonText,
            email.trim() && isAgreementChecked && styles.loginButtonTextActive
          ]}>
            Send verification code
          </Text>
        </TouchableOpacity>
        {/* 第三方登录按钮 */}
        <TouchableOpacity 
          style={styles.thirdPartyButton} 
          onPress={() => handleThirdPartyLogin('apple')}
        >
          <View style={styles.thirdPartyButtonContent}>
            <Image 
              source={require('@/assets/login/google_login_icon.png')} 
              style={styles.thirdPartyIcon}
            />
            <Text style={styles.thirdPartyButtonText}>sign in with Google</Text>
          </View>
        </TouchableOpacity>
           {/* 用户协议 */}
           <View style={styles.agreementContainer}>
          <TouchableOpacity 
            style={styles.checkbox} 
            onPress={handleAgreementToggle}
          >
            {isAgreementChecked && (
              <View style={styles.checkboxChecked} />
            )}
          </TouchableOpacity>
          <View style={styles.agreementText}>
            <Text style={styles.agreementTextNormal}>
             I have read and agree to the
            </Text>
            <TouchableOpacity onPress={handleUserAgreement}>
              <Text style={styles.agreementTextLink}>
              User Agreement
              </Text>
            </TouchableOpacity>
            <Text style={styles.agreementTextNormal}>
              and
            </Text>
            <TouchableOpacity onPress={handlePrivacyPolicy}>
              <Text style={styles.agreementTextLink}>
               and Privacy Policy. 
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 其他第三方登录选项 */}
        <View style={styles.thirdPartyOptions}>
        <TouchableOpacity 
            style={styles.thirdPartyOption} 
            onPress={() => handleThirdPartyLogin('google')}
          >
            <View style={styles.googleIcon}>
              <Image 
                source={require('@/assets/login/apple_login_icon.png')} 
                style={styles.socialIcon}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.thirdPartyOption} 
            onPress={() => handleThirdPartyLogin('facebook')}
          >
            <View style={styles.facebookIcon}>
              <Image 
                source={require('@/assets/login/facebook_login_icon.png')} 
                style={styles.socialIcon}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.thirdPartyOption} 
            onPress={() => handleThirdPartyLogin('instagram')}
          >
            <View style={styles.instagramIcon}>
              <Image 
                source={require('@/assets/login/instagram_login_icon.png')} 
                style={styles.socialIcon}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.thirdPartyOption} 
            onPress={() => handleThirdPartyLogin('instagram')}
          >
            <View style={styles.xIcon}>
              <Image 
                source={require('@/assets/login/x_login_icon.png')} 
                style={styles.socialIcon}
              />
            </View>
          </TouchableOpacity>
        </View>

       
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(38),
    paddingTop: normalize(17),
    paddingBottom: normalize(5),
  },
  statusBarTime: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
  },
  signalIcon: {
    width: normalize(17),
    height: normalize(11),
    backgroundColor: '#FFFFFF',
  },
  wifiIcon: {
    width: normalize(16),
    height: normalize(11),
    backgroundColor: '#FFFFFF',
  },
  batteryIcon: {
    width: normalize(25),
    height: normalize(12),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(24),
    marginTop: normalize(17),
    marginBottom: normalize(108),
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
  headerTitle: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    height: normalize(56),
    marginHorizontal: normalize(24),
    marginBottom: normalize(48),
  },
  inputIcon: {
    width: normalize(20),
    height: normalize(18),
    marginLeft: normalize(18),
    marginRight: normalize(14),
  },
  input: {
    flex: 1,
    fontSize: normalizeFontSize(15),
    height: normalize(56),
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  loginButton: {
    backgroundColor: 'rgba(133, 243, 128, 0.8)',
    borderRadius: normalize(50),
    height: normalize(74),
    marginHorizontal: normalize(24),
    marginBottom: normalize(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonActive: {
    backgroundColor: 'rgba(133, 243, 128, 1)',
  },
  loginButtonText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#3E3E3E',
    letterSpacing: -0.4,
  },
  loginButtonTextActive: {
    color: '#3E3E3E',
  },
  thirdPartyButton: {
    borderWidth: 1,
    borderColor: '#85F380',
    borderRadius: normalize(50),
    height: normalize(74),
    marginHorizontal: normalize(24),
    marginBottom: normalize(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  thirdPartyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thirdPartyIcon: {
    width: normalize(24),
    height: normalize(24),
    marginRight: normalize(8),
  },
  thirdPartyButtonText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  thirdPartyOptions: {
    position: 'absolute',
    width: '100%',
    bottom: normalize(24),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thirdPartyOption: {
    marginHorizontal: normalize(15),
  },
  facebookIcon: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#3379DF',
    borderRadius: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  instagramIcon: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#E4007F',
    borderRadius: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  xIcon: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#000000',
    borderRadius: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: normalize(20),
    height: normalize(20),
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: normalize(24),
    marginBottom: normalize(20),
  },
  checkbox: {
    width: normalize(12),
    height: normalize(12),
    borderWidth: 1,
    borderColor: '#B0B0B0',
    borderRadius: normalize(4),
    marginTop: normalize(4),
    marginRight: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: normalize(6),
    height: normalize(6),
    backgroundColor: '#85F380',
    borderRadius: normalize(2),
  },
  agreementText: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  agreementTextNormal: {
    fontSize: normalizeFontSize(13),
    color: '#B0B0B0',
    letterSpacing: -0.4,
    lineHeight: normalize(18),
  },
  agreementTextLink: {
    fontSize: normalizeFontSize(13),
    color: '#85F380',
    letterSpacing: -0.4,
    lineHeight: normalize(18),
  },
});

export default ThirdPartyLoginScreen;
