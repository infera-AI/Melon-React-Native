import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../../utils/theme';
import { useLanguage } from '../../../contexts/LanguageContext';
import { normalize, normalizeFontSize } from '../../../utils/stylesUtil';
import { ProfileStackParamList } from './ProfileNavigator';
import { useUserStore } from '../../../store/modules/user.store';
import { getBindingInfos } from '../../../api/profile/profile';
import { useMessageModal } from '../../../contexts/MessageModalContext';

type BindPhoneEmailScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'BindPhoneEmail'>;

interface UserBindingInfo {
  phone?: string;
  email?: string;
  country_code?: string;
  country_name?: string;
  is_phone_bound?: boolean;
  is_email_bound?: boolean;
}

const BindPhoneEmailScreen: React.FC = () => {
  const navigation = useNavigation<BindPhoneEmailScreenNavigationProp>();
  const { t } = useLanguage();
  const { show } = useMessageModal();
  const userInfo = useUserStore(s => s.userInfo);
  
  const [bindingInfo, setBindingInfo] = useState<UserBindingInfo>({});
  const [loading, setLoading] = useState(true);

  const loadUserBindingInfo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBindingInfos();
      console.log('用户绑定信息:', response.binding_infos);
      let info = {
        phone: '',
        email: '',
        country_code: response.country_code,
        country_name: '',
        is_phone_bound: false,
        is_email_bound: false,
      }

      response.binding_infos.map((item: any) => {
        if(item.auth_type === 'phone') {
          info.phone = item.identifier;
          info.is_phone_bound = true
        } else if(item.auth_type === 'email') {
          info.is_email_bound = true
        }
      })

      setBindingInfo(info);
    } catch (error: any) {
      console.error('获取用户绑定信息失败:', error);
      show({
        message: error.message || t('bind_phone_email.load_failed'),
      });
      
      // 使用store中的信息作为备选
      setBindingInfo({
        phone: userInfo?.phone,
        email: userInfo?.email,
        country_code: '+86',
        country_name: '中国大陆',
        is_phone_bound: !!userInfo?.phone,
        is_email_bound: !!userInfo?.email,
      });
    } finally {
      setLoading(false);
    }
  }, [show, t, userInfo]);

  useEffect(() => {
    loadUserBindingInfo();
  }, [loadUserBindingInfo]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleChangePhone = () => {
    // 跳转到绑定手机号页面
    navigation.navigate('BindPhoneEMailNumber', { type: 'phone' });
  };

  const handleBindEmail = () => {
    // TODO: 跳转到绑定邮箱页面
    navigation.navigate('BindPhoneEMailNumber', { type: 'email' });
    console.log('跳转到绑定邮箱页面');
  };



  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.container}>          
          {/* 加载状态 */}
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.container}>

        {/* 导航栏 */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image 
              source={require('../../../assets/main/page_return_icon.png')} 
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <View style={styles.titleSpacer} />
          <Text style={styles.titleText}>Bind phone number/email</Text>
        </View>

        {/* 绑定列表 */}
        <View style={styles.listContainer}>
          {/* 手机号绑定项 */}
          <TouchableOpacity style={styles.listItem} disabled={bindingInfo.is_phone_bound} onPress={handleChangePhone}>
            <Text style={styles.itemLabel}>Mobile phone number</Text>
            <View style={styles.itemValueContainer}>
              <Text style={styles.itemValue}>
                {bindingInfo.is_phone_bound ? bindingInfo.phone : '当前未绑定手机号'}
              </Text>
              <Image 
                source={require('../../../assets/main/right_arrow_icon.png')} 
                style={styles.arrowIcon}
              />
            </View>
          </TouchableOpacity>

          {/* 邮箱绑定项 */}
          <TouchableOpacity style={styles.listItem} disabled={bindingInfo.is_email_bound} onPress={handleBindEmail}>
            <Text style={styles.itemLabel}>Email</Text>
            <View style={styles.itemValueContainer}>
              <Text style={[
                styles.itemValue,
                !bindingInfo.is_email_bound && styles.itemValueUnbound
              ]}>
                {bindingInfo.is_email_bound ? bindingInfo.email : '当前未绑定邮箱'}
              </Text>
              <Image 
                source={require('../../../assets/main/right_arrow_icon.png')} 
                style={styles.arrowIcon}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: normalize(16),
  },
  // 状态栏样式
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(14),
    marginTop: normalize(17),
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
  // 导航栏样式
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(17),
    height: normalize(40),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: theme.backgroundTertiary,
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: normalize(16),
    height: normalize(16),
  },
  titleSpacer: {
    width: normalize(23),
    height: normalize(21),
    marginHorizontal: normalize(12),
  },
  titleText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'left',
    letterSpacing: -0.4,
    lineHeight: normalize(21),
  },
  // 列表样式
  listContainer: {
    marginTop: normalize(18),
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: normalize(12),
    height: normalize(52),
    marginBottom: normalize(16),
    paddingHorizontal: normalize(16),
  },
  itemLabel: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: normalize(20),
  },
  itemValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
  },
  itemValue: {
    fontSize: normalizeFontSize(13),
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: normalize(16),
    textAlign: 'left',
  },
  itemValueUnbound: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  arrowIcon: {
    width: normalize(20),
    height: normalize(20),
  },
  // 加载状态样式
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: normalizeFontSize(16),
    color: theme.textSecondary,
  },
});

export default BindPhoneEmailScreen; 