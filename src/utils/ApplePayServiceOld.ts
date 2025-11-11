/**
 * ios中使用passkit 购买实体商品时用这个文件
 */
import { NativeModules, Platform } from 'react-native';

// 获取原生模块（iOS和Android都注册了同名模块RNApplePay）
const { RNApplePay } = NativeModules;

console.log('RNApplePay模块--:', NativeModules.RNApplePay);

// 苹果支付配置参数类型定义（TS可选，JS可省略）
type ApplePayOptions = {
  merchantIdentifier: string; // 苹果开发者后台配置的商户ID
  amount: string; // 支付金额（字符串格式，如"0.01"）
  label?: string; // 订单描述（如"会员充值"）
  countryCode?: string; // 国家代码，默认"CN"
  currencyCode?: string; // 货币代码，默认"CNY"
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

    //   RNApplePay.canMakePayments()
    //     .then((res: any) => {
    //         // console.log('可支付:', res)
    //         console.log('33333333--', res);
    //         resolve(res)
    //     })
    //     .catch((err: any) => {
    //         console.log('44444--', err);
    //         resolve(false)
    //     });
        
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
  async requestPayment(options: ApplePayOptions): Promise<{
    success: boolean;
    transactionIdentifier: string;
    paymentData: string;
  }> {
    if (Platform.OS !== 'ios') {
      throw new Error('仅iOS支持Apple Pay');
      
    }
    return new Promise((resolve, reject) => {
      // 调用iOS原生的requestPayment方法
      RNApplePay.requestPayment(
        {
          merchantIdentifier: options.merchantIdentifier,
          amount: options.amount,
          label: options.label || '订单支付',
          countryCode: options.countryCode || 'US',
          currencyCode: options.currencyCode || 'USD',
        }
      ).then((res: any) => {
        resolve(res);
      }).catch((err: any) => {
        reject(new Error(err?.message || '支付失败'));
      });
    });
  },
};