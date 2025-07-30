import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';
import theme from '../../../utils/theme';
import { getLoginCodeApi, verifyCode } from '@/api/login';
import { useMessageModal } from '@/contexts/MessageModalContext';

const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const { width, height } = require('react-native').Dimensions.get('window');
  const scale = based === 'width' ? width / 375 : height / 812;
  return Math.round(size * scale);
};

const normalizeFontSize = (size: number) => {
  return normalize(size, 'width');
};

type DeregisterCodeVerificationScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'DeregisterCodeVerification'>;

const DeregisterCodeVerificationScreen: React.FC<{ route: { params: { phoneNumber: string ,countryCode:string} } }> = ({ route } ) => {
  const navigation = useNavigation<DeregisterCodeVerificationScreenNavigationProp>();
  const { phoneNumber ,countryCode} = route.params;
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const inputRefs = useRef<TextInput[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const { show } = useMessageModal();
  const handleBack = () => {
    navigation.goBack();
  };

  const startCountdown = () => {
    setCountdown(60);
    setCanResend(false);
    
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendCode = async() => {
    if (canResend) {
      console.log('Resending verification code...');
      // 这里可以调用重新发送验证码的API
      try{
        const res = await getLoginCodeApi({
          identifier: phoneNumber,
          auth_purpose: 'delete_account',
          recipient_type: 'phone',
        })
        console.log('Resend code:', res);
        startCountdown();
      }catch(error){
        console.log('Resend code error:', error);
      }
    }
  };

  // 组件卸载时清理定时器
  useEffect(() => {
    startCountdown()
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...verificationCode];
    newCode[index] = text;
    setVerificationCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      show({message: 'Please enter the complete 6-digit verification code'});
      return;
    }

    setIsVerifying(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
    try{
      const res = await verifyCode({
        identifier: phoneNumber,
        verification_code: code,
        auth_purpose: 'delete_account',
        recipient_type: 'phone',
      })
      console.log('Verify code:', res);
      navigation.navigate('BindMailbox',{action_token:res?.action_token});
    }catch(error:any){
      show({message: 'Verification code error:'+error.msg});
      console.log('Verify code error:', error);
    }finally{
      setIsVerifying(false);
      pulseAnim.stopAnimation();
    }
  };

  const isCodeComplete = verificationCode.every(digit => digit !== '');

     return (
     <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
       <Image 
         source={require('../../../assets/profile/profile_logoff_bg.png')} 
         style={styles.backgroundImage}
       />
      
      <View style={styles.content}>
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

        <View style={styles.verificationContainer}>
          <Text style={styles.verificationTitle}>The verification code has been sent to the mobile phone:</Text>
          <Text style={styles.verificationSubtitle}>
            {countryCode + ' ' + phoneNumber}
          </Text>

          <View style={styles.codeInputContainer}>
            {verificationCode.map((digit, index) => (
              <View style={styles.codeInputBox}>
                 <TextInput
                   key={index}
                   ref={(ref) => {
                     if (ref) inputRefs.current[index] = ref;
                   }}
                   style={[
                     styles.codeInput,
                   ]}
                   value={digit}
                   onChangeText={(text) => handleCodeChange(text, index)}
                   onKeyPress={(e) => handleKeyPress(e, index)}
                   placeholder=""
                   keyboardType="number-pad"
                   maxLength={1}
                   textAlign="center"
                   selectionColor="transparent"
                 />
              </View>
            ))}
          </View>

          {isVerifying && (
            <Animated.View 
              style={[
                styles.verifyingContainer,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <View style={styles.verifyingDot} />
              <Text style={styles.verifyingText}>正在验证...</Text>
            </Animated.View>
          )}
        </View>

          <TouchableOpacity 
           style={[
             styles.confirmButton,
             (!isCodeComplete || isVerifying) && styles.confirmButtonDisabled
           ]} 
           onPress={handleVerify}
           disabled={!isCodeComplete || isVerifying}
         >
           <Text style={styles.confirmButtonText}>
             {isVerifying ? '验证中...' : 'next step'}
           </Text>
         </TouchableOpacity>
         <TouchableOpacity 
           style={[
             styles.resendButton,
             !canResend && styles.resendButtonDisabled
           ]}
           onPress={handleResendCode}
           disabled={!canResend}
         >
           <Text style={[
             styles.resendText,
             !canResend && styles.resendTextDisabled
           ]}>
             Retrieve verification code again {countdown > 0 ? `${countdown}s` : ''}
           </Text>
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
     container: {
     flex: 1,
     backgroundColor: '#090607',
   },
   backgroundImage: {
     position: 'absolute',
     top: 0,
     left: 0,
     right: 0,
     bottom: 0,
     width: '100%',
     height: '100%',
     resizeMode: 'cover',
   },
  gradientBackground: {
    position: 'absolute',
    top: -175,
    left: -29,
    width: 709.84,
    height: 1233.14,
    borderRadius: 616.57,
    backgroundColor: 'transparent',
  },
  blurBackground: {
    position: 'absolute',
    top: 101,
    left: -29,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(1, 1, 1, 0.25)',
  },
  content: {
    flex: 1,
    paddingHorizontal: normalize(24),
    paddingTop: normalize(20),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(10),
    marginBottom: normalize(60),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: 'rgba(62, 62, 62, 0.8)',
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
  verificationContainer: {
    alignItems: 'flex-start',
    marginBottom: normalize(60),
  },
  verificationTitle: {
    fontSize: normalizeFontSize(12),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: normalize(12),
    textAlign: 'left',
  },
  verificationSubtitle: {
    fontSize: normalizeFontSize(16),
    fontWeight: '400',
    color: '#B0B0B0',
    marginBottom: normalize(40),
    textAlign: 'left',
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: normalize(40),
  },
  codeInputBox: {
    width: normalize(46),
    height: normalize(46),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: normalize(23),
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  codeInput: { 
    height: normalize(46),
    fontSize: normalizeFontSize(18),
    marginTop: normalize(2),
    fontWeight: '600',
    color: '#000000',
  },
  codeInputFilled: {
  },
  codeInputVerifying: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  verifyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(30),
  },
  verifyingDot: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
    backgroundColor: '#4CAF50',
    marginRight: normalize(8),
  },
  verifyingText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '500',
    color: '#4CAF50',
  },
  resendButton: {
    marginBottom: normalize(20),
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '500',
    color: theme.textPrimary,
    textAlign: 'center',
  },
  resendTextDisabled: {
    color: '#666666',
  },
  confirmButton: {
    backgroundColor:"transparent",
    borderRadius: normalize(50),
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(24),
    alignItems: 'center',
    marginBottom: normalize(20),
    borderWidth: normalize(2),
    borderColor: theme.textPrimary,
  },
  confirmButtonDisabled: {
  },
  confirmButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default DeregisterCodeVerificationScreen; 