import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '@/contexts/LanguageContext';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import theme from '@/utils/theme';
import { getPointsRecord } from '@/api/profile/profile';
import FullScreenLoading from '@/components/FullScreenLoader';


type recordType = {
  "time": string,
  "delta": number,
  "reason": string,
  "detail": string
}

const PointsDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();

  // 展开/收起状态
  const [isRechargeExpanded, setIsRechargeExpanded] = useState(true);
  const [isUsageExpanded, setIsUsageExpanded] = useState(true);
  const [isAwardExpanded, setIsAwardExpanded] = useState(true);
  const [dataTypes, setDataTypes] = useState({
    award: [] as recordType[],
    usage: [] as recordType[],
    recharge: [] as recordType[],
  })
  const [rechargeTotal, setRechargeTotal] = useState(0)
  const [usageTotal, setUsageTotal] = useState(0)
  const [awardTotal, setAwardTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  // 动画值 - 使用useRef保持引用
  const rechargeAnimation = useRef(new Animated.Value(1)).current;
  const usageAnimation = useRef(new Animated.Value(1)).current;
  const awardAnimation = useRef(new Animated.Value(1)).current;

  // 充值记录数据
  const rechargeRecords: recordType[] = [
    {
      id: '1',
      title: 'Base Package',
      date: '2025-09-01',
      points: '+300',
    },
    {
      id: '2',
      title: 'Base Package',
      date: '2025-09-01',
      points: '+300',
    },
  ];

  // 使用记录数据
  const usageRecords = [
    {
      id: '1',
      title: 'Song generation',
      date: '2025-09-01',
      points: '50',
    },
    {
      id: '2',
      title: 'Voiceprint Clone',
      date: '2025-09-01',
      points: '80',
    },
    {
      id: '3',
      title: 'Online translation',
      date: '2025-09-01',
      points: '200',
    },
    {
      id: '4',
      title: 'Voiceprint Clone',
      date: '2025-09-01',
      points: '300',
    },
  ];

  // 奖励记录数据
  const awardRecords = [
    {
      id: '1',
      title: 'User invitation',
      date: '2025-09-01',
      points: '+50',
    },
    {
      id: '2',
      title: 'User invitation',
      date: '2025-09-01',
      points: '+80',
    },
    {
      id: '3',
      title: 'User invitation',
      date: '2025-09-01',
      points: '+200',
    },
    {
      id: '4',
      title: 'First registration',
      date: '2025-09-01',
      points: '+300',
    },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  // 处理充值记录展开/收起
  const handleRechargeToggle = () => {
    console.log('Recharge toggle pressed, current state:', isRechargeExpanded);
    setIsRechargeExpanded(!isRechargeExpanded);
    Animated.timing(rechargeAnimation, {
      toValue: isRechargeExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // 处理使用记录展开/收起
  const handleUsageToggle = () => {
    console.log('Usage toggle pressed, current state:', isUsageExpanded);
    setIsUsageExpanded(!isUsageExpanded);
    Animated.timing(usageAnimation, {
      toValue: isUsageExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // 处理奖励记录展开/收起
  const handleAwardToggle = () => {
    console.log('Award toggle pressed, current state:', isAwardExpanded);
    setIsAwardExpanded(!isAwardExpanded);
    Animated.timing(awardAnimation, {
      toValue: isAwardExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // 获取积分记录
  const getPointsRecordRequest = async () => {
    setLoading(true)
    const res = await getPointsRecord();
    const RecordTypes = {
      award: [] as recordType[],
      usage: [] as recordType[],
      recharge: [] as recordType[],
    }
    let rechargeTotal = 0
    let usageTotal = 0
    let awardTotal = 0
    const list = res
    list.forEach((item: recordType) => {
      if (item.reason === 'Award record') {
        RecordTypes.award.push(item)
        awardTotal += item.delta
      }

      if (item.reason === 'Usage Record') {
        RecordTypes.usage.push(item)
        usageTotal += item.delta
      }

      if (item.reason === 'Recharge Record') {
        RecordTypes.recharge.push(item)
        rechargeTotal += item.delta
      }
    })
    setDataTypes(RecordTypes)
    console.log('res-----', res);
    setRechargeTotal(rechargeTotal)
    setUsageTotal(usageTotal)
    setAwardTotal(awardTotal)
    setLoading(false)
  };

  useEffect(() => {
    getPointsRecordRequest();
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>

      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Points Details</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image
            source={require('@/assets/main/page_return_icon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* 充值记录卡片 */}
        <View style={styles.recordCard}>
          <View style={styles.recordHeader}>
            <Text style={styles.recordTitle}>Recharge record</Text>
            <TouchableOpacity
              style={styles.recordSummary}
              onPress={handleRechargeToggle}
              activeOpacity={0.7}
            >
              <View style={styles.recordTextGroup}>
                <Text style={styles.recordValueSecondary}>Total recharge {rechargeTotal}</Text>
              </View>
              <Animated.View style={styles.recordIconContainer}>
                {isRechargeExpanded ? (
                  <Image
                    source={require('@/assets/profile/points_dropup_icon.png')}
                    style={styles.recordIcon}
                  />
                ) : (
                  <Image
                    source={require('@/assets/profile/points_dropdown_icon.png')}
                    style={styles.recordIcon}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* 充值记录列表 */}
          <Animated.View
            style={{
              maxHeight: rechargeAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 200],
              }),
              opacity: rechargeAnimation,
              overflow: 'hidden',
            }}
          >
            {dataTypes.recharge.map((record) => (
              <View key={record.time} style={styles.recordItem}>
                <View style={styles.recordItemContent}>
                  <Text style={styles.recordItemTitle}>{record.detail}</Text>
                  <Text style={styles.recordItemDate}>{record.time}</Text>
                </View>
                <Text style={styles.recordItemPoints}>{record.delta}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* 使用记录卡片 */}
        <View style={styles.recordCard}>
          <View style={styles.recordHeader}>
            <Text style={styles.recordTitle}>Usage record</Text>
            <TouchableOpacity
              style={styles.recordSummary}
              onPress={handleUsageToggle}
              activeOpacity={0.7}
            >
              <Text style={styles.recordValueSecondary}>Total consumption {usageTotal}</Text>
              <Animated.View style={styles.recordIconContainer}>
                {isUsageExpanded ? (
                  <Image
                    source={require('@/assets/profile/points_dropup_icon.png')}
                    style={styles.recordIcon}
                  />
                ) : (
                  <Image
                    source={require('@/assets/profile/points_dropdown_icon.png')}
                    style={styles.recordIcon}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* 使用记录列表 */}
          <Animated.View
            style={{
              maxHeight: usageAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 300],
              }),
              opacity: usageAnimation,
              overflow: 'hidden',
            }}
          >
            {dataTypes.usage.map((record) => (
              <View key={record.time} style={styles.recordItem}>
                <View style={styles.recordItemContent}>
                  <Text style={styles.recordItemTitle}>{record.detail}</Text>
                  <Text style={styles.recordItemDate}>{record.time}</Text>
                </View>
                <Text style={styles.recordItemPointsUsage}>{record.delta}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* 奖励记录卡片 */}
        <View style={styles.recordCard}>
          <View style={styles.recordHeader}>
            <Text style={styles.recordTitle}>Award record</Text>
            <TouchableOpacity
              style={styles.recordSummary}
              onPress={handleAwardToggle}
              activeOpacity={0.7}
            >
              <Text style={styles.recordValueSecondary}>Total reward {awardTotal}</Text>
              <Animated.View style={styles.recordIconContainer}>
                {isAwardExpanded ? (
                  <Image
                    source={require('@/assets/profile/points_dropup_icon.png')}
                    style={styles.recordIcon}
                  />
                ) : (
                  <Image
                    source={require('@/assets/profile/points_dropdown_icon.png')}
                    style={styles.recordIcon}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* 奖励记录列表 */}
          <Animated.View
            style={{
              maxHeight: awardAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 300],
              }),
              opacity: awardAnimation,
              overflow: 'hidden',
            }}
          >
            {dataTypes.award.map((record) => (
              <View key={record.time} style={styles.recordItem}>
                <View style={styles.recordItemContent}>
                  <Text style={styles.recordItemTitle}>{record.detail}</Text>
                  <Text style={styles.recordItemDate}>{record.time}</Text>
                </View>
                <Text style={styles.recordItemPoints}>{record.delta}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

      </ScrollView>
      <FullScreenLoading visible={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: normalize(24),
    paddingVertical: normalize(16),
    position: 'relative',
  },
  headerTitle: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
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
  content: {
    flex: 1,
    paddingHorizontal: normalize(24),
    marginTop: normalize(16),
  },
  recordCard: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    marginBottom: normalize(16),
    overflow: 'hidden',
    paddingBottom: normalize(12),
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingTop: normalize(16),
    paddingBottom: normalize(12),
  },
  recordTitle: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  recordSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: normalize(40), // 确保有足够的点击区域
    paddingVertical: normalize(8), // 增加垂直内边距
  },
  recordTextGroup: {
    alignItems: 'flex-end',
    marginRight: normalize(8),
  },
  recordLabel: {
    fontSize: normalizeFontSize(13),
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: normalize(16),
  },
  recordValue: {
    fontSize: normalizeFontSize(13),
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'DIN-Medium',
    letterSpacing: -0.4,
    lineHeight: normalize(16),
  },
  recordValueSecondary: {
    fontSize: normalizeFontSize(13),
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: -0.4,
    lineHeight: normalize(16),
    marginRight: normalize(8),
  },
  recordIcon: {
    width: normalize(16),
    height: normalize(16),
  },
  recordIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    backgroundColor: '#262626',
    marginHorizontal: normalize(16),
    marginBottom: normalize(12),
  },
  recordItemContent: {
    justifyContent: 'space-between',
  },
  recordItemTitle: {
    fontSize: normalizeFontSize(13),
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: normalize(16),
  },
  recordItemDate: {
    fontSize: normalizeFontSize(12),
    fontWeight: '400',
    color: '#B0B0B0',
    fontFamily: 'DIN-Regular',
    letterSpacing: -0.4,
    lineHeight: normalize(16),
    marginTop: normalize(4),
  },
  recordItemPoints: {
    fontSize: normalizeFontSize(13),
    fontWeight: '500',
    color: theme.primary,
    fontFamily: 'DIN-Medium',
    letterSpacing: -0.4,
    lineHeight: normalize(16),
  },
  recordItemPointsUsage: {
    fontSize: normalizeFontSize(13),
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'DIN-Medium',
    letterSpacing: -0.4,
    lineHeight: normalize(16),
  },
});

export default PointsDetailScreen;
