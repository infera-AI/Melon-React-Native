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
import WebView from 'react-native-webview';
import UserServiceHTMLZh  from './UserServiceZh'
import UserServiceHTMLEn  from './UserServiceEn'

type UserServiceAgreementScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'UserServiceAgreement'>;

const UserServiceAgreementScreen: React.FC = () => {
  const navigation = useNavigation<UserServiceAgreementScreenNavigationProp>();

  const appSign = useAppStore.getState().appSign
  const [appName, setAppName] = useState('')

  const { t, language } = useLanguage();

  const handleBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    if (appSign === 'melon') {
      setAppName('Melons')
    } else if (appSign === 'melons') {
      setAppName('Melons AI')
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
              {/* <Text style={styles.backArrow}>←</Text> */}
              <Image source={require('../../assets/main/page_return_icon.png')} style={styles.backIcon} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('terms_service.str_1')}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.htmlContainer}>
          <WebView source={{html: (appSign === 'melon' || appSign === 'momor' ? UserServiceHTMLZh : UserServiceHTMLEn).replace(/Melon/g, appName)}}/>
        </View>
        {/* 协议内容 */}
        {/* <ScrollView style={styles.agreementContainer} showsVerticalScrollIndicator={false}> */}
          
          
          {/* <Text style={styles.titleText}>
            {t('terms_service.str_2').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={[styles.boldText]}>
            {t('terms_service.str_3').replace(/{Melon}/g, appName)} <Text style={styles.normalText}>{t('terms_service.str_4').replace(/{Melon}/g, appName)}</Text>
          </Text>
          <Text style={[styles.boldText]}>
            {t('terms_service.str_5').replace(/{Melon}/g, appName)} <Text style={styles.normalText}>{t('terms_service.str_6').replace(/{Melon}/g, appName)}</Text>
          </Text>
          
          <Text style={styles.title2Text}>
            {t('terms_service.str_7').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_8').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_9').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_10').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_11').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={[styles.title3Text, styles.marginTop20]}>
            {t('terms_service.str_12').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_13').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={[styles.title3Text, styles.marginTop20]}>
            {t('terms_service.str_14').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={styles.boldText}>
              {t('terms_service.str_15').replace(/{Melon}/g, appName)}
            </Text>
            {t('terms_service.str_16').replace(/{Melon}/g, appName)}
          </Text>

          <Text style={styles.title2Text}>
            {t('terms_service.str_17').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_18').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_19').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_20').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_21').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_22').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_23').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_24').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_25').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_26').replace(/{Melon}/g, appName)}
          </Text>

          <Text style={styles.title2Text}>
            {t('terms_service.str_27').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_28').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_29').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={[styles.normalText, styles.boldText]}>
            {t('terms_service.str_30').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_31').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_32').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_33').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={styles.boldText}>{t('terms_service.str_34').replace(/{Melon}/g, appName)}</Text> {t('terms_service.str_35').replace(/{Melon}/g, appName)}
          </Text>

          <Text style={styles.title2Text}>
            {t('terms_service.str_36').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_37').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_38').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_39').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_40').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_41').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_42').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_43').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_44').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_45').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_46').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_47').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_48').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_49').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={[styles.normalText, styles.boldText]}>
            {t('terms_service.str_50').replace(/{Melon}/g, appName)}
          </Text>

          <Text style={styles.title2Text}>
            {t('terms_service.str_51').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_52').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_53').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={[styles.normalText, styles.boldText]}>
            {t('terms_service.str_54').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_55').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_56').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_57').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_58').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_59').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_60').replace(/{Melon}/g, appName)}
          </Text>

          <Text style={styles.title2Text}>
            {t('terms_service.str_61').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_62').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>●</Text> {t('terms_service.str_63').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>●</Text> {t('terms_service.str_64').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>●</Text> {t('terms_service.str_65').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>●</Text> {t('terms_service.str_66').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_67').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>●</Text> {t('terms_service.str_68').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>●</Text> {t('terms_service.str_69').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>●</Text> {t('terms_service.str_70').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>●</Text> {t('terms_service.str_71').replace(/{Melon}/g, appName)}
          </Text>

          <Text style={styles.title2Text}>
            {t('terms_service.str_72').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_73').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_74').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_75').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_76').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_77').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_78').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_79').replace(/{Melon}/g, appName)}
          </Text>

          <Text style={styles.title2Text}>
            {t('terms_service.str_80').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_81').replace(/{Melon}/g, appName)}
          </Text>

          <Text style={styles.title2Text}>
            {t('terms_service.str_82').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_83').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_84').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_85').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_86').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_87').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            <Text style={styles.boldText}>{t('terms_service.str_88').replace(/{Melon}/g, appName)}</Text>
            {t('terms_service.str_89').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_90').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_91').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_92').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_93').replace(/{Melon}/g, appName)}
          </Text>

          <Text style={styles.title2Text}>
            {t('terms_service.str_94').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_95').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_96').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_97').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_98').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_99').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_100').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.title3Text}>
            {t('terms_service.str_101').replace(/{Melon}/g, appName)}
          </Text>
          <Text style={styles.normalText}>
            {t('terms_service.str_102').replace(/{Melon}/g, appName)} contact@infera.cn
          </Text> */}

          {/* <View style={styles.marginTop20} />
        </ScrollView> */}
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
  htmlContainer: {
    flex: 1,
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    marginBottom: normalize(20)
  },
  agreementContainer: {
    flex: 1,
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    display: 'flex',
    flexDirection: 'column'
    // paddingVertical: normalize(20),
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

export default UserServiceAgreementScreen; 