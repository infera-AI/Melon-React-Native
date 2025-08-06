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
import { useLanguage } from '../../../contexts/LanguageContext';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';

type DeregisterAccountScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'DeregisterAccount'>;

const DeregisterAccountScreen: React.FC = () => {
  const navigation = useNavigation<DeregisterAccountScreenNavigationProp>();
  const { t } = useLanguage();

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
        <Text style={styles.title}>{t('deregister_account.cancel_your_account')}</Text>
        <View style={styles.headerSpacer} />
      </View>

        {/* 主要内容卡片 */}
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>{t('deregister_account.important_cancel_your_account')}</Text>
          
          <Text style={styles.riskItem}>{t('deregister_account.risk_item_1')}</Text>
          <Text style={styles.cardText}>
            {t('deregister_account.account_data_permanently_deleted')}
          </Text>
          
          <Text style={styles.riskItem}>{t('deregister_account.risk_item_2')}</Text>
          <Text style={styles.cardText}>
            {t('deregister_account.no_longer_able_to_use_account')}
          </Text>
          
          <Text style={styles.riskItem}>{t('deregister_account.risk_item_3')}</Text>
          <Text style={styles.cardText}>
            {t('deregister_account.third_party_binding_released')}
          </Text>
          
            <Text style={styles.riskItem}>{t('deregister_account.please_check_before_canceling')}</Text>
            <Text style={styles.cardText}>
              {t('deregister_account.backup_conversation_records')}{'\n'}
              {t('deregister_account.unbound_third_party_accounts')}{'\n'}
              {t('deregister_account.aware_of_consequences')}
            </Text>
        </View>

      </ScrollView>

      {/* 底部确认按钮 */}
      <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.cancelButton} onPress={handleConfirmDeregister}>
          <Text style={styles.cancelButtonText}>{t('deregister_account.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmDeregister}>
          <Text style={styles.confirmButtonText}>{t('deregister_account.ok')}</Text>
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
    gap:normalize(11)
  },
  confirmButton: {
    flex:1,
    backgroundColor: '#FF86D3',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    alignItems: 'center',
  },
  cancelButton:{
    flex:1,
    backgroundColor: theme.backgroundTertiary,
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
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