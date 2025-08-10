import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';
import { supportedLanguages } from '../../../i18n/languages';
import { useLanguage } from '../../../contexts/LanguageContext';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';

type SystemLanguageScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'SystemLanguage'>;

interface Language {
  id: string;
  name: string;
  nativeName: string;
}

const SystemLanguageScreen: React.FC = () => {
  const navigation = useNavigation<SystemLanguageScreenNavigationProp>();
  const { language, setLanguage } = useLanguage();
  const { t } = useLanguage();


  // 获取当前选中的语言信息
  const currentLanguage = supportedLanguages.find(lang => lang.code === language) || supportedLanguages[0];

  const languages: Language[] = [
    { id: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
    { id: 'zh-TW', name: '繁體中文(臺灣)', nativeName: '繁體中文(臺灣)' },
    { id: 'zh-HK', name: '繁體中文(香港)', nativeName: '繁體中文(香港)' },
    { id: 'en', name: 'English', nativeName: 'English' },
    { id: 'id', name: 'Bahasa Indonesia', nativeName: 'Bahasa Indonesia' },
    { id: 'ms', name: 'Bahasa Melayu', nativeName: 'Bahasa Melayu' },
    { id: 'es', name: 'Español', nativeName: 'Español' },
    { id: 'ko', name: '한국어', nativeName: '한국어' },
    { id: 'it', name: 'Italiano', nativeName: 'Italiano' },
    { id: 'ja', name: '日本語', nativeName: '日本語' },
    { id: 'pt', name: 'Português', nativeName: 'Português' },
    { id: 'ru', name: 'Русский', nativeName: 'Русский' },
    { id: 'th', name: 'ไทย', nativeName: 'ไทย' },
    { id: 'vi', name: 'Tiếng Việt', nativeName: 'Tiếng Việt' },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLanguageSelect = (languageId: string) => {
    setLanguage(languageId as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image 
            source={require('../../../assets/main/page_return_icon.png')} 
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{t('system_language.system_language_selection')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Language List Card */}
      <View style={styles.languageCard}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {supportedLanguages.map((language, index) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageItem,
              ]}
              onPress={() => handleLanguageSelect(language.code)}
            >
              <View style={styles.languageContent}>
                <Text style={[
                  styles.languageText,
                ]}>
                   {t(`languageNames.${language.code}`)}
                </Text>
                {currentLanguage.code === language.code && (
                  <View style={styles.checkIcon}>
                    <Image 
                      source={require('../../../assets/profile/profile_langguage_selected.png')} 
                      style={styles.checkIconImage}
                    />
                  </View>
                )}
              </View>
              {index < supportedLanguages.length - 1 && <View style={styles.divider} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
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
  languageCard: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    marginHorizontal: normalize(24),
    marginTop: normalize(16),
    flex: 1,
    marginBottom: normalize(20),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: normalize(16),
  },
  languageItem: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
  },
  selectedLanguageItem: {
    backgroundColor: 'rgba(255, 134, 211, 0.1)',
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: '#B0B0B0',
    lineHeight: normalizeFontSize(45),
    letterSpacing: -0.4,
  },
  selectedLanguageText: {
    color: '#FFFFFF',
  },
  checkIcon: {
    width: normalize(20),
    height: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconImage: {
    width: normalize(20),
    height: normalize(20),
  },
  divider: {
    flex:1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  infoContainer: {
    position: 'absolute',
    bottom: normalize(16),
    left: normalize(16),
    width: normalize(16),
    height: normalize(16),
  },
  infoIcon: {
    width: normalize(16),
    height: normalize(16),
    tintColor: '#FFFFFF',
  },
});

export default SystemLanguageScreen; 