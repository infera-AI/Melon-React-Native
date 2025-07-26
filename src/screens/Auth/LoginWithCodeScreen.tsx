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
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from './AuthNavigator';
import theme from '../../utils/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLoginCodeApi } from '../../api/login/auth';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const newSize = based === 'height' ? size * screenHeight / 812 : size * screenWidth / 375;
  return Math.round(newSize);
};
const normalizeFontSize = (size: number) => {
  const newSize = size * screenWidth / 375;
  return Math.min(Math.round(newSize), size);
};

type LoginWithCodeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'LoginWithCode'>;

const countries = [
  { name: 'China', code: '+86', flag: require('../../../assets/images/flag_cn.png') },
  { name: 'United States', code: '+1', flag: require('../../../assets/images/flag_usuk.png') },
  { name: 'Germany', code: '+49', flag: require('../../../assets/images/flag_de.png') },
  { name: 'Spain', code: '+34', flag: require('../../../assets/images/flag_es.png') },
  { name: 'France', code: '+33', flag: require('../../../assets/images/flag_fr.png') },
  { name: 'Japan', code: '+81', flag: require('../../../assets/images/flag_jp.png') },
];

const LoginWithCodeScreen: React.FC = () => {
  const navigation = useNavigation<LoginWithCodeScreenNavigationProp>();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCountrySelect = (country: typeof countries[0]) => {
    setSelectedCountry(country);
    setShowCountryModal(false);
  };

  const handleTabSwitch = (tab: 'phone' | 'email') => {
    setActiveTab(tab);
    setPhoneNumber('');
    setEmail('');
  };

  const handleSendCode = async () => {
    if (activeTab === 'phone' && !phoneNumber) return;
    if (activeTab === 'email' && !email) return;
    
    setIsSubmitting(true);
    
    try {
      const params = {
        recipient_type: activeTab, // 'phone' 或 'email'
        identifier: activeTab === 'phone' ? phoneNumber : email,
        auth_purpose: 'forgot_password' as const, // 根据页面用途设置
      };
      
      console.log('发送验证码参数:', params);
      
      const response = await getLoginCodeApi(params);
      console.log('验证码发送成功:', response);
      
      // 发送成功后跳转到验证码输入页面
      navigation.navigate('VerifyCode', { 
        account: activeTab === 'phone' ? phoneNumber : email,
        type: activeTab 
      });
      
    } catch (error) {
      console.error('发送验证码失败:', error);
      // 这里可以添加错误提示
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      {/* 顶部返回和标题 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image source={require('../../../src/assets/main/page_return_icon.png')} style={styles.backArrow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{'Login with verification code'}</Text>
        <View style={{ width: normalize(40) }} />
      </View>
      {/* 副标题说明 */}
      <Text style={styles.subtitle}>
        { 'Please enter the mobile phone number you used to register your Melon account. We will send a verification code to reset your password.'}
      </Text>
      {/* Tab切换 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tabButton} onPress={() => handleTabSwitch('phone')}>
          <Text style={activeTab === 'phone' ? styles.activeTab : styles.inactiveTab}>{'by phone number'}</Text>
          {activeTab === 'phone' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => handleTabSwitch('email')}>
          <Text style={activeTab === 'email' ? styles.activeTab : styles.inactiveTab}>{'by E-mail'}</Text>
          {activeTab === 'email' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>
      {/* 手机号登录 */}
      {activeTab === 'phone' && (
        <>
          {/* 国家选择 */}
          <TouchableOpacity style={styles.countrySelector} onPress={() => setShowCountryModal(true)}>
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
              placeholder={'Phone number'}
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
            placeholder={'Email'}
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      )}
      {/* 发送验证码按钮 */}
      <TouchableOpacity
        style={[
          styles.sendButton,
          ((activeTab === 'phone' && phoneNumber) || (activeTab === 'email' && email)) && !isSubmitting
            ? styles.sendButtonActive
            : null,
        ]}
        onPress={handleSendCode}
        disabled={
          (activeTab === 'phone' && !phoneNumber) ||
          (activeTab === 'email' && !email) ||
          isSubmitting
        }
      >
        <Text style={[styles.sendButtonText,((activeTab === 'phone' && phoneNumber) || (activeTab === 'email' && email)) && !isSubmitting
            ? styles.sendButtonTextActive
            : null,]}>{'Send verification code'}</Text>
      </TouchableOpacity>
      {/* 国家选择模态框 */}
      {showCountryModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{'Select Country'}</Text>
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
                  <Text style={styles.countryItemName}>{country.name}</Text>
                  <Text style={styles.countryItemCode}>{country.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
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
    marginBottom: normalize(84, 'height'),
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
    fontSize: normalizeFontSize(14),
    color: theme.textSecondary,
    marginBottom: normalize(24, 'height'),
    lineHeight: normalizeFontSize(21),
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: normalize(32, 'height'),
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
    height: normalize(56, 'height'),
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
  sendButton: {
    width: '100%',
    height: normalize(56, 'height'),
    backgroundColor: theme.backgroundTertiary,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(24, 'height'),
    opacity: 0.7,
  },
  sendButtonActive: {
    backgroundColor: theme.primary,
    opacity: 1,
  },
  sendButtonTextActive: {
    color: theme.backgroundTertiary,
  },
  sendButtonText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
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

export default LoginWithCodeScreen;