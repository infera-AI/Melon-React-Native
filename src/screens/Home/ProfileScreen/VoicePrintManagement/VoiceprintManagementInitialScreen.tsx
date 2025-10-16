import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../ProfileNavigator';

import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/contexts/LanguageContext';
import { scaleSize } from '@/utils/scale';

type VoiceprintManagementInitialScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'VoiceprintManagementInitial'>;

const VoiceprintManagementInitialScreen: React.FC = () => {
  const navigation = useNavigation<VoiceprintManagementInitialScreenNavigationProp>();
  const { t } = useLanguage();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>


      {/* 页面标题和返回按钮 */}
      <View style={styles.navBar}>
        <Text style={styles.titleText}>{t('music.voiceprint_recording_rules')}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image
            source={require('@/assets/main/page_return_icon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
      </View>

      {/* 主要内容 */}
      <ScrollView style={styles.contentWrapper} showsVerticalScrollIndicator={false}>
        <View style={styles.textContent}>
          <View>
            <Text style={styles.ruleTitle}>
              {t('music.voiceprint_rules_str1')}
            </Text>
            <Text style={styles.ruleDesc}>
              {t('music.voiceprint_rules_str2')}
            </Text>
          </View>

          <View style={{marginTop: scaleSize(14)}}>
            <Text style={styles.ruleTitle}>
              {t('music.voiceprint_rules_str3')}
            </Text>
            <Text style={styles.ruleDesc}>
              {t('music.voiceprint_rules_str4')}
            </Text>
          </View>

          <View style={{marginTop: scaleSize(14)}}>
            <Text style={styles.ruleTitle}>
              {t('music.voiceprint_rules_str5')}
            </Text>
            <Text style={styles.ruleDesc}>
              {t('music.voiceprint_rules_str6')}
            </Text>
            <Text style={styles.ruleDesc}>
              {t('music.voiceprint_rules_str7')}
            </Text>
            <Text style={styles.ruleDesc}>
              {t('music.voiceprint_rules_str8')}
            </Text>
          </View>

          <View style={{marginTop: scaleSize(14)}}>
            <Text style={styles.ruleTitle}>
              {t('music.voiceprint_rules_str9')}
            </Text>
            <Text style={styles.ruleDesc}>
              {t('music.voiceprint_rules_str10')}
            </Text>
            <Text style={styles.ruleDesc}>
              {t('music.voiceprint_rules_str11')}
            </Text>
          </View>

          <View style={{marginTop: scaleSize(14)}}>
            <Text style={styles.ruleTitle}>
              {t('music.voiceprint_rules_str12')}
            </Text>
            <Text style={styles.ruleDesc}>
              {t('music.voiceprint_rules_str13')}
            </Text>
            <Text style={styles.ruleDesc}>
              {t('music.voiceprint_rules_str14')}
            </Text>
            <Text style={styles.ruleDesc}>
              {t('music.voiceprint_rules_str15')}
            </Text>
          </View>

          <View style={{marginTop: scaleSize(14)}}>
            <Text style={styles.ruleTitle}>
              {t('music.voiceprint_rules_str16')}
            </Text>
            <Text style={styles.ruleDesc}>
              {t('music.voiceprint_rules_str17')}
            </Text>
            <Text style={styles.ruleDesc}>
              {t('music.voiceprint_rules_str18')}
            </Text>
          </View>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(24, 24, 25, 1)',
    position: 'relative',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: normalize(300),
    height: normalize(20),
    marginTop: normalize(17),
    marginLeft: normalize(38),
  },
  timeText: {
    width: normalize(31),
    height: normalize(20),
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 1)',
    letterSpacing: -0.4,
    textAlign: 'center',
    lineHeight: normalize(20),
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalIcon: {
    width: normalize(17),
    height: normalize(11),
    backgroundColor: 'rgba(255, 255, 255, 1)',
    marginRight: normalize(5),
  },
  wifiIcon: {
    width: normalize(16),
    height: normalize(11),
    backgroundColor: 'rgba(255, 255, 255, 1)',
    marginRight: normalize(4),
  },
  batteryIcon: {
    width: normalize(25),
    height: normalize(12),
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: normalize(40),
    marginTop: normalize(17),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: normalize(276),
    height: normalize(40),
  },
  backButton: {
    position: 'absolute',
    left: normalize(24),
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
  titleText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: normalize(21),
  },
  contentWrapper: {
    flex: 1,
    marginTop: normalize(28),
    marginHorizontal: normalize(20),
  },
  textContent: {
    // width: normalize(295),
  },
  ruleTitle: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 1)',
    lineHeight: normalize(22),
  },
  ruleDesc: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: 'rgba(179, 179, 179, 1)',
    lineHeight: normalize(22),
    marginTop: scaleSize(6),
  }
});

export default VoiceprintManagementInitialScreen;
