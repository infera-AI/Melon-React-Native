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
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from './AuthNavigator';
import theme from '../../utils/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import CountryFlag from 'react-native-country-flag';
import { languageToCountryCode, supportedLanguages } from "@/i18n/languages"
import { scaleSize,scaleFont } from '../../utils/scale';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator'

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
      <ScrollView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.background} />
        
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
          
          {/* 内容包装器 */}
          <View style={styles.contentWrapper}>
            {/* Melon Logo */}
            {/* <TouchableOpacity style={styles.logoContainer} onPress={() => navigation2.reset({index: 0, routes: [{name: 'MainApp'}]})}> */}
            <View style={styles.logoContainer}>
                <Image
                  source={require('../../../src/assets/login/welcome_logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
            </View>
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
                    <Text style={styles.agreementLink} onPress={handleUserServiceAgreement}>
                      {t('welcome.user_service_agreement')}
                    </Text>
                    {' '}{t('welcome.and')}{' '}
                    <Text style={styles.agreementLink} onPress={handlePrivacyPolicy}>
                      {t('welcome.privacy_policy')}
                    </Text>
                  </Text>
                </View>
              </View>
          </View>
        </View>
      </ScrollView>

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
            <ScrollView style={styles.languageList}>
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
                    {t(`languageNames.${lang.code}`)}
                  </Text>
                  {lang.code === language && (
                    <Text style={styles.languageItemCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
      width: scaleSize(399),
      height: scaleSize(359),
      left: -scaleSize(0),
      top: -scaleSize(0),
    },
    backgroundCircle2: {
      position: 'absolute',
      width: scaleSize(377),
      height: scaleSize(339),
      right: scaleSize(-60),
      bottom: scaleSize(0),
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: scaleSize(24),
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentWrapper: {
      width: '100%',
      alignItems: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      marginTop: scaleSize(178),
      marginBottom: scaleSize(20),
    },
    logoPlaceholder: {
      width: scaleSize(85),
      height: scaleSize(87),
      borderRadius: scaleSize(16),
      backgroundColor: '#262626',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: scaleSize(85),
      height: scaleSize(87),
    },
    titleContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: scaleSize(14),
    },
    titleIcon: {
      width: scaleSize(132),
      height: scaleSize(32),
    },
    title: {
      fontSize: scaleFont(48),
      fontWeight: '600',
      textAlign: 'center',
      color: theme.primary,
      textShadowColor: theme.info,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: scaleSize(10),
    },
    sloganContainer: {
      alignItems: 'center',
      marginBottom: scaleSize(107),
    },
    sloganGradient: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: scaleSize(10),
      borderRadius: scaleSize(8),
    },
    sloganText: {
      fontSize: scaleFont(12),
      fontWeight: '400',
      textAlign: 'center',
      color: theme.textSecondary,
      letterSpacing: -0.4,
    },
    slogan: {
      fontSize: scaleFont(15),
      fontWeight: '400',
      textAlign: 'center',
      color: theme.textSecondary,
      letterSpacing: -0.4,
    },
    registerButton: {
      width: "100%",
      height: scaleSize(74),
      backgroundColor: theme.primary,
      borderRadius:scaleSize(50),
      paddingVertical: scaleSize(12),
      paddingHorizontal: scaleSize(16),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: scaleSize(12)
    },
    registerButtonText: {
      fontSize: scaleFont(18),
      fontWeight: '700',
      color: theme.backgroundTertiary,
      textAlign: 'center',
    },
    loginLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: scaleSize(50),
    },
    loginLinkText: {
      fontSize: scaleFont(13),
      fontWeight: '400',
      color: theme.textSecondary,
      textAlign: 'center',
      letterSpacing: -0.4,
    },
    loginLinkButton: {
      fontSize: scaleFont(13),
      fontWeight: '600',
      color: theme.primary,
      textAlign: 'center',
      letterSpacing: -0.4,
    },
    languageSelector: {
      alignItems: 'center',
      marginBottom: scaleSize(30),
    },
    languageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundSecondary,
      borderRadius: scaleSize(12),
      paddingHorizontal: scaleSize(16),
      width: scaleSize(213),
      height: scaleSize(48),
    },
    flagContainer: {
      width: scaleSize(20),
      height: scaleSize(20),
      marginRight: scaleSize(12),
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
      fontSize: scaleFont(14),
      fontWeight: '500',
      color: theme.textPrimary,
      flex: 1,
      textAlign:'left',
    },
    dropdownIcon: {
      width: scaleSize(11),
      height: scaleSize(6),
      alignItems: 'center',
      justifyContent: 'center',
    },
    dropdownText: {
      width: scaleSize(10.67),
      height: scaleSize(6),
      alignItems: 'center',
      justifyContent: 'center',
    },
    agreementContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingHorizontal: scaleSize(20),
      marginBottom: scaleSize(50)
    },
    checkboxContainer: {
      marginRight: scaleSize(8),
    },
    checkbox: {
       width: scaleSize(17),
       height: scaleSize(17),
       borderWidth: 1,
       borderColor: theme.textSecondary,
       borderRadius: scaleSize(12),
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
       fontSize: scaleFont(12),
       fontWeight: 'bold',
     },
    agreementTextContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: scaleSize(10)  
    },
    agreementText: {
      fontSize: scaleFont(12),
      fontWeight: '400',
      textAlign: 'center',
      color: theme.textSecondary,
      lineHeight: scaleSize(18),
      letterSpacing: -0.4,
    },
    agreementLink: {
      fontSize: scaleFont(12),
      fontWeight: '600',
      color: theme.primary,
      lineHeight: scaleSize(18),
      letterSpacing: -0.4,
    },
    letterBreak: {
      // 强制在任何字符处换行
      wordBreak: 'break-all' as any,
      overflowWrap: 'break-word' as any,
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
      borderTopLeftRadius: scaleSize(20),
      borderTopRightRadius: scaleSize(20),
      maxHeight: '60%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: scaleSize(20),
      paddingVertical: scaleSize(16),
      borderBottomWidth: 1,
      borderBottomColor: theme.backgroundTertiary,
    },
    modalTitle: {
      fontSize: scaleFont(18),
      fontWeight: '600',
      color: theme.textPrimary,
    },
    modalClose: {
      fontSize: scaleFont(20),
      color: theme.textSecondary,
    },
    languageList: {
      maxHeight: scaleSize(400),
    },
    languageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: scaleSize(20),
      paddingVertical: scaleSize(16),
      borderBottomWidth: 1,
      borderBottomColor: theme.backgroundTertiary,
    },
    languageItemActive: {
      backgroundColor: theme.backgroundTertiary,
    },
    languageItemFlagView: {
      width: scaleSize(24),
      height: scaleSize(24),
      marginRight: scaleSize(12),
      borderRadius: '50%',
      position: 'relative',
      overflow: 'hidden',
    },
    languageItemFlag: {
      width: scaleSize(24),
      height: scaleSize(24),
    },
    languageItemText: {
      flex: 1,
      fontSize: scaleFont(16),
      color: theme.textPrimary,
    },
    languageItemTextActive: {
      color: theme.primary,
      fontWeight: '600',
    },
    languageItemCheck: {
      fontSize: scaleFont(16),
      color: theme.primary,
      fontWeight: '600',
    },
  });

export default WelcomeScreen; 