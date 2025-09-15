import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from './AuthNavigator';
import { normalize, normalizeFontSize } from '../../utils/stylesUtil';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppStore } from '@/store'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type PrivacyPolicyScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'PrivacyPolicy'>;

const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation<PrivacyPolicyScreenNavigationProp>();

  const appSign = useAppStore.getState().appSign

  const [appName, setAppName] = useState('')

  const { t } = useLanguage();
  const handleBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    if (appSign === 'melon') {
      setAppName('Melons')
    }
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181819" />
      
      {/* 状态栏占位 */}
      <View style={styles.statusBarPlaceholder} />
      
      {/* 主要内容容器 */}
      <View style={styles.contentContainer}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <View style={styles.backIcon}>
              <Image source={require('../../assets/main/page_return_icon.png')} style={styles.backIcon} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('privacy_policy.str_1')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        {/* 协议内容 */}
        <ScrollView style={styles.agreementContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.titleText}>
            {appName} {t('privacy_policy.str_1')}
          </Text>
          <Text style={[styles.boldText]}>
            {t('privacy_policy.str_2')}: <Text style={styles.normalText}>{t('privacy_policy.str_3')}</Text>
          </Text>
          <Text style={[styles.boldText]}>
            {t('privacy_policy.str_4')}: <Text style={styles.normalText}>{t('privacy_policy.str_5')}</Text>
          </Text>
          <Text style={styles.title2Text}>
            {t('privacy_policy.str_6')}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_7').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_8').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_9').replace(/{Melon}/g, appName)}
          </Text>

          <Text style={styles.title2Text}>
            {t('privacy_policy.str_10').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_11').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('privacy_policy.str_12').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_13')} </Text>
            {t('privacy_policy.str_14').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_15')} </Text>
            {t('privacy_policy.str_16').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_17').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_18').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('privacy_policy.str_19').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_20').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_21').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_22').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_23').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('privacy_policy.str_24').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_25').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('privacy_policy.str_26').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_27').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_28').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_29').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_30').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_31').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_32').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_33').replace(/{Melon}/g, appName)}
          </Text>

          <Text style={styles.title2Text}>
            {t('privacy_policy.str_34').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_35').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_36').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_37').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_38').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_39').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_40').replace(/{Melon}/g, appName)} </Text>
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_41').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_42').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_43').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_44').replace(/{Melon}/g, appName)}
          </Text>

          <Text style={styles.title2Text}>
            {t('privacy_policy.str_45').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_46').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_47').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_48').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_49').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_50').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_51').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_52').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_53').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_54').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={styles.boldText}>{t('privacy_policy.str_55').replace(/{Melon}/g, appName)}</Text> {t('privacy_policy.str_56').replace(/{Melon}/g, appName)}
          </Text>

          <Text style={styles.title2Text}>
            {t('privacy_policy.str_57').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_58').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_59').replace(/{Melon}/g, appName)}
          </Text>

          <Text style={styles.title2Text}>
            {t('privacy_policy.str_60').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_61').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('privacy_policy.str_62').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_63').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_64').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_65').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_66').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_67').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_68').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_69').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_70').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_71').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('privacy_policy.str_72').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_73').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_74').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_75').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_76').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_77').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_78').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_79').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_80').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_81').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('privacy_policy.str_82').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_83').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_84').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_85').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_86').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_87').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_88').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_89').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_90').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_91').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_92').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_93').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>{t('privacy_policy.str_94').replace(/{Melon}/g, appName)} </Text>
            {t('privacy_policy.str_95').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_96').replace(/{Melon}/g, appName)}
          </Text>

          <Text style={styles.title2Text}>
            {t('privacy_policy.str_97').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_98').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_99').replace(/{Melon}/g, appName)}
          </Text>

          <Text style={styles.title2Text}>
            {t('privacy_policy.str_100').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_101').replace(/{Melon}/g, appName)}
          </Text>

          <Text style={styles.title2Text}>
            {t('privacy_policy.str_102').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_103').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('privacy_policy.str_104').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={[styles.normalText, {textAlign: 'auto'}]}>
            <Text style={styles.boldText}>{t('privacy_policy.str_105')} </Text>privacy@infera.im | contact@infera.cn
          </Text>
          <Text style={styles.normalText}>
            <Text style={styles.boldText}>{t('privacy_policy.str_106')} </Text>{t('privacy_policy.str_107')}
          </Text>

          <View style={styles.marginTop20} />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
  },
  statusBarPlaceholder: {
    height: Platform.OS === 'ios' ? 44 : 24,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: normalize(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(12),
    marginBottom: normalize(18),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: normalize(16),
    height: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  headerSpacer: {
    width: normalize(40),
  },
  agreementContainer: {
    flex: 1,
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
  },
  agreementText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#B0B0B0',
    lineHeight: normalize(20),
    letterSpacing: -0.4,
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: normalizeFontSize(18),
    color: '#ffffff',
    marginBottom: normalize(20),
    marginTop: normalize(20),
  },
  title2Text: {
    fontWeight: '600',
    fontSize: normalizeFontSize(16),
    color: '#ffffff',
    marginTop: normalize(20),
  },
  title3Text: {
    fontWeight: '600',
    fontSize: normalizeFontSize(16),
    color: '#ffffff',
    marginTop: normalize(8),
  },
  boldText: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  normalText: {
    fontWeight: 'normal',
    color: '#ffffff',
    fontSize: normalizeFontSize(14),
    textAlign: 'justify',
    lineHeight: normalize(20),
    marginTop: normalize(8),
  },
  marginTop20: {
    marginTop: normalize(20),
  }
});

export default PrivacyPolicyScreen; 