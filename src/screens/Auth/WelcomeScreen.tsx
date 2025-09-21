import React, { useState, useEffect } from 'react';
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
import { useBackHandler } from '@/utils/BackHandlerUtil'; // 导入工具类
import { useAppStore } from '@/store';
import FullScreenLoader from '@/components/FullScreenLoader';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator'

import { PangleAdManager, AdEvents, InitAdOptions } from '@/utils/PangleAd';
import { APP_SIGN_ENUM } from '@/utils';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';

import AppleSignButton from '@/components/AppleSignButton';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appleLogin } from '@/api/login'
import { useMessageModal } from '@/contexts/MessageModalContext';
import { useUserStore } from '@/store';
import { getUserInfo } from '@/api/profile/profile';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Initial'>;

type AppleUserInfo = {
  userId: string,
  email: string,
  identityToken: string,
  nonce: string
}

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
  useBackHandler('再按一次退出')
  const navigation = useNavigation<any>();
  const navigation2 = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { language, setLanguage } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);

  const [adCodeId, setAdCodeId] = useState('969900432'); // 穿山甲广告位ID（9开头9位）
  const [rewardName, setRewardName] = useState('积分');   // 奖励名称（可选）
  const [rewardAmount, setRewardAmount] = useState(50);  // 奖励数量（可选）
  const [enableAdvancedReward, setEnableAdvancedReward] = useState(false); // 是否启用进阶奖励（可选）
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets(); // 获取安全区域距离

  const { t } = useLanguage();

  const { show } = useMessageModal();

  // 获取当前选中的语言信息
  const currentLanguage = supportedLanguages.find(lang => lang.code === language) || supportedLanguages[0];

  let googleRewarded:RewardedAd // 谷歌激励广告实例

  useEffect(() => {
    let initSuccessListener: (() => void) | undefined
    let initFailListener: (() => void) | undefined
    let loadSuccessListener: (() => void) | undefined
    let loadFailListener: (() => void) | undefined
    let rewardListener: (() => void) | undefined
    let adCloseListener: (() => void) | undefined

    // 国内版本需要使用穿山甲广告SDK
    if (
      useAppStore.getState().appSign === APP_SIGN_ENUM.TYPE_MELON ||
      useAppStore.getState().appSign === APP_SIGN_ENUM.TYPE_MOMOR
    ) {
      // 3.1 监听「初始化成功」事件
      initSuccessListener = PangleAdManager.addEventListener(
        AdEvents.AD_INIT_SUCCESS,
        (data) => {
          // setAdStatus(data.msg); // 显示初始化成功信息（如“广告初始化成功（广告位ID：969875202）”）
          // Alert.alert('广告初始化成功', data.msg);
          console.log('RN接收到原生事件：广告初始化成功:', data.msg);
          
        }
      );

        // 3.2 监听「初始化失败」事件
      initFailListener = PangleAdManager.addEventListener(
        AdEvents.AD_INIT_FAILED,
        (data) => {
          // setAdStatus(`初始化失败：${data.msg}`);
          // Alert.alert('广告初始化失败', data.msg);
          console.log('广告初始化失败:', data.msg);
          
        }
      );

      // 3.3 监听「广告加载成功」事件
      loadSuccessListener = PangleAdManager.addEventListener(
        AdEvents.AD_LOADED,
        (data) => {
          // setAdStatus(data.msg); // 显示加载成功信息（如“广告素材缓存完成（最佳展示时机）”）
          console.log('RN接收到原生事件广告加载成功:', data.msg);
          PangleAdManager.showAd();
          
        }
      );

      // 3.4 监听「广告加载失败」事件
      loadFailListener = PangleAdManager.addEventListener(
        AdEvents.AD_LOAD_FAILED,
        (data) => {
          // setAdStatus(`加载失败：${data.msg}（错误码：${data.code}）`);
          // Alert.alert('广告加载失败', `错误码：${data.code}\n原因：${data.msg}`);
          console.log('RN接收到原生事件广告加载失败', `错误码：${data.code}\n原因：${data.msg}`);
          
        }
      );

      // 3.5 监听「奖励到账」事件（核心业务逻辑：用户看完广告后发放奖励）
      rewardListener = PangleAdManager.addEventListener(
        AdEvents.REWARD_ARRIVED,
        (data) => {
          if (data.isRewardValid) {
            // 奖励有效：执行发放逻辑（如调用API给用户加金币）
            // Alert.alert(
            //   '奖励到账',
            //   `恭喜获得 ${data.rewardAmount} ${data.rewardName}`
            // );
            console.log(`RN接收到原生事件奖励到账: 恭喜获得 ${data.rewardAmount} ${data.rewardName}`);
            
            // 示例：调用后端接口发放奖励
            // fetch('/api/user/addReward', {
            //   method: 'POST',
            //   body: JSON.stringify({
            //     userId: '当前用户ID',
            //     rewardType: data.rewardName,
            //     rewardNum: data.rewardAmount
            //   })
            // });
          } else {
            // 奖励无效：提示用户
            // Alert.alert('奖励无效', `原因：${data.serverErrorMsg || '未知错误'}`);
            console.log('RN接收到原生事件奖励无效: ', `原因：${data.serverErrorMsg || '未知错误'}`);
          }
        }
      );

      // 3.6 监听「广告关闭」事件
      adCloseListener = PangleAdManager.addEventListener(
        AdEvents.AD_CLOSED,
        (data) => {
          // setAdStatus('广告已关闭');
          console.log('RN接收到原生事件广告已关闭');
        }
      );
    } else { // 国外版使用谷歌广告

    }

    // 组件卸载时：取消所有监听 + 释放广告资源
    return () => {
      if (
        useAppStore.getState().appSign === APP_SIGN_ENUM.TYPE_MELON ||
        useAppStore.getState().appSign === APP_SIGN_ENUM.TYPE_MOMOR
      ) {
        console.log('RN端写在监听器');
        initSuccessListener && initSuccessListener();
        initFailListener && initFailListener();
        loadSuccessListener && loadSuccessListener();
        loadFailListener && loadFailListener();
        rewardListener && rewardListener();
        adCloseListener && adCloseListener();
        PangleAdManager.releaseAd(); // 释放广告资源，避免内存泄漏
      } else {
        googleRewarded && googleRewarded.removeAllListeners()
      }
      
    };

  }, [])

  // 4.1 初始化广告（必选：传入广告位ID，可选传奖励信息/进阶奖励）
  const handleInitAd = async () => {
    console.log('useAppStore.getState().appSign---', useAppStore.getState().appSign);
    
    if (
      useAppStore.getState().appSign === APP_SIGN_ENUM.TYPE_MELON ||
      useAppStore.getState().appSign === APP_SIGN_ENUM.TYPE_MOMOR
    ) {
      if (!adCodeId.trim()) {
        // Alert.alert('输入错误', '请输入有效的广告位ID（9开头9位数字）');
        console.log('请输入有效的广告位ID（9开头9位数字）');
        
        return;
      }

      // setAdStatus('正在初始化广告...');
      console.log('正在初始化广告...');
      
      try {
        // 构建可选参数（仅当需要设置奖励或启用进阶奖励时传递）
        const options: InitAdOptions = {};
        if (rewardName.trim() && rewardAmount > 0) {
          options.rewardName = rewardName;
          options.rewardAmount = rewardAmount;
        }
        if (enableAdvancedReward) {
          options.enableAdvancedReward = false;
        }

        // 调用原生initAd方法（核心：传入广告位ID + 可选参数）
        await PangleAdManager.initAd(adCodeId, options);
        await PangleAdManager.autoLoadRewardAd();
        // await PangleAdManager.showAd();
      } catch (error: any) {
        // setAdStatus(`初始化失败：${error.message}`);
        console.log('广告初始化失败:', error.message);
        
      }
    } else { // 国外版使用谷歌
      googleRewarded = RewardedAd.createForAdRequest(TestIds.REWARDED, {
        // keywords: ['fashion', 'clothing'],
      });
      googleRewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('谷歌激励广告加载完成');
        googleRewarded.show()
      })
      googleRewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
        console.log('谷歌激励广告播放完成----', reward);
      })
      googleRewarded.load()
    }
  };

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

  const getUserInfoRequest = async () => {
    const res = await getUserInfo({});
    console.log('UserInfo--', res);
    if (res.data) {
      useUserStore.getState().setUserInfo(res.data);
    }
  }

  const loginByApple = (applyUserInfo: AppleUserInfo) => {
    console.log('苹果登录用户信息--', applyUserInfo);
    if (applyUserInfo?.userId) {
      appleLogin({
        auth_type: 'apple',
        identifier: applyUserInfo?.userId
      }).then((rsp) => {
        console.log('登录成功----', rsp);
        setLoading(false)
        if (rsp?.token) {
          useUserStore.getState().setToken(rsp.token);
          getUserInfoRequest();
          // 跳转到首页
          navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] })
        } else {
          setLoading(false)
          show({
            message: t('response_error')
          })
        }
      }).catch(() => {
        setLoading(false)
        show({
          message: t('response_error')
        })
      })
    } else {
      setLoading(false)
      show({
        message: t('response_error')
      })
    }
    
  }

  return (
    <View style={styles.outView}>
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
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.background} />
        
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
            {/* <TouchableOpacity
              style={{
                width: 50,
                height: 50,
                position: 'absolute',
                top: 40,
                left: 20,
                zIndex: 10,
                backgroundColor: '#ff00ff'
              }}
              onPress={handleInitAd}
            >
            </TouchableOpacity> */}
              {/* Melon 标题 - 渐变色文字 */}
             <View style={styles.titleContainer}>
               <Image source={require('../../../src/assets/login/login_title_icon_melons.png')} resizeMode="contain" style={styles.titleIcon} />
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

            {/* 第三方登录 */}
            <View style={styles.otherLoginView}>
              {
                Platform.OS === 'ios' &&
                  <AppleSignButton
                    beforeClickCheck={() => {
                      if (!isAgreementChecked) {
                        show({
                          message: t('register.please_agree')
                        })
                      }
                      return isAgreementChecked
                    }}
                    onSuccess={(userData) => {
                      console.log('苹果登录用户信息:', userData);
                      setLoading(true)
                      loginByApple(userData)
                      // 1. 把 userData.identityToken 和 userData.nonce 传给后端校验
                      // 2. 后端校验通过后，保存用户信息到本地（如 AsyncStorage）
                    }}
                    onError={(error) => {
                      console.error('登录失败:', error);
                      // 显示错误提示（如 Toast）
                    }}
                  />
              }
              
            </View>
            <View style={[styles.bottomView, {paddingBottom: insets.bottom > 0 ? insets.bottom : scaleSize(20)}]}>
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
      <FullScreenLoader
        visible={loading}
        text={t('translate_screen.loading_text')}
        timeout={20000}
        onTimeout={() => setLoading(false)}
      />
     </View>
   );
 };

const styles = StyleSheet.create({
  outView: {
    flex: 1,
    backgroundColor: theme.background,
    position: 'relative'
  },
  container: {
    flex: 1,
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
    },
    contentWrapper: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      marginTop: scaleSize(168),
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
      marginBottom: scaleSize(20),
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
    otherLoginView: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    bottomView: {
      flex: 1,
      width: '100%',
      justifyContent: 'space-between',
      marginTop: scaleSize(20),
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