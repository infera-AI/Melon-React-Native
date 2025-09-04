import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../ProfileNavigator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import theme from '@/utils/theme';

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
          Upload training
        </Text>
      </View>

      {/* 成功图标 */}
      <View style={styles.successIconContainer}>
        <Image
          source={require('@/assets/main/success_big_icon.png')}
          style={styles.successIcon}
          resizeMode="contain"
        />
      </View>

      {/* 文本内容 */}
      <View style={styles.textContainer}>
        <Text style={[styles.successTitle, text]}>
          Upload successfully
        </Text>
        <Text style={[styles.successDescription, textSecondary]}>
          expected training time is 1 hour Please check in the voiceprint management later
        </Text>
      </View>

      {/* 按钮 */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={handleIKnow}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, { color: '#3E3E3E' }]}>
          I know
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
    paddingHorizontal: normalize(24),
    paddingTop: normalize(17),
    paddingBottom: normalize(10),
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
  },
  signalIcon: {
    width: normalize(17),
    height: normalize(11),
    backgroundColor: '#FFFFFF',
    marginRight: normalize(5),
  },
  wifiIcon: {
    width: normalize(16),
    height: normalize(11),
    backgroundColor: '#FFFFFF',
    marginRight: normalize(5),
  },
  batteryIcon: {
    width: normalize(25),
    height: normalize(12),
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(24),
    marginTop: normalize(20),
    height: normalize(103),
  },
  iconContainer: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    width: normalize(16),
    height: normalize(16),
  },
  headerText: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: normalize(12),
    letterSpacing: -0.4,
  },
  successIconContainer: {
    alignItems: 'center',
    marginTop: normalize(66),
  },
  successIcon: {
    width: normalize(53),
    height: normalize(53),
    borderRadius: normalize(26.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: normalizeFontSize(24),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  textContainer: {
    paddingHorizontal: normalize(80),
    alignItems: 'center',
    marginTop: normalize(20),
  },
  successTitle: {
    fontSize: normalizeFontSize(24),
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: normalize(8),
  },
  successDescription: {
    fontSize: normalizeFontSize(16),
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: normalize(21),
    opacity: 0.8,
  },
  button: {
    height: normalize(74),
    borderRadius: normalize(50),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: normalize(24),
    marginTop: normalize(94),
    marginBottom: normalize(308),
  },
  buttonText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#3E3E3E',
    letterSpacing: -0.4,
  },
});

export default VoiceprintTrainingSuccessScreen;
