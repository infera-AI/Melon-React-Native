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
import theme from '@/utils/theme';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';

type VoiceprintManagementInitialScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'VoiceprintManagementInitial'>;

const VoiceprintManagementInitialScreen: React.FC = () => {
  const navigation = useNavigation<VoiceprintManagementInitialScreenNavigationProp>();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCreate = () => {
    console.log('Create voiceprint');
    navigation.navigate('VoiceprintManagementList' as any);
  };

  return (
    <View style={styles.container}>

      {/* 页面标题和返回按钮 */}
      <View style={styles.navBar}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Voiceprint Management</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image 
              source={require('@/assets/main/page_return_icon.png')} 
              style={styles.backIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 主要内容卡片 */}
      <ScrollView style={styles.contentCard} showsVerticalScrollIndicator={false}>
        {/* 重要提示标题 */}
        <Text style={styles.importantTitle}>Important: Cancel your account</Text>
        
        {/* 风险项目1 */}
        <Text style={styles.riskTitle}>Risk item 1:</Text>
        <Text style={styles.riskContent}>
          Account data will be permanently deleted and cannot be recovered
        </Text>
        
        {/* 风险项目2 */}
        <Text style={styles.riskTitle}>Risk item 2:</Text>
        <Text style={styles.riskContent}>
          You will no longer be able to use this account to log in to T1 and all related services
        </Text>
        
        {/* 风险项目3 */}
        <View style={styles.riskGroup}>
          <Text style={styles.riskTitle}>Risk item 3:</Text>
          <Text style={styles.riskContent}>
            The third-party binding associated with the account will be automatically released
          </Text>
        </View>
        
        {/* 注意事项 */}
        <View style={styles.noticeGroup}>
          <Text style={styles.noticeTitle}>Please be sure to check before canceling</Text>
          <Text style={styles.noticeContent}>
            1. You have backed up all important conversation records and knowledge base content.{'\n'}
            2. You have unbound all important third-party accounts in case you cannot log in in the future.{'\n'}
            3. You are fully aware of the full consequences of cancellation
          </Text>
        </View>
      </ScrollView>

      {/* 创建按钮 */}
      {/* <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createButtonText}>Create</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
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
    marginBottom: normalize(17),
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
  contentCard: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: normalize(12),
    width: "100%",
    height: normalize(700),
    marginTop: normalize(-1),
    paddingHorizontal: normalize(17),
    paddingTop: normalize(16),
  },
  importantTitle: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#B0B0B0',
    letterSpacing: -0.4,
    lineHeight: normalize(20),
    marginBottom: normalize(15),
  },
  riskTitle: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: normalize(20),
    marginTop: normalize(15),
    marginBottom: normalize(7),
  },
  riskContent: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#B0B0B0',
    letterSpacing: -0.4,
    lineHeight: normalize(20),
    marginLeft: normalize(1),
    marginBottom: normalize(13),
  },
  riskGroup: {
    marginTop: normalize(73),
    marginBottom: normalize(56),
  },
  noticeGroup: {
    marginBottom: normalize(46),
  },
  noticeTitle: {
    fontSize: normalizeFontSize(15),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: normalize(20),
    marginBottom: normalize(9),
  },
  noticeContent: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#B0B0B0',
    letterSpacing: -0.4,
    lineHeight: normalize(20),
    width: normalize(275),
  },
  createButton: {
    backgroundColor: theme.primary,
    borderRadius: normalize(12),
    height: normalize(48),
    width: "100%",
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(21),
    marginBottom: normalize(5),
  },
  createButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: theme.background,
    letterSpacing: -0.4,
    lineHeight: normalize(21),
  },
});

export default VoiceprintManagementInitialScreen;
