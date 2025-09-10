import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';
import theme from '../../../utils/theme';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import CountryFlag from 'react-native-country-flag';
import { languageToCountryCode } from "@/i18n/languages"

type OfflineVoicePackageScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'OfflineVoicePackage'>;

const OfflineVoicePackageScreen: React.FC = () => {
  const navigation = useNavigation<OfflineVoicePackageScreenNavigationProp>();
  const [_selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev =>
      prev.includes(language)
        ? prev.filter(lang => lang !== language)
        : [...prev, language]
    );
  };

  // 语言显示名称到语言代码的映射
  const languageDisplayToCode: Record<string, string> = {
    '简体中文': 'zh',
    '繁體中文(臺灣)': 'zh',
    '繁體中文(香港)': 'zh',
    'English': 'en',
    'Bahasa Indonesia': 'id',
    'Bahasa Melayu': 'ms',
    'Español': 'es',
    'Italiano': 'it',
    '日本語': 'ja',
    'Português': 'pt',
    'Русский': 'ru',
    'ไทย': 'th',
    'Tiếng Việt': 'vi',
  };

  const languages = [
    '简体中文',
    '繁體中文(臺灣)',
    '繁體中文(香港)',
    'English',
    'Bahasa Indonesia',
    'Bahasa Melayu',
    'Español',
    'Italiano',
    '日本語',
    'Português',
    'Русский',
    'ไทย',
    'Tiếng Việt',
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />

      {/* 页面标题和返回按钮 */}
      <View style={styles.navBar}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Offline language packs</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image
              source={require('@/assets/main/page_return_icon.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 提示信息 */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          It is recommended to download when WiFi is connected.{'\n\n'}
          When your device is not connected to the Internet, language pack translation will be used in speaker mode, headset mode, listening mode and normal text translation.
        </Text>
      </View>

      {/* 语言包卡片 */}
      <View style={styles.languageCard}>
        {/* 语言列表区域 */}
        <View style={styles.languageListContainer}>
          <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
            {languages.map((language, index) => (
              <TouchableOpacity
                key={language}
                style={styles.languageItem}
                onPress={() => handleLanguageToggle(language)}
              >
                <View style={styles.languageContent}>
                  <View style={styles.languageContentLeft}>
                    <View style={styles.flagOutView}>
                      <CountryFlag
                        isoCode={languageToCountryCode[languageDisplayToCode[language] as keyof typeof languageToCountryCode] || 'US'}
                        size={25}
                        style={styles.flag}
                      />
                    </View>
                    <Text style={[
                      styles.languageText,
                    ]}>
                      {language}
                    </Text>
                  </View>
                  <Image source={require('@/assets/profile/download_unclick_icon.png')} style={styles.selectedIndicator} />
                </View>
                {index < languages.length - 1 && <View style={styles.divider} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 底部图标 */}
        <View style={styles.bottomIcons}>
          <Image
            source={require('../../../assets/main/right_arrow_icon.png')}
            style={styles.bottomIcon}
          />
          <Image
            source={require('../../../assets/main/right_arrow_icon.png')}
            style={styles.bottomIcon}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
    paddingHorizontal: normalize(24),
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(14),
    marginTop: normalize(12),
  },
  timeText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  signalIcon: {
    width: normalize(17),
    height: normalize(11),
    backgroundColor: '#FFFFFF',
  },
  wifiIcon: {
    width: normalize(16),
    height: normalize(11),
    backgroundColor: '#FFFFFF',
  },
  batteryIcon: {
    width: normalize(25),
    height: normalize(12),
  },
  navBar: {
    marginTop: normalize(24),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: normalize(40),
    marginTop: normalize(8),
  },
  titleText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  backButton: {
    position: 'absolute',
    left: 0,
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
  infoContainer: {
    marginTop: normalize(16),
    marginBottom: normalize(17),
  },
  infoText: {
    fontSize: normalizeFontSize(13),
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: normalize(20),
  },
  languageCard: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: normalize(12),
    overflow: 'hidden',
    width: "100%",
    position: 'relative',
    marginRight: normalize(24),
  },
  topIcon: {
    marginTop: normalize(14),
    marginLeft: normalize(16),
  },
  topArrowIcon: {
    width: normalize(20),
    height: normalize(16),
  },
  languageListContainer: {
    width: "100%",
    minHeight: normalize(500),
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    paddingVertical: normalize(8),
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
  },
  languageContentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagOutView: {
    width: normalize(20),
    height: normalize(16),
    overflow: 'hidden',
    position: 'relative'
  },
  flag: {
    width: '100%',
    height: '100%',
  },
  selectedLanguageText: {
    color: '#FFFFFF',
  },
  languageText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: '#B0B0B0',
    lineHeight: normalize(46),
    letterSpacing: -0.4,
    flex: 1,
  },
  selectedIndicator: {
    width: normalize(17),
    height: normalize(18),
    borderRadius: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(16),
  },
  selectedDot: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
    backgroundColor: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginTop: normalize(8),
  },
  bottomIcons: {
    position: 'absolute',
    left: normalize(16),
    bottom: normalize(46),
    flexDirection: 'row',
    gap: normalize(46),
  },
  bottomIcon: {
    width: normalize(20),
    height: normalize(16),
  },
});

export default OfflineVoicePackageScreen;