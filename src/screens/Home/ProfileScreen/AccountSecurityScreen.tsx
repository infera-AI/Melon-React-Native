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
import theme from '@/utils/theme';
import { logout } from '@/api/login';
import { getDeviceInfo } from '@/utils/helpers';
import { useUserStore } from '@/store/modules/user.store';
import { useLanguage } from '../../../contexts/LanguageContext';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import LoginDeviceManagementScreen from './LoginDeviceManagementScreen';

type AccountSecurityScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'AccountSecurity'>;

const AccountSecurityScreen: React.FC = () => {
  const navigation = useNavigation<AccountSecurityScreenNavigationProp>();
  const { t } = useLanguage();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleChangePassword = () => {
    navigation.navigate('ResetPassword');
    // 修改密码逻辑
    console.log('Change password');
  };

  const handleForgotPassword = () => {
    navigation.navigate('RetrivePassword');
    // 忘记密码逻辑
    console.log('Forgot password');
  };

  const handleBindPhoneEmail = () => {
    navigation.navigate('BindPhoneEmail');
    // 绑定手机号/邮箱逻辑
    console.log('Bind phone/email');
  };

  const handleDeregisterAccount = () => {
    navigation.navigate('DeregisterAccount');
  };

  const handleLoginDeviceManagement = () => {
    navigation.navigate('LoginDeviceManagement');
  };

  const handleLogout = async () => {
    navigation.goBack()
    const deviceInfo = getDeviceInfo();
    const res = await logout({
      device_fingerprint: deviceInfo.fingerprint,
    })
    console.log('Logout:', res);
    useUserStore.getState().setUserInfo(null);
    useUserStore.getState().setToken(null);
    useUserStore.getState().setRefreshToken(null);
    useUserStore.getState().setUserInfo(null);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView>
        {/* 顶部导航栏 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image
              source={require('../../../assets/main/page_return_icon.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.title}>{t('account_security.account_and_security')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* 修改密码卡片 */}
        <TouchableOpacity style={styles.card} onPress={handleChangePassword}>
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <Image
                source={require('../../../assets/profile/profile_security_icon.png')}
                style={styles.cardIcon}
              />
              <Text style={styles.cardTitle}>{t('account_security.change_password')}</Text>
            </View>
            <Image
              source={require('../../../assets/main/right_arrow_icon.png')}
              style={styles.arrowIcon}
            />
          </View>
        </TouchableOpacity>

        {/* 绑定手机号/邮箱卡片 */}
        <TouchableOpacity style={styles.card} onPress={handleBindPhoneEmail}>
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <Image
                source={require('../../../assets/profile/profile_bind_icon.png')}
                style={styles.bindIcon}
              />
              <Text style={styles.cardTitle}>{t('account_security.bind_phone_number_email')}</Text>
            </View>
            <Image
              source={require('../../../assets/main/right_arrow_icon.png')}
              style={styles.arrowIcon}
            />
          </View>
        </TouchableOpacity>

        {/* 登录设备管理卡片 */}
        {/* <TouchableOpacity style={styles.card} onPress={handleLoginDeviceManagement}>
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <Image 
              source={require('../../../assets/profile/profile_device_icon.png')} 
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>{t('account_security.login_device_management')}</Text>
          </View>
          <Image 
            source={require('../../../assets/main/right_arrow_icon.png')} 
            style={styles.arrowIcon}
          />
        </View>
      </TouchableOpacity> */}

        {/* 注销账户卡片 */}
        <TouchableOpacity style={styles.card} onPress={handleDeregisterAccount}>
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <Image
                source={require('../../../assets/main/shutdown_icon.png')}
                style={styles.cardIcon}
              />
              <Text style={styles.cardTitle}>{t('account_security.deregister_account')}</Text>
            </View>
            <Image
              source={require('../../../assets/main/right_arrow_icon.png')}
              style={styles.arrowIcon}
            />
          </View>
        </TouchableOpacity>
      </ScrollView>
      <TouchableOpacity style={styles.logoutCard} onPress={handleLogout}>
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            {/* <Image
              source={require('../../../assets/main/shutdown_icon.png')}
              style={styles.cardIcon}
            /> */}
            <Text style={[styles.cardTitle, styles.logoutCardText]}>{t('account_security.logout')}</Text>
          </View>
          <Image
            source={require('../../../assets/main/right_arrow_icon.png')}
            style={styles.arrowIcon}
          />
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
    paddingHorizontal: normalize(24),
    paddingTop: normalize(20),
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
  card: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    marginBottom: normalize(16),
    height: normalize(52),
  },
  logoutCard: {
    borderRadius: normalize(12),
    marginBottom: normalize(16),
    height: normalize(52),
    marginHorizontal: normalize(24),
    backgroundColor: theme.primary,
    position: 'absolute',
    bottom: normalize(10),
    left: 0,
    right: 0,
  },
  logoutCardText: {
    color: theme.backgroundTertiary,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(16),
    flex: 1,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: normalize(22),
    height: normalize(22),
    marginRight: normalize(12),
  },
  bindIcon: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  bindIconInner: {
    width: normalize(7),
    height: normalize(7),
    borderRadius: normalize(3.5),
    backgroundColor: '#85F380',
  },
  cardTitle: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#FFFFFF',
    flex: 1,
  },
  arrowIcon: {
    width: normalize(21),
    height: normalize(20),
  },
});

export default AccountSecurityScreen; 