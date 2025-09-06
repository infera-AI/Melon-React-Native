import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '@/contexts/LanguageContext';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import theme from '@/utils/theme';
import { usePointsStore } from '@/store/modules/points.store';

const MyPointsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const { pointsBalance } = usePointsStore.getState();
  // 积分套餐数据
  const packageList = [
    {
      id: 'basic',
      title: 'Basic Pack',
      points: '300',
      price: '$ 0.99',
      isHighlighted: true,
    },
    {
      id: 'create',
      title: 'Create pack',
      points: '700+50',
      price: '$ 1.99',
      isHighlighted: false,
    },
    {
      id: 'producer',
      title: 'Producer Pack',
      points: '2000+250',
      price: '$ 4.99',
      isHighlighted: false,
    },
    {
      id: 'studio',
      title: 'Studio Pack',
      points: '5000+1000',
      price: '$ 9.99',
      isHighlighted: false,
    },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleBuy = () => {
    navigation.navigate('Purchase' as never);
  };

  const handleDetails = () => {
    navigation.navigate('PointsDetail' as never);
  };

  const handlePackageSelect = (packageId: string) => {
    console.log('Selected package:', packageId);
    setSelectedPackage(packageId);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>

      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My points</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image
            source={require('@/assets/main/page_return_icon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* AI Polishing 标签 */}
        {/* 剩余积分卡片 */}
        <View style={styles.remainingPointsCard}>
          <View style={styles.remainingPointsContent}>
            <View style={styles.pointsInfo}>
              <Text style={styles.remainingPointsText}>{pointsBalance}</Text>
              <Text style={styles.remainingPointsLabel}>Remaining points</Text>
            </View>
            <TouchableOpacity style={styles.detailsButton} onPress={handleDetails}>
              <Text style={styles.detailsButtonText}>Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 积分套餐标题 */}
        <Text style={styles.sectionTitle}>Points package</Text>

        {/* 积分套餐卡片 */}
        <View style={styles.packageCardContainer}>
          {packageList.map((pkg, index) => (
            <TouchableOpacity
              key={pkg.id}
              style={[
                styles.packageCard,
                styles.packageCardMargin,
                selectedPackage === pkg.id && styles.basicPackCard,
              ]}
              onPress={() => handlePackageSelect(pkg.id)}
              activeOpacity={0.7}
            >
              <View style={styles.packageContent}>
                <Text style={styles.packageTitle}>{pkg.title}</Text>
                <View style={styles.pointsContainer}>
                  <Image
                    source={require('@/assets/profile/menu_points_icon.png')}
                    style={styles.pointsIcon}
                  />
                  <Text style={styles.pointsText}>{pkg.points}</Text>
                </View>
                <Text style={styles.priceText}>{pkg.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 积分规则标题 */}
        <Text style={styles.sectionTitle}>Points rules</Text>

        {/* 积分规则内容 */}
        <View style={styles.rulesContainer}>
          <Text style={styles.rulesText}>
            Generate song: 1 time/50 points{'\n'}
            Generate song (using specified tone): 1 time/60 points{'\n'}
            Voiceprint Clone: 1 time/200 points{'\n'}
            Online translation (video/voice): 1 minute/15 points{'\n'}
            Translation of documents/recordings/files images: 1 time/5 points{'\n'}
            External speakers/headphones/simultaneous translation: 100 characters/1 point
          </Text>
        </View>

        {/* 购买按钮 */}
        <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
          <Text style={styles.buyButtonText}>Buy</Text>
        </TouchableOpacity>


      </ScrollView>
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
    marginTop: normalize(16)
  },
  aiPolishingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(50),
    marginBottom: normalize(44),
  },
  aiIcon: {
    width: normalize(18),
    height: normalize(18),
    marginRight: normalize(8),
  },
  aiPolishingText: {
    fontSize: normalizeFontSize(13),
    fontWeight: '400',
    // 使用渐变文字效果，这里用主题色代替
    color: theme.primary,
  },
  sectionTitle: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: normalize(12),
  },
  packageCardContainer: {
    marginBottom: normalize(12),
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageCard: {
    width: "48%",
    height: normalize(129),
    borderRadius: normalize(12),
    backgroundColor: '#262626',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  basicPackCard: {
    backgroundColor: 'rgba(133, 243, 128, 0.1)',
    borderWidth: 2,
    borderColor: theme.primary,
  },
  packageCardMargin: {
    marginTop: normalize(12),
  },
  packageContent: {
    flex: 1,
    padding: normalize(16),
    justifyContent: 'space-between',
  },
  packageTitle: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: theme.primary,
    textAlign: 'center',
    marginBottom: normalize(16),
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(16),
  },
  pointsIcon: {
    width: normalize(20),
    height: normalize(20),
    marginRight: normalize(8),
  },
  pointsText: {
    fontSize: normalizeFontSize(20),
    fontWeight: '500',
    color: '#F7F7F7',
    fontFamily: 'DIN-Medium',
  },
  priceText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '500',
    color: '#919191',
    textAlign: 'center',
    fontFamily: 'DIN-Medium',
  },
  rulesContainer: {
    marginBottom: normalize(24),
  },
  rulesText: {
    fontSize: normalizeFontSize(12),
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: normalize(21),
  },
  buyButton: {
    backgroundColor: theme.primary,
    borderRadius: normalize(12),
    height: normalize(48),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(24),
  },
  buyButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: 'rgba(12, 12, 13, 0.7)',
    letterSpacing: -0.4,
  },
  remainingPointsCard: {
    backgroundColor: theme.primary,
    borderRadius: normalize(12),
    height: normalize(82),
    marginBottom: normalize(24),
    overflow: 'hidden',
  },
  remainingPointsContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
  },
  pointsInfo: {
    justifyContent: 'space-between',
  },
  remainingPointsText: {
    fontSize: normalizeFontSize(30),
    fontWeight: '700',
    color: '#181819',
    fontFamily: 'DIN-Bold',
    lineHeight: normalize(30),
  },
  remainingPointsLabel: {
    fontSize: normalizeFontSize(12),
    fontWeight: '400',
    color: 'rgba(24, 24, 25, 0.6)',
    lineHeight: normalize(12),
  },
  detailsButton: {
    backgroundColor: '#262626',
    borderRadius: normalize(8),
    height: normalize(24),
    width: normalize(56),
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: normalizeFontSize(11),
    fontWeight: '400',
    color: theme.primary,
    letterSpacing: -0.4,
  },
});

export default MyPointsScreen;
