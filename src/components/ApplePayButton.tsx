import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform
} from 'react-native';
import { ApplePayService } from '@/utils/ApplePayService';
import { useMessageModal } from '@/contexts/MessageModalContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { scaleFont, scaleSize } from '@/utils/scale';
import AwesomeIcons from 'react-native-vector-icons/FontAwesome';

// 支付按钮属性
type ApplePayButtonProps = {
  productId?: string; // 苹果商品id
  beforePayCheck?: () => boolean;
  onSuccess: (result: any) => void; // 支付成功回调
  onFail: (error: Error) => void; // 支付失败回调
};

/**
 * Apple Pay 支付按钮
 * - 仅iOS显示
 * - 自动检查设备是否支持Apple Pay，不支持则隐藏
 */
const ApplePayButton: React.FC<ApplePayButtonProps> = ({
  productId,
  beforePayCheck,
  onSuccess,
  onFail,
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const { show } = useMessageModal();
  const { t } = useLanguage();

  // 组件挂载时检查是否支持Apple Pay
  useEffect(() => {
    if (Platform.OS === 'ios') {
      console.log(1111111111);
      
      ApplePayService.checkSupport().then((supported) => {
        console.log('222222222---', supported);
        setIsSupported(supported);
      });
    }
  }, []);

  // 点击按钮发起支付
  const handlePay = async () => {
    if (!isSupported) {
      show({
        message: t('translate_screen.device_apple_pay_error'),
        duration: 5000
      });
      return
    }

    let isGoOn = true
    if (beforePayCheck) {
      isGoOn = beforePayCheck()
    }
    if (!isGoOn) {
      return
    }

    try {
      const result = await ApplePayService.requestPayment({
        productId
      });
      // 支付成功后，将结果传给父组件（通常需要调用后端接口验证）
      onSuccess(result);
    } catch (error) {
      onFail(error as Error);
    }
  };

  // Android 或不支持Apple Pay的iOS设备不显示按钮
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <TouchableOpacity style={styles.button} onPress={handlePay}>
      <Text>
        <AwesomeIcons
          name='apple'
          color={'#000'}
          size={scaleFont(18)}
        />
      </Text>
      <Text style={styles.text}>Apple Pay</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: scaleSize(48),
    backgroundColor: '#fff', // Apple Pay 官方建议黑色背景
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  text: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: scaleSize(10)
  },
});

export default ApplePayButton;