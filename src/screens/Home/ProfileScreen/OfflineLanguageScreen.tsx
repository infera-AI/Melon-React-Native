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

type OfflineLanguageScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'OfflineLanguage'>;

const OfflineLanguageScreen: React.FC = () => {
  const navigation = useNavigation<OfflineLanguageScreenNavigationProp>();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

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
      
      {/* 状态栏 */}
      <View style={styles.statusBar}>
        <Text style={styles.timeText}>9:41</Text>
        <View style={styles.statusIcons}>
          {/* 这里可以添加信号、WiFi、电池图标 */}
        </View>
      </View>

      {/* 页面标题 */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Offline language packs</Text>
      </View>

      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image 
            source={require('../../../assets/main/page_return_icon.png')} 
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
        <View style={styles.headerSpacer} />
      </View>

      {/* 提示信息 */}
      <View style={styles.infoContainer}>
        <View style={styles.infoIcon}>
          <Text style={styles.infoIconText}>ℹ</Text>
        </View>
        <Text style={styles.infoText}>
          It is recommended to download while connected to WiFi.
        </Text>
      </View>

      {/* 语言包卡片 */}
      <View style={styles.languageCard}>
        {/* 顶部箭头 */}
        <View style={styles.topArrow}>
          <Image 
            source={require('../../../assets/main/right_arrow_icon.png')} 
            style={styles.arrowIcon}
          />
        </View>

        {/* 语言列表 */}
        <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
          {languages.map((language, index) => (
            <TouchableOpacity
              key={language}
              style={styles.languageItem}
              onPress={() => handleLanguageToggle(language)}
            >
              <View style={styles.languageContent}>
                <Text style={styles.languageText}>{language}</Text>
                {selectedLanguages.includes(language) && (
                  <View style={styles.selectedIndicator}>
                    <View style={styles.selectedDot} />
                  </View>
                )}
              </View>
              {index < languages.length - 1 && <View style={styles.divider} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 底部滚动指示器 */}
        <View style={styles.scrollIndicator}>
          <View style={styles.indicatorDots}>
            <View style={[styles.indicatorDot, styles.indicatorDotActive]} />
            <View style={styles.indicatorDot} />
            <View style={styles.indicatorDot} />
          </View>
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
  titleContainer: {
    marginTop: normalize(20),
    marginBottom: normalize(8),
  },
  titleText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(16),
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
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(16),
    paddingHorizontal: normalize(8),
  },
  infoIcon: {
    width: normalize(16),
    height: normalize(16),
    marginRight: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIconText: {
    fontSize: normalizeFontSize(12),
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: normalizeFontSize(13),
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    flex: 1,
    lineHeight: normalize(20),
  },
  languageCard: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    padding: normalize(16),
    flex: 1,
    marginBottom: normalize(24),
  },
  topArrow: {
    alignItems: 'flex-end',
    marginBottom: normalize(4),
  },
  arrowIcon: {
    width: normalize(20),
    height: normalize(20),
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
    paddingHorizontal: normalize(1),
  },
  languageText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: '#B0B0B0',
    lineHeight: normalize(45),
    letterSpacing: -0.4,
  },
  selectedIndicator: {
    width: normalize(16),
    height: normalize(16),
    borderRadius: normalize(8),
    backgroundColor: '#FF86D3',
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollIndicator: {
    alignItems: 'center',
    marginTop: normalize(16),
  },
  indicatorDots: {
    flexDirection: 'row',
    gap: normalize(8),
  },
  indicatorDot: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
    backgroundColor: 'rgba(255, 134, 211, 0.3)',
  },
  indicatorDotActive: {
    backgroundColor: '#FF86D3',
  },
});

export default OfflineLanguageScreen; 