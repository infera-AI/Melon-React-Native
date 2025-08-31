import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../ProfileNavigator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';

type VoiceprintTrainingSuccessScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'VoiceprintTrainingSuccess'
>;

const VoiceprintTrainingSuccessScreen: React.FC = () => {
  const navigation = useNavigation<VoiceprintTrainingSuccessScreenNavigationProp>();
  const { t } = useLanguage();
  const { text, textSecondary, bg } = useGlobalTheme();

  const handleIKnow = () => {
    // 返回声纹管理页面
    navigation.navigate('VoiceprintManagementList');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      {/* 标题区域 */}
      <View style={styles.headerContainer}>
        <View style={styles.iconContainer}>
          <Image
            source={require('@/assets/main/page_return_icon.png')}
            style={styles.uploadIcon}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.headerText, text]}>
          {t('voiceprint.upload_training')}
        </Text>
      </View>

      {/* 成功图标 */}
      <View style={styles.successIconContainer}>
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      </View>

      {/* 文本内容 */}
      <View style={styles.textContainer}>
        <Text style={[styles.successTitle, text]}>
          {t('voiceprint.upload_successfully')}
        </Text>
        <Text style={[styles.successDescription, textSecondary]}>
          {t('voiceprint.expected_training_time')}
          {'\n'}
          {t('voiceprint.check_voiceprint_management')}
        </Text>
      </View>

      {/* 按钮 */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#36F279' }]}
        onPress={handleIKnow}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, { color: '#3E3E3E' }]}>
          {t('voiceprint.i_know')}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 17,
    paddingBottom: 10,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalIcon: {
    width: 17,
    height: 11,
    backgroundColor: '#FFFFFF',
    marginRight: 5,
  },
  wifiIcon: {
    width: 16,
    height: 11,
    backgroundColor: '#FFFFFF',
    marginRight: 5,
  },
  batteryIcon: {
    width: 25,
    height: 12,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
    height: 103,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#3E3E3E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    width: 16,
    height: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
    letterSpacing: -0.4,
  },
  successIconContainer: {
    alignItems: 'center',
    marginTop: 66,
  },
  successIcon: {
    width: 53,
    height: 53,
    backgroundColor: '#36F279',
    borderRadius: 26.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 21,
    opacity: 0.8,
  },
  button: {
    height: 74,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 94,
    marginBottom: 308,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3E3E3E',
    letterSpacing: -0.4,
  },
});

export default VoiceprintTrainingSuccessScreen;
