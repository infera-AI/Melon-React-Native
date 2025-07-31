import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';
import theme from '../../../utils/theme';
import { useLanguage } from '../../../contexts/LanguageContext';

const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const { width, height } = require('react-native').Dimensions.get('window');
  const scale = based === 'width' ? width / 375 : height / 812;
  return Math.round(size * scale);
};

const normalizeFontSize = (size: number) => {
  return normalize(size, 'width');
};

type AboutScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'About'>;

const AboutScreen: React.FC = () => {
  const navigation = useNavigation<AboutScreenNavigationProp>();
  const { t } = useLanguage();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleUserServiceAgreement = () => {
    console.log('Navigate to User Service Agreement');
  };

  const handlePrivacyPolicy = () => {
    console.log('Navigate to Privacy Policy');
  };

  const handleCopyrightStatement = () => {
    navigation.navigate('CopyrightStatement');
  };

  const handleWebsiteClick = () => {
    Linking.openURL('https://www.xxxxx.cn');
  };

  const handleEmailClick = () => {
    Linking.openURL('mailto:xxx@gmail.com');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image 
              source={require('../../../assets/main/page_return_icon.png')} 
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.title}>{t('about.about_melon')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.appIconContainer}>
          <Image 
            source={require('../../../assets/login/welcome_logo.png')} 
            style={styles.appIcon}
          />
        </View>

        <View style={styles.appNameContainer}>
          <Text style={styles.appName}>{t('about.melon_ai')}</Text>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>{t('about.version')}</Text>
        </View>

        <View style={styles.legalSection}>
          <TouchableOpacity 
            style={styles.legalCard} 
            onPress={handleUserServiceAgreement}
            activeOpacity={1}
          >
            <View style={styles.legalContent}>
              <View style={styles.legalLeft}>
                <Text style={styles.legalTitle}>{t('about.user_service_agreement')}</Text>
              </View>
              <View style={styles.legalRight}>
                <Image 
                  source={require('../../../assets/main/right_arrow_icon.png')} 
                  style={styles.arrowIcon}
                />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.legalCard} 
            onPress={handlePrivacyPolicy}
            activeOpacity={1}
          >
            <View style={styles.legalContent}>
              <View style={styles.legalLeft}>
                <Text style={styles.legalTitle}>{t('about.privacy_policy')}</Text>
              </View>
              <View style={styles.legalRight}>
                <Image 
                  source={require('../../../assets/main/right_arrow_icon.png')} 
                  style={styles.arrowIcon}
                />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.legalCard} 
            onPress={handleCopyrightStatement}
            activeOpacity={1}
          >
            <View style={styles.legalContent}>
              <View style={styles.legalLeft}>
                <Text style={styles.legalTitle}>{t('about.copyright_statement')}</Text>
              </View>
              <View style={styles.legalRight}>
                <Image 
                  source={require('../../../assets/main/right_arrow_icon.png')} 
                  style={styles.arrowIcon}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.contactContainer}>
          <TouchableOpacity onPress={handleWebsiteClick} activeOpacity={1}>
            <Text style={styles.contactText}>{t('about.official_website')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEmailClick} activeOpacity={1}>
            <Text style={styles.contactText}>{t('about.customer_service_email')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.copyrightContainer}>
          <Text style={styles.copyrightText}>{t('about.copyright_text')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(24),
    paddingTop: normalize(12),
    paddingBottom: normalize(20),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: normalize(16),
    height: normalize(16),
  },
  headerSpacer: {
    width: normalize(40),
  },
  title: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  appIconContainer: {
    alignItems: 'center',
    marginTop: normalize(40),
    marginBottom: normalize(16),
  },
  appIcon: {
    width: normalize(85),
    height: normalize(87),
    borderRadius: normalize(16),
  },
  appNameContainer: {
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  appName: {
    fontSize: normalizeFontSize(24),
    fontWeight: '600',
    color: '#85F380',
    textAlign: 'center',
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: normalize(40),
  },
  versionText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#B0B0B0',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  legalSection: {
    marginHorizontal: normalize(24),
    marginBottom: normalize(40),
  },
  legalCard: {
    // backgroundColor: '#262626',
    borderRadius: normalize(12),
    marginBottom: normalize(16),
    padding: normalize(16),
    borderBottomColor: theme.backgroundTertiary,
    borderBottomWidth: 1,
  },
  legalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legalLeft: {
    flex: 1,
  },
  legalTitle: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  legalRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    width: normalize(20),
    height: normalize(20),
  },
  contactContainer: {
    alignItems: 'center',
    marginBottom: normalize(20),
    paddingHorizontal: normalize(24),
  },
  contactText: {
    fontSize: normalizeFontSize(12),
    fontWeight: '400',
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: normalizeFontSize(20),
    letterSpacing: -0.4,
    marginBottom: normalize(4),
  },
  copyrightContainer: {
    alignItems: 'center',
    marginBottom: normalize(24),
  },
  copyrightText: {
    fontSize: normalizeFontSize(12),
    fontWeight: '400',
    color: '#B0B0B0',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
});

export default AboutScreen; 