import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Image,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../../utils/theme';
import { useLanguage } from '../../../contexts/LanguageContext';
import { normalize, normalizeFontSize } from '../../../utils/stylesUtil';
import { ProfileStackParamList } from './ProfileNavigator';
import { useMessageModal } from '../../../contexts/MessageModalContext';
import { sendVerificationCodeToNew } from '../../../api/profile/profile';

type BindPhoneScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'BindPhoneEMailNumber '>;

// 国家数据
const countries = [
  { id: 'zh', name: '中国大陆', code: '+86', flag: '🇨🇳' },
  { id: 'en', name: 'English', code: '+1', flag: '🇺🇸' },
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
  { id: 'zu', name: 'Zulu', code: '+27', flag: '🇿🇦' }
];

const BindPhoneEMailScreenNumber: React.FC = ({type}:any) => {
  const navigation = useNavigation<BindPhoneScreenNavigationProp>();
  const { t } = useLanguage();
  const { show } = useMessageModal();
  
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, _setCountdown] = useState(0);
  const [actionToken, _setActionToken] = useState(''); // 添加action_token状态

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelectCountry = (country: any) => {
    setSelectedCountry(country);
    setShowCountryModal(false);
  };

  const handleSendVerificationCode = async () => {
    if (type === 'email') {
      // 邮箱验证码发送逻辑
      if (!email.trim()) {
        show({
          message: t('bind_phone.email_required'),
        });
        return;
      }

      // 简单的邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        show({
          message: t('bind_phone.invalid_email_format'),
        });
        return;
      }

      setIsSubmitting(true);
      
      try {
        if (!actionToken) {
          show({
            message: t('bind_phone.identity_verification_required'),
          });
          return;
        }

        // 发送邮箱验证码
        const response = await sendVerificationCodeToNew({
          action_token: actionToken,
          new_identifier: email.trim(),
          recipient_type: 'email',
        });
        
        console.log('发送邮箱验证码成功:', response);
        
        show({
          message: t('bind_phone.code_sent_success'),
        });
        
        // 跳转到验证码页面
        navigation.navigate('BindPhoneVerify', {
          type: 'email',
          email: email.trim(),
          phoneNumber: '',
          countryCode: '',
          actionToken: actionToken,
        });
        
      } catch (error: any) {
        console.error('发送邮箱验证码失败:', error);
        show({
          message: error.message || t('bind_phone.code_sent_failed'),
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // 手机号验证码发送逻辑
      if (!phoneNumber.trim()) {
        show({
          message: t('bind_phone.phone_required'),
        });
        return;
      }

      // 简单的手机号格式验证
      const phoneRegex = /^\d{6,15}$/;
      if (!phoneRegex.test(phoneNumber.trim())) {
        show({
          message: t('bind_phone.invalid_phone_format'),
        });
        return;
      }

      setIsSubmitting(true);
      
      try {
        if (!actionToken) {
          show({
            message: t('bind_phone.identity_verification_required'),
          });
          return;
        }

        // 发送手机号验证码
        const response = await sendVerificationCodeToNew({
          action_token: actionToken,
          new_identifier: `${selectedCountry.code}${phoneNumber.trim()}`,
          recipient_type: 'phone',
        });
        
        console.log('发送手机验证码成功:', response);
        
        show({
          message: t('bind_phone.code_sent_success'),
        });
        
        // 跳转到验证码页面
        navigation.navigate('BindPhoneVerify', {
          type: 'phone',
          email: '',
          phoneNumber: phoneNumber.trim(),
          countryCode: selectedCountry.code,
          actionToken: actionToken,
        });
        
      } catch (error: any) {
        console.error('发送手机验证码失败:', error);
        show({
          message: error.message || t('bind_phone.code_sent_failed'),
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isInputValid = type === 'phone' ? phoneNumber.trim().length >= 6 : email.trim().length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.container}>        
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 顶部返回和标题 */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Image 
                  source={require('../../../assets/main/page_return_icon.png')} 
                  style={styles.backArrow} 
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{type === 'phone' ? 'Bind mobile number' : 'Bind email'}</Text>
              <View style={{ width: normalize(40) }} />
            </View>

            {/* 地区选择 */}
            {/* <TouchableOpacity 
              style={styles.countrySelector}
              onPress={() => setShowCountryModal(true)}
            >
              <Text style={styles.countryName}>{selectedCountry.name}</Text>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                <Image 
                  source={require('../../../assets/main/dropdown_icon.png')} 
                  style={styles.dropdownIcon} 
                />
              </View>
            </TouchableOpacity> */}

            {/* 手机号/邮箱输入框 */}
            <View style={styles.inputContainer}>
              <Image source={type === 'phone' ? require('@/assets/login/login_phone_icon.png') : require('@/assets/login/login_email_icon.png')} style={styles.phoneIcon} />
              <TextInput
                style={styles.phoneInput}
                placeholder={type === 'phone' ? 'Phone number' : 'Email'}
                placeholderTextColor={theme.textSecondary}
                value={type === 'phone' ? phoneNumber : email}
                onChangeText={type === 'phone' ? setPhoneNumber : setEmail}
                keyboardType={type === 'phone' ? 'phone-pad' : 'email-address'}
                maxLength={type === 'phone' ? 15 : 50}
              />
            </View>

            {/* 发送验证码按钮 */}
            <TouchableOpacity
              style={[
                styles.sendCodeButton,
                isInputValid && countdown === 0 ? styles.sendCodeButtonActive : null
              ]}
              onPress={handleSendVerificationCode}
              disabled={isSubmitting || !isInputValid || countdown > 0}
            >
              <Text style={[
                styles.sendCodeButtonText,
                isInputValid && countdown === 0 ? styles.sendCodeButtonTextActive : null
              ]}>
                {countdown > 0 
                  ? `Resend code (${countdown}s)` 
                  : isSubmitting 
                    ? 'Sending...' 
                    : 'Send verification code'
                }
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* 国家选择模态框 */}
        {showCountryModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('bind_phone.select_country')}</Text>
                <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                  <Text style={styles.modalCloseButton}>{t('common.cancel')}</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.countryList}>
                {countries.map((country) => (
                  <TouchableOpacity
                    key={country.id}
                    style={styles.countryItem}
                    onPress={() => handleSelectCountry(country)}
                  >
                    <Text style={styles.countryItemFlag}>{country.flag}</Text>
                    <Text style={styles.countryItemName}>{country.name}</Text>
                    <Text style={styles.countryItemCode}>{country.code}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: normalize(24),
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
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: normalize(16),
    marginBottom: normalize(24),
  },
  countryName: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: theme.textPrimary,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: theme.textPrimary,
    marginRight: normalize(8),
  },
  dropdownIcon: {
    width: normalize(16),
    height: normalize(16),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    marginBottom: normalize(32),
    height: normalize(56),
  },
  phoneIcon: {
    width: normalize(24),
    height: normalize(24),
    marginRight: normalize(12),
  },
  phoneInput: {
    flex: 1,
    color: theme.textPrimary,
    fontSize: normalizeFontSize(16),
    fontWeight: '400',
    height: normalize(56),
  },
  sendCodeButton: {
    width: '100%',
    height: normalize(56),
    backgroundColor: theme.backgroundTertiary,
    borderRadius: normalize(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendCodeButtonActive: {
    backgroundColor: theme.primary,
  },
  sendCodeButtonText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: theme.textTertiary,
    textAlign: 'center',
  },
  sendCodeButtonTextActive: {
    color: theme.backgroundTertiary,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.backgroundSecondary,
    borderTopLeftRadius: normalize(20),
    borderTopRightRadius: normalize(20),
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(24),
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
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: theme.primary,
  },
  countryList: {
    maxHeight: normalize(400),
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(24),
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
    fontWeight: '500',
    color: theme.textPrimary,
  },
  countryItemCode: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: theme.textSecondary,
  },
});

export default BindPhoneEMailScreenNumber; 