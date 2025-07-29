import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';

const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const { width, height } = require('react-native').Dimensions.get('window');
  const scale = based === 'width' ? width / 375 : height / 812;
  return Math.round(size * scale);
};

const normalizeFontSize = (size: number) => {
  return normalize(size, 'width');
};

type LanguageVoiceScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'LanguageVoice'>;

const LanguageVoiceScreen: React.FC = () => {
  const navigation = useNavigation<LanguageVoiceScreenNavigationProp>();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');

  const languages = [
    { id: 'chinese', name: 'Chinese', flag: require('../../../../assets/images/flag_cn.png') },
    { id: 'english', name: 'English', flag: require('../../../../assets/images/flag_usuk.png') },
    { id: 'japanese', name: 'Japanese', flag: require('../../../../assets/images/flag_jp.png') },
    { id: 'deutsch', name: 'Deutsch', flag: require('../../../../assets/images/flag_de.png') },
    { id: 'francasis', name: 'Francasis', flag: require('../../../../assets/images/flag_fr.png') },
    { id: 'espanol', name: 'Espanol', flag: require('../../../../assets/images/flag_es.png') },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLanguageSelect = (languageId: string) => {
    setSelectedLanguage(languageId);
  };

  const handleRecordAgain = () => {
    // 重新录音逻辑
    navigation.navigate('Recording');
  };

  const handleDone = () => {
    // 完成逻辑
    navigation.navigate('GeneratingVoice');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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

      {/* 标题 */}
      <Text style={styles.title}>Generate your own voice</Text>

      {/* 主要内容 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 示例文本 */}
        <View style={styles.sampleTextContainer}>
          <Text style={styles.sampleText}>
            "Hello World!"{'\n'}
            "Glad that I can communicate with you in your voice"
          </Text>
        </View>

        {/* 语言选择网格 */}
        <View style={styles.languageGrid}>
          {languages.slice(0, 3).map((language, index) => (
            <TouchableOpacity
              key={language.id}
              style={[
                styles.languageCard,
                selectedLanguage === language.id && styles.languageCardSelected
              ]}
              onPress={() => handleLanguageSelect(language.id)}
            >
              <Image source={language.flag} style={styles.languageFlag} />
              <Text style={styles.languageName}>{language.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.languageGrid}>
          {languages.slice(3, 6).map((language, index) => (
            <TouchableOpacity
              key={language.id}
              style={[
                styles.languageCard,
                selectedLanguage === language.id && styles.languageCardSelected
              ]}
              onPress={() => handleLanguageSelect(language.id)}
            >
              <Image source={language.flag} style={styles.languageFlag} />
              <Text style={styles.languageName}>{language.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 提示文本 */}
        <Text style={styles.hintText}>click to test on different language</Text>
      </ScrollView>

      {/* 底部按钮 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.recordAgainButton} onPress={handleRecordAgain}>
          <Text style={styles.recordAgainText}>Record again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
    paddingHorizontal: normalize(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(10),
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
  title: {
    fontSize: normalizeFontSize(22),
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: normalize(20),
  },
  content: {
    flex: 1,
  },
  sampleTextContainer: {
    alignItems: 'center',
    marginBottom: normalize(20),
  },
  sampleText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: normalize(20),
  },
  languageGrid: {
    flexDirection: 'row',
    gap: normalize(12),
    marginBottom: normalize(12),
  },
  languageCard: {
    flex: 1,
    height: normalize(120),
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(20),
  },
  languageCardSelected: {
    borderWidth: normalize(3),
    borderColor: '#87ED89',
  },
  languageFlag: {
    width: normalize(70),
    height: normalize(70),
    borderRadius: normalize(35),
    marginBottom: normalize(8),
    resizeMode: 'cover',
  },
  languageName: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  hintText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: normalize(20),
  },
  buttonContainer: {
    gap: normalize(12),
    marginBottom: normalize(20),
  },
  recordAgainButton: {
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    alignItems: 'center',
  },
  recordAgainText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  doneButton: {
    backgroundColor: '#85F380',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    alignItems: 'center',
  },
  doneText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: 'rgba(12, 12, 13, 0.7)',
  },
});

export default LanguageVoiceScreen; 