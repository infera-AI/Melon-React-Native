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

type VoiceprintManagementInitialScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'VoiceprintManagementInitial'>;

const VoiceprintManagementInitialScreen: React.FC = () => {
  const navigation = useNavigation<VoiceprintManagementInitialScreenNavigationProp>();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>


      {/* 页面标题和返回按钮 */}
      <View style={styles.navBar}>
        <Text style={styles.titleText}>Voiceprint recording rules</Text>
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
          <Text style={styles.contentText}>
            <Text style={styles.paragraph1}>
              Here are the rules for voiceprint recording{'\n'}
            </Text>
            <Text style={styles.paragraph2}>
              {'\n'}Article 1 Ownership of Rights {'\n'}
            </Text>
            <Text style={styles.paragraph3}>
              1.1 This Agreement is between you and Melon…{'\n'}
              {'\n'}
            </Text>
            <Text style={styles.paragraph4}>
              Article 2 Authorized Use{'\n'}
            </Text>
            <Text style={styles.paragraph5}>
              2.1{'\n'}
              3.1{'\n'}
            </Text>
            <Text style={styles.paragraph6}>
              {'\n'}
              {'\n'}
              {'\n'}
            </Text>
            <Text style={styles.copyrightText}>
              © 2025 Melon. All Rights Reserved
            </Text>
          </Text>
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
    marginLeft: normalize(40),
    marginRight: normalize(40),
    marginBottom: normalize(152),
  },
  textContent: {
    width: normalize(295),
  },
  contentText: {
    fontSize: 0,
    letterSpacing: -0.4,
    textAlign: 'left',
    lineHeight: normalize(20),
  },
  paragraph1: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 1)',
    letterSpacing: -0.4,
    lineHeight: normalize(20),
  },
  paragraph2: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 1)',
    letterSpacing: -0.4,
    lineHeight: normalize(20),
  },
  paragraph3: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: 'rgba(179, 179, 179, 1)',
    letterSpacing: -0.4,
    lineHeight: normalize(20),
  },
  paragraph4: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 1)',
    letterSpacing: -0.4,
    lineHeight: normalize(20),
  },
  paragraph5: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: 'rgba(179, 179, 179, 1)',
    letterSpacing: -0.4,
    lineHeight: normalize(20),
  },
  paragraph6: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 1)',
    letterSpacing: -0.4,
    lineHeight: normalize(20),
  },
  copyrightText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: 'rgba(179, 179, 179, 1)',
    letterSpacing: -0.4,
    lineHeight: normalize(20),
  },
});

export default VoiceprintManagementInitialScreen;
