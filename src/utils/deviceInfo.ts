import { Platform, Dimensions, NativeModules } from 'react-native';
import { DeviceInfo as DeviceInfoType } from '../api/login/types';

const { width, height } = Dimensions.get('window');

export class DeviceInfoService {
  /**
   * 获取设备信息
   */
  static getDeviceInfo(): DeviceInfoType {
    return {
      app_version: this.getAppVersion(),
      device_model: this.getDeviceModel(),
      fingerprint: this.generateFingerprint(),
      locale: this.getLocale(),
      network_type: this.getNetworkType(),
      os_type: Platform.OS,
      os_version: this.getOSVersion(),
      screen_resolution: `${width}x${height}`,
      timezone: this.getTimezone(),
    };
  }

  /**
   * 获取应用版本
   */
  private static getAppVersion(): string {
    // 这里可以从 package.json 或其他地方获取版本号
    // 暂时返回固定值，实际项目中需要动态获取
    return '1.0.0';
  }

  /**
   * 获取设备型号
   */
  private static getDeviceModel(): string {
    if (Platform.OS === 'ios') {
      // iOS 设备型号
      return 'iPhone 15 Pro Max'; // 实际项目中需要动态获取
    } else if (Platform.OS === 'android') {
      // Android 设备型号
      return 'Samsung S24'; // 实际项目中需要动态获取
    }
    return 'Unknown Device';
  }

  /**
   * 生成设备指纹
   */
  private static generateFingerprint(): string {
    const fingerprintData = [
      Platform.OS,
      Platform.Version,
      width,
      height,
      this.getDeviceModel(),
      this.getAppVersion(),
      this.getLocale(),
      this.getTimezone(),
    ].join('|');

    // 简单的哈希函数
    let hash = 0;
    for (let i = 0; i < fingerprintData.length; i++) {
      const char = fingerprintData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }

    return Math.abs(hash).toString(16);
  }

  /**
   * 获取语言环境
   */
  private static getLocale(): string {
    // 获取系统语言
    const locale = NativeModules.I18nManager?.localeIdentifier || 'en-US';
    return locale;
  }

  /**
   * 获取网络类型
   */
  private static getNetworkType(): string {
    // 这里需要根据实际情况获取网络类型
    // 可以使用 react-native-netinfo 库
    return 'WiFi'; // 默认返回 WiFi
  }

  /**
   * 获取操作系统版本
   */
  private static getOSVersion(): string {
    return Platform.Version.toString();
  }

  /**
   * 获取时区
   */
  private static getTimezone(): string {
    // 获取系统时区
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone || 'Asia/Shanghai';
  }

  /**
   * 获取设备信息摘要（用于调试）
   */
  static getDeviceInfoSummary(): string {
    const deviceInfo = this.getDeviceInfo();
    
    return `Device: ${deviceInfo.device_model}
OS: ${deviceInfo.os_type} ${deviceInfo.os_version}
Screen: ${deviceInfo.screen_resolution}
App Version: ${deviceInfo.app_version}
Locale: ${deviceInfo.locale}
Timezone: ${deviceInfo.timezone}
Network: ${deviceInfo.network_type}
Fingerprint: ${deviceInfo.fingerprint}`;
  }

  /**
   * 获取设备信息对象（用于API调用）
   */
  static getDeviceInfoForAPI(): DeviceInfoType {
    return this.getDeviceInfo();
  }

  /**
   * 验证设备信息是否完整
   */
  static validateDeviceInfo(deviceInfo: DeviceInfoType): boolean {
    const requiredFields = [
      'app_version',
      'device_model',
      'fingerprint',
      'locale',
      'network_type',
      'os_type',
      'os_version',
      'screen_resolution',
      'timezone',
    ];

    return requiredFields.every(field => 
      deviceInfo[field as keyof DeviceInfoType] && 
      deviceInfo[field as keyof DeviceInfoType] !== ''
    );
  }

  /**
   * 格式化设备信息（用于日志）
   */
  static formatDeviceInfo(deviceInfo: DeviceInfoType): string {
    return JSON.stringify(deviceInfo, null, 2);
  }
}

// 导出便捷函数
export const getDeviceInfo = DeviceInfoService.getDeviceInfo;
export const getDeviceInfoForAPI = DeviceInfoService.getDeviceInfoForAPI;
export const getDeviceInfoSummary = DeviceInfoService.getDeviceInfoSummary;
export const validateDeviceInfo = DeviceInfoService.validateDeviceInfo;
export const formatDeviceInfo = DeviceInfoService.formatDeviceInfo;