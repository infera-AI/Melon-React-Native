import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '@/contexts/LanguageContext';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import theme from '@/utils/theme';
import { usePointsStore } from '@/store/modules/points.store';
import { POINTS_DEDUCTION } from '@/utils/constants';
import { useMessageModal } from '@/contexts/MessageModalContext';
import FullScreenLoader from '@/components/FullScreenLoader';
import {
  airwallexCreateIntent,
  applepayResultVerify
} from '@/api/profile'
import { useAppStore } from '@/store';
import ApplePayButton from '@/components/ApplePayButton';

const MyPointsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [selectedPackage, setSelectedPackage] = useState<any>({});
  const pointsBalance = usePointsStore((state) => state.pointsBalance);
  const { show } = useMessageModal();
  const [loading, setLoading] = useState(false);

  // 积分套餐数据
  const packageList = [
    {
      id: '001', // 该id和苹果后台配置的商品id对应
      title: t('translate_screen.goods_basic'),
      points: '300',
      price: 0.99,
      isHighlighted: true,
    },
    {
      id: '002',
      title: t('translate_screen.goods_create'),
      points: '700+50',
      price: 1.99,
      isHighlighted: false,
    },
    {
      id: '003',
      title: t('translate_screen.goods_producer'),
      points: '2000+250',
      price: 4.99,
      isHighlighted: false,
    },
    {
      id: '004',
      title: t('translate_screen.goods_studio'),
      points: '5000+1000',
      price: 9.99,
      isHighlighted: false,
    },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  // 购买按钮点击
  const handleBuy = async() => {
    console.log('selectedPackage---', selectedPackage);
   
    if (Platform.OS === 'android') {
      setLoading(true)
      if (selectedPackage?.id) {
        try {
          const rsp = await airwallexCreateIntent({
            amount: selectedPackage?.price
          })
          setLoading(false)
          if (rsp?.id) {
            // 创建支付意图成功
            let url = `https://sinobiz.biz/airwallex?ap_type=${useAppStore.getState().appSign}&intent_id=${rsp?.id}&client_secret=${rsp?.client_secret}`
            Linking.openURL(url);
          } else {
            show({
              message: t('response_error')
            })
          }
        } catch (error) {
          setLoading(false)
          show({
            message: t('http_service_error')
          })
        }
      } else {
        setLoading(false)
        show({
          message: t('translate_screen.select_goods')
        })
      }
    }
    
    
    // navigation.navigate('Purchase', { points: selectedPackage });
  };

  const handleDetails = () => {
    navigation.navigate('PointsDetail' as never);
  };

  const handlePackageSelect = (selectPackage: any) => {
    console.log('Selected package:', selectPackage);
    setSelectedPackage(selectPackage);
  };

  // 支付成功后的处理（关键：必须调用后端验证）
  const handleApplePaymentSuccess = async (applePayResult: any) => {
    console.log('苹果支付凭证applePayResult---', applePayResult);
    if (!applePayResult?.receipt) {
      setLoading(false)
      setTimeout(() => {
        show({
          message: t('translate_screen.failed_again')
        })
      }, 50)
      return
    }

    try {
      // 1. 将苹果返回的支付凭证发送给后端验证  只要接口200成功调用就是成功
      await applepayResultVerify({
        receipt: applePayResult?.receipt
      });
      setLoading(false)
      usePointsStore.getState().refreshPointsBalance()
    } catch (error) {
      setLoading(false)
      setTimeout(() => {
        show({
          message: t('translate_screen.apple_pay_verification_error')
        })
      }, 50)
    }
  }

  // 支付失败处理（用户取消、设备不支持等）
  const handleApplePaymentFail = (error: any) => {
    // 忽略用户主动取消的情况（可选）
    // if (error.message !== '用户取消支付') {
    //   console.log('支付失败', error.message);
      
    // }
    setLoading(false)
    // 用户取消购买，弹窗关闭时，也会触发
    console.log('支付失败', error.message);

  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>

      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('translate_screen.my_points')}</Text>
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
              <Text style={styles.remainingPointsLabel}>{t('translate_screen.have_points')}</Text>
            </View>
            <TouchableOpacity style={styles.detailsButton} onPress={handleDetails}>
              <Text style={styles.detailsButtonText}>{t('translate_screen.points_detail')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 积分套餐标题 */}
        <Text style={styles.sectionTitle}>{t('translate_screen.points_pack')}</Text>

        {/* 积分套餐卡片 */}
        <View style={styles.packageCardContainer}>
          {packageList.map((pkg, index) => (
            <TouchableOpacity
              key={pkg.id}
              style={[
                styles.packageCard,
                styles.packageCardMargin,
                selectedPackage?.id === pkg.id && styles.basicPackCard,
              ]}
              onPress={() => handlePackageSelect(pkg)}
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
                <Text style={styles.priceText}>{`$ ${pkg.price}`}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 积分规则标题 */}
        <Text style={styles.sectionTitle}>{t('translate_screen.points_rules')}</Text>

        {/* 积分规则内容 */}
        <View style={styles.rulesContainer}>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.rulesText}>1. </Text>
            <Text style={styles.rulesText}>
              {t('translate_screen.generate_song')}: 1 {t('translate_screen.time')}/{POINTS_DEDUCTION.GENERATE_MUSIC} {t('translate_screen.points')}
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.rulesText}>2. </Text>
            <Text style={styles.rulesText}>
              {t('translate_screen.generate_song')} ({t('translate_screen.use_voice')}): 1 {t('translate_screen.time')}/{POINTS_DEDUCTION.GENERATE_AND_COVER} {t('translate_screen.points')}
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.rulesText}>3. </Text>
            <Text style={styles.rulesText}>
              {t('translate_screen.voice_clone')}: 1 {t('translate_screen.time')}/{POINTS_DEDUCTION.CLONE_VOICEPRINT} {t('translate_screen.points')}
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.rulesText}>4. </Text>
            <Text style={styles.rulesText}>
              {t('translate_screen.online_trans')} ({t('translate_screen.video')}/{t('translate_screen.voice')}): 1 {t('translate_screen.minute')}/{POINTS_DEDUCTION.TRANSLATE_VIDEO} {t('translate_screen.points')}
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.rulesText}>5. </Text>
            <Text style={styles.rulesText}>
              {t('translate_screen.document_trans')}/{t('translate_screen.recordings')}/{t('translate_screen.files')}/{t('translate_screen.images')}: 1 {t('translate_screen.time')}/{POINTS_DEDUCTION.TRANSLATE_DOCUMENT} {t('translate_screen.points')}
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.rulesText}>6. </Text>
            <Text style={styles.rulesText}>
              {t('translate_screen.external_speakers')}/{t('translate_screen.simultaneous_translation')}: 100 {t('translate_screen.characters')}/{POINTS_DEDUCTION.TRANSLATE_EXTERNAL_SPEAKER} {t('translate_screen.points')}
            </Text>
          </View>
        </View>

        {/* 购买按钮 */}
        {
          Platform.OS === 'android' &&
          <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
            <Text style={styles.buyButtonText}>{t('translate_screen.buy')}</Text>
          </TouchableOpacity>
        }
        {
          Platform.OS === 'ios' &&
          <ApplePayButton
            productId={selectedPackage?.id || ''}
            beforePayCheck={() => {
              if (!selectedPackage?.id) {
                show({
                  message: t('translate_screen.select_goods')
                })
                return false
              }
              setLoading(true)
              return true
            }}
            onSuccess={handleApplePaymentSuccess}
            onFail={handleApplePaymentFail}
          />
        }


      </ScrollView>
      <FullScreenLoader
        visible={loading}
        text={t('translate_screen.loading_text')}
      />
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
