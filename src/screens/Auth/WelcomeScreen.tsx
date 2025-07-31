import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from './AuthNavigator';
import theme from '../../utils/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import CountryFlag from 'react-native-country-flag';
import { languageToCountryCode, supportedLanguages } from "@/i18n/languages"

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const newSize = based === 'height' ? size * screenHeight / 812 : size * screenWidth / 375;
  return Math.round(newSize);
};
const normalizeFontSize = (size: number) => {
  const newSize = size * screenWidth / 375;
  return Math.min(Math.round(newSize), size);
};

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Initial'>;

// 支持的语言列表
// const languages = [
//   { code: 'en', name: 'English', flag: require('../../../assets/images/flag_usuk.png') },
//   { code: 'zh', name: '中文', flag: require('../../../assets/images/flag_cn.png') },
//   { code: 'jp', name: '日本語', flag: require('../../../assets/images/flag_jp.png') },
//   { code: 'de', name: 'Deutsch', flag: require('../../../assets/images/flag_de.png') },
//   { code: 'fr', name: 'Français', flag: require('../../../assets/images/flag_fr.png') },
//   { code: 'es', name: 'Español', flag: require('../../../assets/images/flag_es.png') },
// ];

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const navigation2 = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { language, setLanguage } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);

  const { t } = useLanguage();

  // 获取当前选中的语言信息
  const currentLanguage = supportedLanguages.find(lang => lang.code === language) || supportedLanguages[0];

  const handleRegister = () => {
    navigation.navigate('RegisterEmail');
  };

  const handleLogin = () => {
    navigation.navigate('LoginPhone');
  };

  const handleUserServiceAgreement = () => {
    navigation.navigate('UserServiceAgreement');
  };

  const handlePrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode as any);
    setShowLanguageModal(false);
  };

  const handleLanguageSelectorPress = () => {
    setShowLanguageModal(true);
  };

  return (
    <SafeAreaView style={{flex: 1}} edges={['top','bottom','left','right']}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.background} />
        
        {/* 背景装饰圆圈 */}
        {/* <View style={styles.backgroundCircle1} />
        <View style={styles.backgroundCircle2} /> */}
        <Image
          source={require('../../../src/assets/main/page_top_bg.png')}
          style={styles.backgroundCircle1}
          resizeMode="cover"
        />
         <Image
          source={require('../../../src/assets/main/page_bottom_bg.png')}
          style={styles.backgroundCircle2}
          resizeMode="cover"
        />
        
        {/* 主要内容容器 */}
        <View style={styles.contentContainer}>
          {/* 状态栏占位 */}
          <View style={styles.statusBarPlaceholder} />
          
          {/* 内容包装器 */}
          <View style={styles.contentWrapper}>
            {/* Melon Logo */}
            <TouchableOpacity style={styles.logoContainer} onPress={() => navigation2.reset({index: 0, routes: [{name: 'MainApp'}]})}>
                <Image
                  source={require('../../../src/assets/login/welcome_logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
            </TouchableOpacity>
            {/* <View style={styles.logoContainer} >
                <Image
                  source={require('../../../src/assets/login/welcome_logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
            </View> */}
            
                       {/* Melon 标题 - 渐变色文字 */}
             <View style={styles.titleContainer}>
               <Image source={require('../../../src/assets/login/login_title_icon.png')} resizeMode="contain" style={styles.titleIcon} />
             </View>
            
            {/* 标语 - 渐变色文字 */}
            <View style={styles.sloganContainer}>
                <Text style={styles.sloganText}>{t('welcome.slogan')}</Text>
            </View>
            
            {/* 注册按钮 */}
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>
                {t('register.register_melon_account')}
                {/* Register a Melon account */}
              </Text>
            </TouchableOpacity>
              {/* 登录链接 */}
             <View style={styles.loginLink}>
               <Text style={styles.loginLinkText}>{t('welcome.already_have_account')}</Text>
               <TouchableOpacity onPress={handleLogin}>
                 <Text style={styles.loginLinkButton}>{t('welcome.log_in')}</Text>
               </TouchableOpacity>
             </View>
            
            {/* 语言选择器 */}
            <TouchableOpacity style={styles.languageSelector} onPress={handleLanguageSelectorPress}>
              <View style={styles.languageContainer}>
                <View style={styles.flagContainer}>
                  {/* <Image
                    source={}
                    style={styles.flag}
                    resizeMode="contain"
                  /> */}
                  <View style={styles.flagOutView}>
                    <CountryFlag isoCode={languageToCountryCode[currentLanguage.code]} size={25} style={styles.flag}/>
                  </View>
                </View>
                <Text style={styles.languageText}>{currentLanguage.label}</Text>
                <View style={styles.dropdownIcon}>
                  <Image source={require('../../../src/assets/main/dropdown_icon.png')} style={styles.dropdownIcon} />
                </View>
              </View>
            </TouchableOpacity>
            
              {/* 用户协议 */}
              <View style={styles.agreementContainer}>
                <TouchableOpacity 
                  style={styles.checkboxContainer} 
                  onPress={() => setIsAgreementChecked(!isAgreementChecked)}
                >
                  <View style={[
                    styles.checkbox,
                    isAgreementChecked && styles.checkboxChecked
                  ]}>
                    {isAgreementChecked && (
                      <Text style={styles.checkboxCheckmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
                <View style={styles.agreementTextContainer}>
                  <Text style={styles.agreementText}>
                    {t('welcome.agreement_text')}{' '}
                  </Text>
                  <TouchableOpacity onPress={handleUserServiceAgreement}>
                     <Text style={styles.agreementLink}>{t('welcome.user_service_agreement')}</Text>
                   </TouchableOpacity>
                   <Text style={styles.agreementText}> {t('welcome.and')} </Text>
                   <TouchableOpacity onPress={handlePrivacyPolicy}>
                     <Text style={styles.agreementLink}>{t('welcome.privacy_policy')}</Text>
                   </TouchableOpacity>
                </View>
              </View>
          </View>
        </View>
      </View>

            {/* 语言选择模态框 - 完整版本 */}
      {showLanguageModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('welcome.select_language')}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.languageList}>
              {supportedLanguages.map((lang, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.languageItem,
                    lang.code === language && styles.languageItemActive
                  ]}
                  onPress={() => handleLanguageSelect(lang.code)}
                >
                  <View style={styles.languageItemFlagView}>
                    <CountryFlag isoCode={languageToCountryCode[lang.code]} size={25} style={styles.languageItemFlag}/>
                  </View>
                  {/* <Image source={lang.flag}  /> */}
                  <Text style={[
                    styles.languageItemText,
                    lang.code === language && styles.languageItemTextActive
                  ]}>
                    {lang.label}
                  </Text>
                  {lang.code === language && (
                    <Text style={styles.languageItemCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
     </SafeAreaView>
   );
 };

const styles = StyleSheet.create({
      container: {
    flex: 1,
    backgroundColor: theme.background,
  },
    backgroundCircle1: {
      position: 'absolute',
      width: normalize(399),
      height: normalize(359, 'height'),
      left: -normalize(0),
      top: -normalize(0, 'height'),
    },
    backgroundCircle2: {
      position: 'absolute',
      width: normalize(377),
      height: normalize(339, 'height'),
      right: normalize(-140),
      bottom: normalize(0, 'height'),
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: normalize(24),
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentWrapper: {
      width: '100%',
      maxWidth: normalize(327),
      alignItems: 'center',
    },
    statusBarPlaceholder: {
      height: Platform.OS === 'ios' ? 44 : 24,
    },
    logoContainer: {
      alignItems: 'center',
      marginTop: normalize(20, 'height'),
      marginBottom: normalize(29, 'height'),
    },
    logoPlaceholder: {
      width: normalize(85),
      height: normalize(87, 'height'),
      borderRadius: normalize(16),
      backgroundColor: '#262626',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: normalize(85),
      height: normalize(87, 'height'),
    },
    logoText: {
      fontSize: normalizeFontSize(48),
      fontWeight: '700',
      color: '#85F380',
    },
    titleContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: normalize(24, 'height'),
    },
    titleGradient: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    titleText: {
      fontSize: normalizeFontSize(48),
      fontWeight: '700',
      textAlign: 'center',
      color: theme.textPrimary,
    },
    titleIcon: {
      width: normalize(132),
      height: normalize(32),
    },
    title: {
      fontSize: normalizeFontSize(48),
      fontWeight: '600',
      textAlign: 'center',
      color: theme.primary,
      textShadowColor: theme.info,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: normalize(10),
    },
    sloganContainer: {
      alignItems: 'center',
      marginBottom: normalize(107, 'height'),
    },
    sloganGradient: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: normalize(10),
      borderRadius: normalize(8),
    },
    sloganText: {
      fontSize: normalizeFontSize(15),
      fontWeight: '400',
      textAlign: 'center',
      color: theme.textSecondary,
      letterSpacing: -0.4,
    },
    slogan: {
      fontSize: normalizeFontSize(15),
      fontWeight: '400',
      textAlign: 'center',
      color: theme.textSecondary,
      letterSpacing: -0.4,
    },
    registerButton: {
      width: normalize(327),
      height: normalize(74, 'height'),
      backgroundColor: theme.primary,
      borderRadius: 50,
      paddingVertical: normalize(12, 'height'),
      paddingHorizontal: normalize(16),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: normalize(16, 'height'),
    },
    registerButtonText: {
      fontSize: normalizeFontSize(18),
      fontWeight: '700',
      color: theme.backgroundTertiary,
      textAlign: 'center',
    },
    loginLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: normalize(40, 'height'),
    },
    loginLinkText: {
      fontSize: normalizeFontSize(13),
      fontWeight: '400',
      color: theme.textSecondary,
      textAlign: 'center',
      letterSpacing: -0.4,
    },
    loginLinkButton: {
      fontSize: normalizeFontSize(13),
      fontWeight: '600',
      color: theme.primary,
      textAlign: 'center',
      letterSpacing: -0.4,
    },
    languageSelector: {
      alignItems: 'center',
      marginBottom: normalize(30, 'height'),
    },
    languageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundSecondary,
      borderRadius: normalize(12),
      paddingVertical: normalize(16, 'height'),
      paddingHorizontal: normalize(16),
      width: normalize(213),
      height: normalize(48, 'height'),
    },
    flagContainer: {
      width: normalize(20),
      height: normalize(20),
      marginRight: normalize(12),
    },
    flagOutView: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      overflow: 'hidden',
      position: 'relative'
    },
    flag: {
      width: '100%',
      height: '100%',
    },
    languageText: {
      fontSize: normalizeFontSize(14),
      fontWeight: '500',
      color: theme.textPrimary,
      flex: 1,
    },
    dropdownIcon: {
      width: normalize(11),
      height: normalize(6),
      alignItems: 'center',
      justifyContent: 'center',
    },
    dropdownText: {
      width: normalize(10.67),
      height: normalize(6, 'height'),
      alignItems: 'center',
      justifyContent: 'center',
    },
    agreementContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingHorizontal: normalize(20),
    },
    checkboxContainer: {
      marginRight: normalize(8),
    },
    checkbox: {
       width: normalize(17),
       height: normalize(17),
       borderWidth: 1,
       borderColor: theme.textSecondary,
       borderRadius: normalize(12),
       backgroundColor: 'transparent',
       alignItems: 'center',
       justifyContent: 'center',
     },
     checkboxChecked: {
       backgroundColor: theme.primary,
       borderColor: theme.primary,
     },
     checkboxCheckmark: {
       color: theme.backgroundTertiary,
       fontSize: normalizeFontSize(12),
       fontWeight: 'bold',
     },
    agreementTextContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
    },
    agreementText: {
      fontSize: normalizeFontSize(12),
      fontWeight: '400',
      color: theme.textSecondary,
      lineHeight: normalize(18, 'height'),
      letterSpacing: -0.4,
    },
    agreementLink: {
      fontSize: normalizeFontSize(12),
      fontWeight: '600',
      color: theme.primary,
      lineHeight: normalize(18, 'height'),
      letterSpacing: -0.4,
      textDecorationLine: 'underline',
    },
    // 语言选择模态框样式
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
    languageList: {
      maxHeight: normalize(400, 'height'),
    },
    languageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: normalize(20),
      paddingVertical: normalize(16),
      borderBottomWidth: 1,
      borderBottomColor: theme.backgroundTertiary,
    },
    languageItemActive: {
      backgroundColor: theme.backgroundTertiary,
    },
    languageItemFlagView: {
      width: normalize(24),
      height: normalize(24),
      marginRight: normalize(12),
      borderRadius: '50%',
      position: 'relative',
      overflow: 'hidden',
    },
    languageItemFlag: {
      width: normalize(24),
      height: normalize(24),
    },
    languageItemText: {
      flex: 1,
      fontSize: normalizeFontSize(16),
      color: theme.textPrimary,
    },
    languageItemTextActive: {
      color: theme.primary,
      fontWeight: '600',
    },
    languageItemCheck: {
      fontSize: normalizeFontSize(16),
      color: theme.primary,
      fontWeight: '600',
    },
  });

export default WelcomeScreen; 