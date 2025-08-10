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
import theme from '../../utils/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { getDeviceInfo } from '../../utils';
import { loginWithDevice } from '../../api/login';
import { useUserStore } from '../../store';
import { useMessageModal } from '../../contexts/MessageModalContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserInfo } from '../../api/profile/profile';
import { normalize,normalizeFontSize } from '@/utils/stylesUtil';


// type LoginPhoneScreenNavigationProp = StackNavigationProp<any, 'MainApp'>;

// 国家数据
// 国家数据
const countries = [
  { id: 'en', name: 'English', code: '+1', flag: '🇺🇸' },
  { id: 'zh', name: 'Chinese', code: '+86', flag: '🇨🇳' },
  { id: 'es', name: 'Spanish', code: '+34', flag: '🇪🇸' },
  { id: 'fr', name: 'French', code: '+33', flag: '🇫🇷' },
  { id: 'ar', name: 'Arabic', code: '+966', flag: '🇸🇦' },
  { id: 'ru', name: 'Russian', code: '+7', flag: '🇷🇺' },
  { id: 'de', name: 'German', code: '+49', flag: '🇩🇪' },
  { id: 'ja', name: 'Japanese', code: '+81', flag: '🇯🇵' },
  { id: 'pt', name: 'Portuguese', code: '+351', flag: '🇵🇹' },
  { id: 'hi', name: 'Hindi', code: '+91', flag: '🇮🇳' },
  { id: 'bn', name: 'Bengali', code: '+880', flag: '🇧🇩' },
  { id: 'ur', name: 'Urdu', code: '+92', flag: '🇵🇰' },
  { id: 'id', name: 'Indonesian', code: '+62', flag: '🇮🇩' },
  { id: 'pa', name: 'Punjabi', code: '+91', flag: '🇮🇳' },
  { id: 'ms', name: 'Malay', code: '+60', flag: '🇲🇾' },
  { id: 'ko', name: 'Korean', code: '+82', flag: '🇰🇷' },
  { id: 'it', name: 'Italian', code: '+39', flag: '🇮🇹' },
  { id: 'nl', name: 'Dutch', code: '+31', flag: '🇳🇱' },
  { id: 'tr', name: 'Turkish', code: '+90', flag: '🇹🇷' },
  { id: 'vi', name: 'Vietnamese', code: '+84', flag: '🇻🇳' },
  { id: 'th', name: 'Thai', code: '+66', flag: '🇹🇭' },
  { id: 'pl', name: 'Polish', code: '+48', flag: '🇵🇱' },
  { id: 'uk', name: 'Ukrainian', code: '+380', flag: '🇺🇦' },
  { id: 'fa', name: 'Persian', code: '+98', flag: '🇮🇷' },
  { id: 'sw', name: 'Swahili', code: '+255', flag: '🇹🇿' },
  { id: 'el', name: 'Greek', code: '+30', flag: '🇬🇷' },
  { id: 'hu', name: 'Hungarian', code: '+36', flag: '🇭🇺' },
  { id: 'sv', name: 'Swedish', code: '+46', flag: '🇸🇪' },
  { id: 'da', name: 'Danish', code: '+45', flag: '🇩🇰' },
  { id: 'no', name: 'Norwegian', code: '+47', flag: '🇳🇴' },
  { id: 'fi', name: 'Finnish', code: '+358', flag: '🇫🇮' },
  { id: 'cs', name: 'Czech', code: '+420', flag: '🇨🇿' },
  { id: 'ro', name: 'Romanian', code: '+40', flag: '🇷🇴' },
  { id: 'he', name: 'Hebrew', code: '+972', flag: '🇮🇱' },
  { id: 'af', name: 'Afrikaans', code: '+27', flag: '🇿🇦' },
  { id: 'sq', name: 'Albanian', code: '+355', flag: '🇦🇱' },
  { id: 'am', name: 'Amharic', code: '+251', flag: '🇪🇹' },
  { id: 'hy', name: 'Armenian', code: '+374', flag: '🇦🇲' },
  { id: 'az', name: 'Azerbaijani', code: '+994', flag: '🇦🇿' },
  { id: 'eu', name: 'Basque', code: '+34', flag: '🇪🇸' },
  { id: 'be', name: 'Belarusian', code: '+375', flag: '🇧🇾' },
  { id: 'bs', name: 'Bosnian', code: '+387', flag: '🇧🇦' },
  { id: 'bg', name: 'Bulgarian', code: '+359', flag: '🇧🇬' },
  { id: 'ca', name: 'Catalan', code: '+34', flag: '🇪🇸' },
  { id: 'hr', name: 'Croatian', code: '+385', flag: '🇭🇷' },
  { id: 'et', name: 'Estonian', code: '+372', flag: '🇪🇪' },
  { id: 'fo', name: 'Faroese', code: '+298', flag: '🇫🇴' },
  { id: 'fy', name: 'Frisian', code: '+31', flag: '🇳🇱' },
  { id: 'gl', name: 'Galician', code: '+34', flag: '🇪🇸' },
  { id: 'ka', name: 'Georgian', code: '+995', flag: '🇬🇪' },
  { id: 'gu', name: 'Gujarati', code: '+91', flag: '🇮🇳' },
  { id: 'ht', name: 'Haitian Creole', code: '+509', flag: '🇭🇹' },
  { id: 'ha', name: 'Hausa', code: '+234', flag: '����' },
  { id: 'haw', name: 'Hawaiian', code: '+1', flag: '🇺🇸' },
  { id: 'is', name: 'Icelandic', code: '+354', flag: '🇮🇸' },
  { id: 'ig', name: 'Igbo', code: '+234', flag: '🇳🇬' },
  { id: 'ga', name: 'Irish', code: '+353', flag: '🇮🇪' },
  { id: 'jw', name: 'Javanese', code: '+62', flag: '🇮🇩' },
  { id: 'kn', name: 'Kannada', code: '+91', flag: '🇮🇳' },
  { id: 'kk', name: 'Kazakh', code: '+7', flag: '🇰🇿' },
  { id: 'km', name: 'Khmer', code: '+855', flag: '🇰🇭' },
  { id: 'rw', name: 'Kinyarwanda', code: '+250', flag: '🇷🇼' },
  { id: 'ku', name: 'Kurdish', code: '+964', flag: '🇮🇶' },
  { id: 'ky', name: 'Kyrgyz', code: '+996', flag: '🇰🇬' },
  { id: 'lo', name: 'Lao', code: '+856', flag: '🇱🇦' },
  { id: 'la', name: 'Latin', code: '+39', flag: '🇻🇦' },
  { id: 'lv', name: 'Latvian', code: '+371', flag: '🇱🇻' },
  { id: 'lt', name: 'Lithuanian', code: '+370', flag: '🇱🇹' },
  { id: 'lb', name: 'Luxembourgish', code: '+352', flag: '🇱🇺' },
  { id: 'mk', name: 'Macedonian', code: '+389', flag: '🇲🇰' },
  { id: 'mg', name: 'Malagasy', code: '+261', flag: '🇲🇬' },
  { id: 'ml', name: 'Malayalam', code: '+91', flag: '🇮🇳' },
  { id: 'mt', name: 'Maltese', code: '+356', flag: '🇲🇹' },
  { id: 'mi', name: 'Maori', code: '+64', flag: '🇳🇿' },
  { id: 'mr', name: 'Marathi', code: '+91', flag: '🇮🇳' },
  { id: 'mn', name: 'Mongolian', code: '+976', flag: '🇲🇳' },
  { id: 'my', name: 'Burmese', code: '+95', flag: '🇲🇲' },
  { id: 'ne', name: 'Nepali', code: '+977', flag: '🇳🇵' },
  { id: 'or', name: 'Odia', code: '+91', flag: '🇮🇳' },
  { id: 'ps', name: 'Pashto', code: '+93', flag: '🇦🇫' },
  { id: 'sm', name: 'Samoan', code: '+685', flag: '🇼🇸' },
  { id: 'gd', name: 'Scottish Gaelic', code: '+44', flag: '🇬🇧' },
  { id: 'sr', name: 'Serbian', code: '+381', flag: '🇷🇸' },
  { id: 'st', name: 'Sesotho', code: '+266', flag: '🇱🇸' },
  { id: 'sn', name: 'Shona', code: '+263', flag: '🇿🇼' },
  { id: 'sd', name: 'Sindhi', code: '+92', flag: '🇵🇰' },
  { id: 'si', name: 'Sinhala', code: '+94', flag: '🇱🇰' },
  { id: 'sk', name: 'Slovak', code: '+421', flag: '🇸🇰' },
  { id: 'sl', name: 'Slovenian', code: '+386', flag: '🇸🇮' },
  { id: 'so', name: 'Somali', code: '+252', flag: '🇸🇴' },
  { id: 'su', name: 'Sundanese', code: '+62', flag: '🇮🇩' },
  { id: 'tg', name: 'Tajik', code: '+992', flag: '🇹🇯' },
  { id: 'ta', name: 'Tamil', code: '+91', flag: '🇮🇳' },
  { id: 'te', name: 'Telugu', code: '+91', flag: '🇮🇳' },
  { id: 'uz', name: 'Uzbek', code: '+998', flag: '🇺🇿' },
  { id: 'cy', name: 'Welsh', code: '+44', flag: '🇬🇧' },
  { id: 'xh', name: 'Xhosa', code: '+27', flag: '🇿🇦' },
  { id: 'yi', name: 'Yiddish', code: '+972', flag: '🇮🇱' },
  { id: 'yo', name: 'Yoruba', code: '+234', flag: '🇳🇬' },
  { id: 'zu', name: 'Zulu', code: '+27', flag: '����' }
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

  const getUserInfoRequest = async () => {
    const res = await getUserInfo({});
    console.log('UserInfo', res);
    if(res.data){
      useUserStore.getState().setUserInfo(res.data);
    }
  }

  const handleLogin = async () => {
    if (activeTab === 'phone' && !phoneNumber) {
      return;
    }
    if (activeTab === 'email' && !email) {
      return;
    }
    if (!password) {
      return;
    }
    console.log('account',phoneNumber,email,password);

     // 获取当前设备的真实信息
     const deviceInfo = getDeviceInfo();
     console.log('deviceInfo', deviceInfo);
     try{
       // 调用登录接口并传入当前设备的真实信息
       const loginResult = await loginWithDevice({
        auth_type: activeTab,
        identifier: activeTab === 'phone'?phoneNumber:email,
        password: password, 
        device_info: deviceInfo
      });
      if (loginResult) {
        // 保存登录返回的token到
        console.log('登录成功:', loginResult);
       // 保存token到zustand
       useUserStore.getState().setToken(loginResult.token);
       getUserInfoRequest();
        // 跳转到首页
        navigation.reset({index: 0, routes: [{name: 'MainApp'}]})
      } else {
        show({
         message: t('verify_code.login_failed'),
       });
      }
      } catch (error:any) {
        console.log('error', error);
       show({
         message: `${t('verify_code.login_failed')}: ${error.message || t('common.unknown_error')}`,
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
                  <Text style={styles.countryItemFlag}>{country.flag}</Text>
                  <Text style={styles.countryItemName}>{t(`languageNames.${country.id}`)}</Text>
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
              <Text style={styles.countryName}>{t(`languageNames.${selectedCountry.id}`)}</Text>
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
          <Text style={styles.forgotPasswordText}>{t('login_phone.forgot_password')} </Text>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordLink}>{t('login_phone.forgot_password_link')}</Text>
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
    marginTop: Platform.OS === 'ios' ? normalize(44) : normalize(24),
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
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: normalize(32),
    marginTop: normalize(109),
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
    marginTop: normalize(8),
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(16),
    marginBottom: normalize(16),
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
    marginBottom: normalize(16),
    height: normalize(56),
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
    height: normalize(56),
    backgroundColor: theme.backgroundTertiary,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(44),
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
    marginTop: normalize(16),
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
    maxHeight: normalize(400),
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
    fontSize: normalizeFontSize(20),
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
