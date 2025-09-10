import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import theme from '@/utils/theme';

const PurchaseScreen: React.FC = ({ route }: any) => {
  const navigation = useNavigation();
  const [selectedPackage, setSelectedPackage] = useState(route.params.points);
  const [selectedPayment, setSelectedPayment] = useState('melon');

  const packages = [
    { id: '300', points: '300', price: '$0.99' },
    { id: '700+50', points: '750', price: '$1.99' },
    { id: '2000+250', points: '2250', price: '$4.99' },
    { id: '5000+1000', points: '6000', price: '$12.99' },
  ];

  const handleBack = () => navigation.goBack();
  const handleConfirm = () => console.log('Purchase confirmed');

  return (
    <LinearGradient
      colors={['#85F380', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My points</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image source={require('@/assets/main/page_return_icon.png')} style={styles.backIcon} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.packagesContainer}>
            {/* 第一行套餐 */}
            <View style={styles.packageRow}>
              {packages.slice(0, 3).map((pkg) => (
                <TouchableOpacity
                  key={pkg.id}
                  style={styles.packageCard}
                  onPress={() => setSelectedPackage(pkg.id)}
                >
                  {selectedPackage === pkg.id ? (
                    <LinearGradient
                      colors={['#85F380', '#FFFFFF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0.3, y: 1 }}
                      style={[styles.packageCard, styles.selectedCard]}
                    >
                      <View style={styles.packageContent}>
                        <View style={styles.pointsContainer}>
                          <Text style={styles.pointsText}>{pkg.points}</Text>
                          <Text style={styles.pointsLabel}>point</Text>
                        </View>
                        <Text style={styles.selectedPriceText}>
                          {pkg.price}
                        </Text>
                      </View>
                    </LinearGradient>
                  ) : (
                    <View style={styles.packageContent}>
                      <View style={styles.pointsContainer}>
                        <Text style={styles.pointsText}>{pkg.points}</Text>
                        <Text style={styles.pointsLabel}>point</Text>
                      </View>
                      <Text style={styles.unselectedPriceText}>
                        {pkg.price}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* 第二行套餐 */}
            <View style={styles.packageRow}>
              {packages.slice(3, 6).map((pkg) => (
                <TouchableOpacity
                  key={pkg.id}
                  style={styles.packageCard}
                  onPress={() => setSelectedPackage(pkg.id)}
                >
                  {selectedPackage === pkg.id ? (
                    <LinearGradient
                      colors={['#85F380', '#FFFFFF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0.3, y: 1 }}
                      style={[styles.packageCard, styles.selectedCard]}
                    >
                      <View style={styles.packageContent}>
                        <View style={styles.pointsContainer}>
                          <Text style={styles.pointsText}>{pkg.points}</Text>
                          <Text style={styles.pointsLabel}>point</Text>
                        </View>
                        <Text style={styles.selectedPriceText}>
                          {pkg.price}
                        </Text>
                      </View>
                    </LinearGradient>
                  ) : (
                    <View style={styles.packageContent}>
                      <View style={styles.pointsContainer}>
                        <Text style={styles.pointsText}>{pkg.points}</Text>
                        <Text style={styles.pointsLabel}>point</Text>
                      </View>
                      <Text style={styles.unselectedPriceText}>
                        {pkg.price}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.paymentContainer}>
            <Text style={styles.paymentTitle}>Choose payment</Text>
            <TouchableOpacity style={styles.paymentRow} onPress={() => setSelectedPayment('melon')}>
              <View style={styles.paymentIconContainer}>
                <Image source={require('@/assets/profile/melon_pay_icon.png')} style={styles.paymentIcon} />
                <Text style={styles.paymentName}>Melon Pay</Text>
              </View>
              {selectedPayment === 'melon' ? <Image source={require('@/assets/profile/points_selected_icon.png')} style={styles.radio} /> : <View style={styles.radio} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.paymentRow} onPress={() => setSelectedPayment('apple')}>
              <View style={styles.paymentIconContainer}>
                <Image source={require('@/assets/profile/apple_pay_icon.png')} style={styles.paymentIcon} />
                <Text style={styles.paymentName}>Apple Pay</Text>
              </View>
              {selectedPayment === 'apple' ? <Image source={require('@/assets/profile/points_selected_icon.png')} style={styles.radio} /> : <View style={styles.radio} />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Confirm Purchase</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
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
    color: '#181819',
  },
  backButton: {
    position: 'absolute',
    left: normalize(24),
    width: normalize(40),
    height: normalize(40),
    backgroundColor: 'transparent',
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { width: normalize(16), height: normalize(16), tintColor: theme.background },
  content: { flex: 1, paddingHorizontal: normalize(24) },
  packagesContainer: { marginTop: normalize(24) },
  packageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(16),
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(13),
    width: normalize(101),
    height: normalize(60),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    // 渐变背景由LinearGradient提供
  },
  packageContent: {
    alignItems: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(2),
  },
  pointsText: {
    fontSize: normalizeFontSize(20),
    fontWeight: '500',
    color: '#424242',
    fontFamily: 'DIN-Medium',
  },
  pointsLabel: {
    fontSize: normalizeFontSize(14),
    fontWeight: '500',
    color: '#424242',
    fontFamily: 'DIN-Medium',
  },
  priceText: {
    fontSize: normalizeFontSize(13),
    fontWeight: '500',
    fontFamily: 'DIN-Medium',
    marginTop: normalize(2),
  },
  selectedPriceText: {
    color: '#333333',
  },
  unselectedPriceText: {
    color: '#919191',
  },
  paymentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(13),
    padding: normalize(18),
    marginTop: normalize(24),
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  paymentTitle: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: 'rgba(66, 66, 66, 0.8)',
    marginBottom: normalize(24),
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(24),
  },
  paymentIcon: {
    width: normalize(22),
    height: normalize(22),
    marginRight: normalize(8)
  },
  paymentIconContainer: { flexDirection: 'row', alignItems: 'center' },
  paymentName: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: '#333333',
  },
  radio: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: '#E2E2E2',
    backgroundColor: '#F5F5F5',
  },
  radioSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primary,
  },
  confirmButton: {
    backgroundColor: theme.primary,
    borderRadius: normalize(12),
    height: normalize(48),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(24),
    marginBottom: normalize(40),
  },
  confirmText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: 'rgba(12, 12, 13, 0.7)',
  },
});

export default PurchaseScreen;
