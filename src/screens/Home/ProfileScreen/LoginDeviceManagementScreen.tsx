import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../../utils/theme';
import { useLanguage } from '../../../contexts/LanguageContext';
import { normalize, normalizeFontSize } from '../../../utils/stylesUtil';
import { ProfileStackParamList } from './ProfileNavigator';
import { useMessageModal } from '../../../contexts/MessageModalContext';
import { getDeviceInfos } from '../../../api/profile/profile';
import { getDeviceInfo } from '../../../utils/helpers';

type LoginDeviceManagementScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'LoginDeviceManagement'>;

// 获取设备信息请求参数
export interface GetDeviceInfosParams {
  /**
   * 用户设备指纹
   */
  device_fingerprint?: string;
  [property: string]: any;
}

// 设备信息
export interface DeviceInfo {
  /**
   * 可以根据device_info_json解析或用户自定义
   */
  device_name: string;
  /**
   * 根据device_info_json解析
   */
  device_type: string;
  ip_address: string;
  /**
   * 历史登录但仍活跃的设备
   */
  is_active: boolean;
  /**
   * 标识为当前设备
   */
  is_current_device: boolean;
  last_active_time: string;
  /**
   * 可选，通过IP解析
   */
  location_info: string;
  login_time: string;
  session_id: string;
  [property: string]: any;
}

// 用户设备信息返回数据
export interface UserDevicesRes {
  device_infos: DeviceInfo[];
  [property: string]: any;
}

// 获取设备信息API返回结果
export interface GetDeviceInfosResult {
  /**
   * 自定义状态码
   */
  code: number;
  /**
   * 返回数据
   */
  data: UserDevicesRes;
  /**
   * 数据说明
   */
  message: string;
  [property: string]: any;
}

const LoginDeviceManagementScreen: React.FC = () => {
  const navigation = useNavigation<LoginDeviceManagementScreenNavigationProp>();
  const { t } = useLanguage();
  const { show } = useMessageModal();
  
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeviceList();
  }, []);

  const loadDeviceList = async () => {
    try {
      setLoading(true);
      
      // 获取当前设备指纹
      const deviceInfo = getDeviceInfo();
      
      // 调用获取设备列表API
      const response = await getDeviceInfos({
        device_fingerprint: deviceInfo.fingerprint,
      });
      
      console.log('设备列表:', response);
      
      if (response && response.device_infos) {
        setDevices(response.device_infos);
      }
      
    } catch (error) {
      console.error('获取设备列表失败:', error);
      show({
        message: t('login_device.load_failed'),
        type: 'error',
      });
      
      // 使用模拟数据作为备选
      const mockDevices: DeviceInfo[] = [
        {
          device_name: "Ville的iPhone",
          device_type: "iPhone",
          ip_address: "192.168.1.100",
          is_active: true,
          is_current_device: true,
          last_active_time: '2025-01-15T10:30:00Z',
          location_info: '北京',
          login_time: '2025-01-15T10:30:00Z',
          session_id: 'session_1',
        },
        {
          device_name: "ACHCT的iPhone",
          device_type: "iPhone",
          ip_address: "192.168.1.101",
          is_active: true,
          is_current_device: false,
          last_active_time: '2025-04-26T15:45:00Z',
          location_info: '上海',
          login_time: '2025-04-26T15:45:00Z',
          session_id: 'session_2',
        },
        {
          device_name: "Lancer的HUAWEI",
          device_type: "HUAWEI",
          ip_address: "192.168.1.102",
          is_active: true,
          is_current_device: false,
          last_active_time: '2025-06-06T09:20:00Z',
          location_info: '深圳',
          login_time: '2025-06-06T09:20:00Z',
          session_id: 'session_3',
        },
      ];
      
      setDevices(mockDevices);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRemoveDevice = (device: DeviceInfo) => {
    Alert.alert(
      t('login_device.confirm_remove_title'),
      t('login_device.confirm_remove_message', { deviceName: device.device_name }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: () => removeDevice(device.session_id),
        },
      ]
    );
  };

  const removeDevice = async (sessionId: string) => {
    try {
      // TODO: 调用删除设备API
      // await removeDeviceApi(sessionId);
      
      console.log('删除设备:', sessionId);
      
      // 更新本地设备列表
      setDevices(prevDevices => prevDevices.filter(device => device.session_id !== sessionId));
      
      show({
        message: t('login_device.remove_success'),
        type: 'success',
      });
      
    } catch (error: any) {
      console.error('删除设备失败:', error);
      show({
        message: error.message || t('login_device.remove_failed'),
        type: 'error',
      });
    }
  };

  const currentDevice = devices.find(device => device.is_current_device);
  const historicalDevices = devices.filter(device => !device.is_current_device);

  // 格式化时间显示
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).replace(/\//g, '/');
    } catch (error) {
      return timeString;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor={theme.background} />
          
          {/* 顶部返回和标题 */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Image 
                source={require('@/assets/main/page_return_icon.png')} 
                style={styles.backArrow} 
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('login_device.title')}</Text>
            <View style={{ width: normalize(40) }} />
          </View>

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
        <StatusBar barStyle="light-content" backgroundColor={theme.background} />
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* 顶部返回和标题 */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Image 
                source={require('@/assets/main/page_return_icon.png')} 
                style={styles.backArrow} 
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('login_device.title')}</Text>
            <View style={{ width: normalize(40) }} />
          </View>

          {/* 说明文字 */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              {t('login_device.description')}
            </Text>
          </View>

          {/* 当前设备 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('login_device.current_device')}</Text>
            {currentDevice && (
              <View style={styles.deviceCard}>
                <View style={styles.deviceInfo}>
                  {/* <Image 
                    source={require('@/assets/profile/profile_device_icon.png')} 
                    style={styles.deviceIcon} 
                  /> */}
                  <View style={styles.deviceDetails}>
                    <Text style={styles.deviceName}>{currentDevice.device_name}</Text>
                    <Text style={styles.deviceLocation}>
                      {currentDevice.location_info}
                    </Text>
                  </View>
                </View>
                <View style={styles.currentDeviceBadge}>
                  <Text style={styles.currentDeviceText}>{t('login_device.current')}</Text>
                </View>
              </View>
            )}
          </View>

          {/* 历史登录设备 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('login_device.historical_devices')}</Text>
            {historicalDevices.length > 0 ? (
              historicalDevices.map((device) => (
                <View key={device.session_id} style={styles.deviceCard}>
                  <View style={styles.deviceInfo}>
                    {/* <Image 
                      source={require('@/assets/profile/profile_device_icon.png')} 
                      style={styles.deviceIcon} 
                    /> */}
                    <View style={styles.deviceDetails}>
                      <Text style={styles.deviceName}>{device.device_name}</Text>
                      <Text style={styles.deviceLastLogin}>
                        {t('login_device.last_login')} {formatTime(device.last_active_time)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveDevice(device)}
                  >
                    {/* <Image 
                      source={require('@/assets/profile/profile_remove_icon.png')} 
                      style={styles.removeIcon} 
                    /> */}
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('login_device.no_historical_devices')}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: normalize(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? normalize(44) : normalize(24),
    marginBottom: normalize(32),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: theme.backgroundTertiary,
    borderRadius: normalize(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    width: normalize(16),
    height: normalize(16),
  },
  headerTitle: {
    flex: 1,
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: normalizeFontSize(16),
    color: theme.textSecondary,
  },
  descriptionContainer: {
    marginBottom: normalize(32),
  },
  descriptionText: {
    fontSize: normalizeFontSize(14),
    color: theme.textSecondary,
    lineHeight: normalizeFontSize(20),
  },
  section: {
    marginBottom: normalize(32),
  },
  sectionTitle: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: normalize(16),
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: normalize(12),
    padding: normalize(16),
    marginBottom: normalize(12),
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    width: normalize(40),
    height: normalize(40),
    marginRight: normalize(12),
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: theme.textPrimary,
    marginBottom: normalize(4),
  },
  deviceLocation: {
    fontSize: normalizeFontSize(14),
    color: theme.textSecondary,
  },
  deviceLastLogin: {
    fontSize: normalizeFontSize(14),
    color: theme.textSecondary,
  },
  currentDeviceBadge: {
    backgroundColor: theme.primary,
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(12),
  },
  currentDeviceText: {
    fontSize: normalizeFontSize(12),
    fontWeight: '600',
    color: theme.backgroundTertiary,
  },
  removeButton: {
    width: normalize(32),
    height: normalize(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    width: normalize(20),
    height: normalize(20),
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: normalize(32),
  },
  emptyText: {
    fontSize: normalizeFontSize(14),
    color: theme.textSecondary,
  },
});

export default LoginDeviceManagementScreen; 