import { NativeModules, Platform } from 'react-native';

// 获取原生模块（iOS和Android都注册了同名模块RNApplePay）
const { RNApplePay } = NativeModules;

console.log('RNApplePay模块--:', NativeModules.RNApplePay);

// 虚拟商品参数
type ApplePayOptions = {
  productId?: string; // 苹果商品id
};

/**
 * 苹果支付工具类
 * 仅在iOS有效，Android端调用会自动报错（已在原生层处理）
 */
export const ApplePayService = {
  /**
   * 检查当前设备是否支持Apple Pay
   * @returns 是否支持（仅iOS有效，Android返回false）
   */
  async checkSupport(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    return new Promise((resolve) => {
        
      // 调用iOS原生的canMakePayments方法
      RNApplePay.canMakePayments((isSupported: boolean) => {
        console.log('canMakePayments---', isSupported);
        
        resolve(isSupported);
      });
    });
  },

  /**
   * 发起Apple Pay支付
   * @param options 支付参数
   * @returns 支付结果（包含交易凭证等）
   */
  async requestPayment(options: ApplePayOptions): Promise<any> {
    if (Platform.OS !== 'ios') {
      throw new Error('仅iOS支持Apple Pay');
      
    }
    return new Promise((resolve, reject) => {

      RNApplePay.requestPayment(
        {
          productId: options.productId
        }
      ).then((res: any) => {
        // 显示ios的成功完成购买弹窗，点击好的时候，这里会触发
        console.log('requestPayment---then触发');
        
        resolve(res);
      }).catch((err: any) => {
        reject(new Error(err?.message || '支付失败'));
      });
    });
  },
};