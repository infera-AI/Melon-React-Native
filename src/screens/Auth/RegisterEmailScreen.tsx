import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from './AuthNavigator';
import theme from '../../utils/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLoginCodeApi } from '../../api/login/auth';
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

type RegisterEmailScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'RegisterEmail'>;

// 国家数据
const countries = [
  { id: 'us', name: 'United States', code: '+1', flag: '🇺🇸' },
  { id: 'cn', name: 'China', code: '+86', flag: '🇨🇳' },
  { id: 'de', name: 'Germany', code: '+49', flag: '🇩🇪' },
  { id: 'es', name: 'Spain', code: '+34', flag: '🇪🇸' },
  { id: 'fr', name: 'France', code: '+33', flag: '🇫🇷' },
  { id: 'jp', name: 'Japan', code: '+81', flag: '🇯🇵' },
  { id: 'kr', name: 'South Korea', code: '+82', flag: '🇰🇷' },
  { id: 'uk', name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
];

const RegisterEmailScreen: React.FC = () => {
  const navigation = useNavigation<RegisterEmailScreenNavigationProp>();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, _setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('phone');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const { show } = useMessageModal();
  const handleBack = () => {
    navigation.goBack();
  };

  const handleRegister = async () => {
    // 检查是否填写了手机号或邮箱
    if (activeTab === 'phone' && !phone.trim()) {
      show({
        message: "Please enter your phone number",
      });
      return;
    }
    if (activeTab === 'email' && !email.trim()) {
      show({
        message: "Please enter your email",
      });
      return;
    }

    if (!agreementChecked) {
      show({
        message: t('register.please_agree'),
      });
      return;
    }

    try {
      let identifier = '';
      let recipientType = '';

      if (activeTab === 'phone') {
        const countryInfo = getSelectedCountryInfo();
        identifier = phone;
        recipientType = 'phone';
        
        console.log('注册信息:', {
          type: 'phone',
          country: countryInfo.country.name,
          countryCode: countryInfo.country.code,
          phoneNumber: countryInfo.fullPhoneNumber,
          password,
          agreementChecked,
        });
      } else {
        identifier = email;
        recipientType = 'email';
        
        console.log('注册信息:', {
          type: 'email',
          email,
          password,
          agreementChecked,
        });
      }

      // 调用发送验证码API
      const params = {
        recipient_type: recipientType,
        identifier: identifier,
        auth_purpose: 'register' as const,
      };

      console.log('发送验证码参数:', params);
      
      const response = await getLoginCodeApi(params);
      console.log('验证码发送成功:', response);

      // 发送成功后跳转到验证码输入页面
      navigation.navigate('VerifyCode', { 
        account: identifier,
        type: activeTab 
      });

    } catch (error) {
      console.error('发送验证码失败:', error);
      // 这里可以添加错误提示
    }
  };

  const handleTabChange = (tab: 'email' | 'phone') => {
    setActiveTab(tab);
  };

  const handleUserAgreement = () => {
    navigation.navigate('UserServiceAgreement');
  };
  const handlePrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const handleCountrySelect = () => {
    setShowCountryModal(true);
  };

  const handleCountryChange = (country: typeof countries[0]) => {
    setSelectedCountry(country);
    setShowCountryModal(false);
  };

  const handleCloseModal = () => {
    setShowCountryModal(false);
  };

  const handleAgreementToggle = () => {
    setAgreementChecked(!agreementChecked);
  };

  // 获取当前选择的国家信息
  const getSelectedCountryInfo = () => {
    return {
      country: selectedCountry,
      fullPhoneNumber: selectedCountry.code + phone,
    };
  };

  return (
    <SafeAreaView style={{flex: 1}} edges={['top','bottom','left','right']}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.background} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* 顶部Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Image source={require('../../../src/assets/main/page_return_icon.png')} style={styles.backArrow} />
            </TouchableOpacity>
                      <Text style={styles.headerTitle}>{t('register.register_melon_account')}</Text>
            <View style={{ width: normalize(40) }} />
          </View>

          {/* Tab切换 */}
          <View style={styles.tabRow}>
            <TouchableOpacity onPress={() => handleTabChange('phone')}>
              <View style={styles.tabItem}>
                              <Text style={[styles.tabText, activeTab === 'phone' && styles.tabTextActive]}>
                  {t('register.phone_number')}
                </Text>
                {activeTab === 'phone' && <View style={styles.tabDot} />}
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleTabChange('email')}>
              <View style={styles.tabItem}>
                              <Text style={[styles.tabText, activeTab === 'email' && styles.tabTextActive]}>
                  {t('register.e_mail')}
                </Text>
                {activeTab === 'email' && <View style={styles.tabDot} />}
              </View>
            </TouchableOpacity>
          </View>

          {/* 输入区域 */}
          <View style={styles.inputArea}>
            {activeTab === 'email' ? (
                          <>
                {/* 邮箱输入框 */}
                <View style={styles.inputBox}>
                  <Image source={require('../../../src/assets/login/login_email_icon.png')} style={styles.inputIcon} />
                                  <TextInput
                    style={styles.input}
                    placeholder={t('register.email_placeholder')}
                    placeholderTextColor={theme.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </>
            ) : (
              <>
                {/* 国家选择框 */}
                <View style={styles.inputBox}>
                  <TouchableOpacity style={styles.countrySelector} onPress={handleCountrySelect}>
                    <View style={styles.locationIcon}>
                      <Image source={require('../../../src/assets/login/login_area_icon.png')} style={styles.locationIcon} />
                    </View>
                    <Text style={styles.areaText}>
                      {selectedCountry.name} ({selectedCountry.code})
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* 手机号输入框 */}
                <View style={styles.inputBox}>
                  <Image source={require('../../../src/assets/login/login_phone_icon.png')} style={styles.inputIcon} />
                                  <TextInput
                    style={styles.input}
                    placeholder={t('register.phone_placeholder')}
                    placeholderTextColor={theme.textSecondary}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            )}
          </View>

          {/* 注册按钮 */}
                  <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>{t('register.send_verification_code')}</Text>
          </TouchableOpacity>

            {/* 协议提示 */}
          <View style={styles.agreementContainer}>
            <TouchableOpacity style={styles.checkboxContainer} onPress={handleAgreementToggle}>
              <View style={[styles.checkbox, agreementChecked && styles.checkboxChecked]}>
                {agreementChecked && <Text style={styles.checkmarkText}>✓</Text>}
              </View>
            </TouchableOpacity>
                        <View style={styles.agreementTextContainer}>
                <Text style={styles.agreementText}>{t('register.agreement_text')} </Text>
                <TouchableOpacity onPress={handleUserAgreement}>
                  <Text style={styles.agreementLink}>{t('register.user_service_agreement')}</Text>
                </TouchableOpacity>
                <Text style={styles.agreementText}> {t('register.and')} </Text>
                <TouchableOpacity onPress={handlePrivacyPolicy}>
                  <Text style={styles.agreementLink}>{t('register.privacy_policy')}</Text>
                </TouchableOpacity>
                <Text style={styles.agreementText}>.</Text>
              </View>
          </View>

          {/* 国家选择弹窗 - 使用 View 模拟 Modal */}
          {showCountryModal && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('register.select_country')}</Text>
                  <TouchableOpacity onPress={handleCloseModal}>
                    <Text style={styles.modalCloseButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.countryList}>
                  {countries.map((country) => (
                    <TouchableOpacity
                      key={country.id}
                      style={[
                        styles.countryItem,
                        selectedCountry.id === country.id && styles.countryItemSelected
                      ]}
                      onPress={() => handleCountryChange(country)}
                    >
                      <Text style={styles.countryItemFlag}>{country.flag}</Text>
                      <View style={styles.countryItemInfo}>
                        <Text style={[
                          styles.countryItemName,
                          selectedCountry.id === country.id && styles.countryItemNameSelected
                        ]}>
                          {country.name}
                        </Text>
                        <Text style={[
                          styles.countryItemCode,
                          selectedCountry.id === country.id && styles.countryItemCodeSelected
                        ]}>
                          {country.code}
                        </Text>
                      </View>
                      {selectedCountry.id === country.id && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}

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
    marginLeft: -normalize(40), // 保证标题居中
  },
  // === 新增Tab切换相关样式 ===
  tabRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: normalize(24, 'height'),
    marginTop: normalize(109, 'height'),
  },
  tabItem: {
    marginRight: normalize(32), // Tab间距
    alignItems: 'center',
  },
  tabText: {
    color: theme.textPrimary,
    fontSize: normalizeFontSize(24),
    fontWeight: '400',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  tabDot: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
    backgroundColor: theme.primary,
    marginTop: normalize(8, 'height'),
  },
  inputArea: {
    marginBottom: normalize(32, 'height'),
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
  registerButton: {
    width: '100%',
    height: normalize(56, 'height'),
    backgroundColor: theme.primary,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(24, 'height'),
  },
  registerButtonText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: theme.backgroundTertiary,
    textAlign: 'center',
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: normalize(16, 'height'),
    paddingHorizontal: normalize(20),
  },
  checkboxContainer: {
    marginRight: normalize(8),
    marginTop: normalize(2, 'height'),
  },
  checkbox: {
    width: normalize(12),
    height: normalize(12),
    borderWidth: 1,
    borderColor: theme.textSecondary,
    borderRadius: normalize(4),
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  checkmarkText: {
    fontSize: normalizeFontSize(12),
    color: theme.backgroundTertiary,
    fontWeight: '600',
  },
  agreementTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreementText: {
    fontSize: normalizeFontSize(13),
    color: theme.textSecondary,
    fontWeight: '400',
  },
  agreementLink: {
    fontSize: normalizeFontSize(13),
    color: theme.textSecondary,
    fontWeight: '400',
    textDecorationLine: 'underline',
  },
  // 国家选择器样式
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    color: theme.textPrimary,
    height: normalize(56, 'height'),
  },
  locationIcon: {
    width: normalize(24),
    height: normalize(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(6),
  },
  locationIconText: {
    fontSize: normalizeFontSize(14),
    color: theme.textSecondary,
  },
  areaText: {
    fontSize: normalizeFontSize(15),
    color: theme.textSecondary,
    fontWeight: '400',
    flex: 1,
    marginLeft: normalize(10),
  },
  dropdownArrow: {
    fontSize: normalizeFontSize(10),
    color: theme.textSecondary,
    marginLeft: normalize(2),
  },
  // 弹窗样式
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
  modalContainer: {
    width: '100%',
    maxHeight: normalize(400, 'height'),
    backgroundColor: theme.backgroundSecondary,
    borderTopLeftRadius: normalize(20),
    borderTopRightRadius: normalize(20),
    overflow: 'hidden',
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
    fontWeight: '700',
    color: theme.textPrimary,
  },
  modalCloseButton: {
    fontSize: normalizeFontSize(20),
    color: theme.textSecondary,
    fontWeight: '600',
  },
  countryList: {
    maxHeight: normalize(300, 'height'),
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.backgroundTertiary,
  },
  countryItemSelected: {
    backgroundColor: theme.backgroundTertiary,
  },
  countryItemFlag: {
    fontSize: normalizeFontSize(20),
    marginRight: normalize(12),
  },
  countryItemInfo: {
    flex: 1,
    flexDirection: 'column',
  },
  countryItemName: {
    fontSize: normalizeFontSize(16),
    fontWeight: '400',
    color: theme.textPrimary,
    marginBottom: normalize(2, 'height'),
  },
  countryItemNameSelected: {
    fontWeight: '600',
    color: theme.primary,
  },
  countryItemCode: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: theme.textSecondary,
  },
  countryItemCodeSelected: {
    fontWeight: '600',
    color: theme.primary,
  },
  checkmark: {
    fontSize: normalizeFontSize(16),
    color: theme.primary,
    fontWeight: '600',
  },
});

export default RegisterEmailScreen;
