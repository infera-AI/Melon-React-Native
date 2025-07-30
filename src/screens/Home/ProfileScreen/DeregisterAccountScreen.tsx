import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';
import theme from '../../../utils/theme';

const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const { width, height } = require('react-native').Dimensions.get('window');
  const scale = based === 'width' ? width / 375 : height / 812;
  return Math.round(size * scale);
};

const normalizeFontSize = (size: number) => {
  return normalize(size, 'width');
};

type DeregisterAccountScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'DeregisterAccount'>;

const DeregisterAccountScreen: React.FC = () => {
  const navigation = useNavigation<DeregisterAccountScreenNavigationProp>();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleConfirmDeregister = () => {
    navigation.navigate('DeregisterVerification');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image 
            source={require('../../../assets/main/page_return_icon.png')} 
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Cancel your account</Text>
        <View style={styles.headerSpacer} />
      </View>

        {/* 主要内容卡片 */}
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Important: Cancel your account</Text>
          
          <Text style={styles.riskItem}>Risk item 1:</Text>
          <Text style={styles.cardText}>
            Account data will be permanently deleted and cannot be recovered
          </Text>
          
          <Text style={styles.riskItem}>Risk item 2:</Text>
          <Text style={styles.cardText}>
            You will no longer be able to use this account to log in to T1 and all related services
          </Text>
          
          <Text style={styles.riskItem}>Risk item 3:</Text>
          <Text style={styles.cardText}>
            The third-party binding associated with the account will be automatically released
          </Text>
          
            <Text style={styles.riskItem}>Please be sure to check before canceling</Text>
            <Text style={styles.cardText}>
              1. You have backed up all important conversation records and knowledge base content.{'\n'}
              2. You have unbound all important third-party accounts in case you cannot log in in the future.{'\n'}
              3. You are fully aware of the full consequences of cancellation
            </Text>
        </View>

      </ScrollView>

      {/* 底部确认按钮 */}
      <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.cancelButton} onPress={handleConfirmDeregister}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmDeregister}>
          <Text style={styles.confirmButtonText}>OK</Text>
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
  scrollView: {
    flex: 1,
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
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  mainCard: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    padding: normalize(16),
    marginBottom: normalize(20),
  },
  cardTitle: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#B0B0B0',
    marginBottom: normalize(15),
  },
  riskItem: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: normalize(15),
    marginBottom: normalize(5),
  },
  cardText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#B0B0B0',
    lineHeight: normalize(20),
    marginBottom: normalize(10),
  },
  checklistContainer: {
    marginBottom: normalize(20),
  },
  checklistTitle: {
    fontSize: normalizeFontSize(15),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: normalize(10),
  },
  checklistText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#B0B0B0',
    lineHeight: normalize(20),
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingBottom: normalize(20),
    alignItems: 'center',
    gap:normalize(20)
  },
  confirmButton: {
    backgroundColor: '#FF86D3',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    minWidth: normalize(155),
    alignItems: 'center',
  },
  cancelButton:{
    backgroundColor: theme.backgroundTertiary,
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    minWidth: normalize(155),
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: '#262626',
  },
  cancelButtonText:{
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: theme.textPrimary,
  }
});

export default DeregisterAccountScreen; 