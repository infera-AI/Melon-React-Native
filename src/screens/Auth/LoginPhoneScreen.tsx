import React, { useState, useEffect } from 'react';
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
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from './AuthNavigator';
import theme from '../../utils/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { getDeviceInfo } from '../../utils';
import { loginWithDevice } from '../../api/login';
import { useUserStore } from '../../store';
import { useMessageModal } from '../../contexts/MessageModalContext';
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

// type LoginPhoneScreenNavigationProp = StackNavigationProp<any, 'MainApp'>;

// 国家数据
const countries = [
  { name: 'China', code: '+86', flag: require('../../../assets/images/flag_cn.png') },
  { name: 'United States', code: '+1', flag: require('../../../assets/images/flag_usuk.png') },
  { name: 'Germany', code: '+49', flag: require('../../../assets/images/flag_de.png') },
  { name: 'Spain', code: '+34', flag: require('../../../assets/images/flag_es.png') },
  { name: 'France', code: '+33', flag: require('../../../assets/images/flag_fr.png') },
  { name: 'Japan', code: '+81', flag: require('../../../assets/images/flag_jp.png') },
];

const LoginPhoneScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { show } = useMessageModal();
  useEffect(() => {
    console.log('showCountryModal changed:', showCountryModal);
  }, [showCountryModal]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCountrySelect = (country: typeof countries[0]) => {
    setSelectedCountry(country);
    setShowCountryModal(false);
  };

  const handleTabSwitch = (tab: 'phone' | 'email') => {
    setActiveTab(tab);
    // 切换时清空输入框
    setPhoneNumber('');
    setEmail('');
    setPassword('');
  };

  const handleLogin = async () => {
    let account = '';
    if (activeTab === 'phone' && !phoneNumber) {
      account = phoneNumber;
      return;
    }
    if (activeTab === 'email' && !email) {
      account = email;   
      return;
    }
    if (!password) {
      return;
    }

     // 获取当前设备的真实信息
     const deviceInfo = getDeviceInfo();
     console.log('deviceInfo', deviceInfo);
     try{
       // 调用登录接口并传入当前设备的真实信息
       const loginResult = await loginWithDevice({
        auth_type: activeTab,
        identifier: account,
        password: "melon_password", // 默认临时密码
        device_info: deviceInfo
      });
      if (loginResult) {
        // 保存登录返回的token到
        console.log('注册并登录成功:', loginResult);
       // 保存token到zustand
       useUserStore.getState().setToken(loginResult.token);
        // 跳转到密码设置页面
        navigation.navigate('MainApp', {
          screen: 'Translate',
        });
      } else {
        show({
         message: "login failed",
       });
      }
          } catch (error:any) {
       show({
         message: `登录失败: ${error.message || '未知错误'}`,
       });
      }
    setIsSubmitting(true);
    // TODO: 登录API
    setTimeout(() => {
      setIsSubmitting(false);
      // 登录成功后跳转
    }, 1000);
  };

  const handleForgotPassword = () => {
    navigation.navigate('LoginWithCode');
  };

  return (
    <SafeAreaView style={{flex: 1}} edges={['top','bottom','left','right']}>
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      {/* 国家选择模态框 - 使用 View 模拟 Modal */}
      {showCountryModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('login_phone.select_country')}</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.countryList}>
              {countries.map((country, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.countryItem}
                  onPress={() => handleCountrySelect(country)}
                >
                  {/* <Image source={country.flag} style={styles.countryItemFlag} /> */}
                  <Text style={styles.countryItemName}>{country.name}</Text>
                  <Text style={styles.countryItemCode}>{country.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
      {/* 主体内容 */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 顶部返回和标题 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image source={require('../../../src/assets/main/page_return_icon.png')} style={styles.backArrow} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('login_phone.title')}</Text>
          <View style={{ width: normalize(40) }} />
        </View>

        {/* 标签切换 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={styles.tabButton} 
            onPress={() => handleTabSwitch('phone')}
          >
            <Text style={activeTab === 'phone' ? styles.activeTab : styles.inactiveTab}>
              {t('login_phone.phone_number')}
            </Text>
            {activeTab === 'phone' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tabButton} 
            onPress={() => handleTabSwitch('email')}
          >
            <Text style={activeTab === 'email' ? styles.activeTab : styles.inactiveTab}>
              {t('login_phone.e_mail')}
            </Text>
            {activeTab === 'email' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* 手机号登录 */}
        {activeTab === 'phone' && (
          <>
            {/* 国家选择 */}
            <TouchableOpacity 
              style={styles.countrySelector} 
              onPress={() => {
                console.log('Country selector pressed, setting showCountryModal to true');
                setShowCountryModal(true);
              }}
            >
              <Image source={require('../../../src/assets/login/login_area_icon.png')} style={styles.inputIcon} />
              <Text style={styles.countryName}>{selectedCountry.name}</Text>
              <Text style={styles.countryCode}>{selectedCountry.code}</Text>
              <Image source={require('../../../src/assets/main/dropdown_icon.png')} style={styles.dropdownArrow} />
            </TouchableOpacity>

            {/* 手机号输入框 */}
            <View style={styles.inputBox}>
              <Image source={require('../../../src/assets/login/login_phone_icon.png')} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('login_phone.phone_placeholder')}
                placeholderTextColor={theme.textSecondary}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          </>
        )}

        {/* 邮箱登录 */}
        {activeTab === 'email' && (
          <View style={styles.inputBox}>
            <Image source={require('../../../src/assets/login/login_email_icon.png')} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('login_phone.email_placeholder')}
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        )}

        {/* 密码输入框 */}
        <View style={styles.inputBox}>
          <Image source={require('../../../src/assets/login/login_lock_icon.png')} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('login_phone.password_placeholder')}
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* 登录按钮 */}
        <TouchableOpacity
          style={[
            styles.loginButton, 
            ((activeTab === 'phone' && phoneNumber) || (activeTab === 'email' && email)) && password 
              ? styles.loginButtonActive 
              : null
          ]}
          onPress={handleLogin}
          disabled={
            (activeTab === 'phone' && !phoneNumber) || 
            (activeTab === 'email' && !email) || 
            !password || 
            isSubmitting
          }
        >
          <Text style={[styles.loginButtonText,((activeTab === 'phone' && phoneNumber) || (activeTab === 'email' && email)) && password 
             ?styles.loginButtonTextActive:null]}>{t('login_phone.log_in')}</Text>
        </TouchableOpacity>

        {/* 忘记密码链接 */}
        <View style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot your password? </Text>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordLink}>Log in with verification code</Text>
          </TouchableOpacity>
        </View>
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
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: normalize(32, 'height'),
    marginTop: normalize(109, 'height'),
  },
  tabButton: {
    alignItems: 'center',
    marginRight: normalize(20),
  },
  activeTab: {
    fontSize: normalizeFontSize(24),
    fontWeight: '700',
    color: theme.textPrimary,
    marginRight: normalize(20),
  },
  inactiveTab: {
    fontSize: normalizeFontSize(14),
    fontWeight: '300',
    color: theme.textPrimary,
  },
  tabIndicator: {
    width: normalize(8),
    height: normalize(8),
    backgroundColor: theme.primary,
    borderRadius: normalize(4),
    marginRight: normalize(20),
    marginTop: normalize(8, 'height'),
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(16),
    marginBottom: normalize(16, 'height'),
  },
  countryFlag: {
    width: normalize(24),
    height: normalize(24),
    marginRight: normalize(12),
  },
  countryName: {
    flex: 1,
    fontSize: normalizeFontSize(15),
    color: theme.textPrimary,
    fontWeight: '400',
  },
  dropdownArrow: {
    width: normalize(11),
    height: normalize(6),
    marginLeft: normalize(12),
  },
  countryCode: {
    fontSize: normalizeFontSize(15),
    color: theme.textPrimary,
    fontWeight: '400',
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
    textAlignVertical: 'center',
    paddingVertical: 0,
    height: '100%',
    includeFontPadding: false,
  },
  loginButton: {
    width: '100%',
    height: normalize(56, 'height'),
    backgroundColor: theme.backgroundTertiary,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(44, 'height'),
    opacity: 0.7,
  },
  loginButtonActive: {
    backgroundColor: theme.primary,
    opacity: 1,
  },
  loginButtonText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
  },
  loginButtonTextActive: {
    color: theme.backgroundTertiary,
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(16, 'height'),
  },
  forgotPasswordText: {
    fontSize: normalizeFontSize(13),
    color: theme.textSecondary,
    textAlign: 'center',
  },
  forgotPasswordLink: {
    fontSize: normalizeFontSize(13),
    color: theme.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: theme.backgroundSecondary,
    borderTopLeftRadius: normalize(20),
    borderTopRightRadius: normalize(20),
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.backgroundTertiary,
  },
  modalTitle: {
    fontSize: normalizeFontSize(18),
    fontWeight: '600',
    color: theme.textPrimary,
  },
  modalClose: {
    fontSize: normalizeFontSize(20),
    color: theme.textSecondary,
  },
  countryList: {
    maxHeight: normalize(400, 'height'),
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.backgroundTertiary,
  },
  countryItemFlag: {
    width: normalize(24),
    height: normalize(24),
    marginRight: normalize(12),
  },
  countryItemName: {
    flex: 1,
    fontSize: normalizeFontSize(16),
    color: theme.textPrimary,
  },
  countryItemCode: {
    fontSize: normalizeFontSize(16),
    color: theme.textSecondary,
  },
});

export default LoginPhoneScreen;
