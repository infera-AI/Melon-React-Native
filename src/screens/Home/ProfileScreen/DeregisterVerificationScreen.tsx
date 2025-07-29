import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Alert,
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

type DeregisterVerificationScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'DeregisterVerification'>;

const DeregisterVerificationScreen: React.FC = () => {
  const navigation = useNavigation<DeregisterVerificationScreenNavigationProp>();
  const [verificationMethod, setVerificationMethod] = useState<'password' | 'phone'>('password');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'Chinese Mainland',
    code: '+86'
  });
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleConfirmDeregister = () => {
    if (verificationMethod === 'password' && !password.trim()) {
      Alert.alert('提示', '请输入登录密码');
      return;
    }
    
    if (verificationMethod === 'phone' && (!phoneNumber.trim()) ) {
      Alert.alert('提示', '请输入手机号码');
      return;
    }
    
    // 验证逻辑
    if (verificationMethod === 'password') {
      console.log('Verify password:', password);
      // 密码验证成功后，导航到验证码验证页面
      navigation.navigate('DeregisterCodeVerification');
    } else {
      console.log('Verify code:', verificationCode);
      // 手机号验证成功后，导航到验证码验证页面
      navigation.navigate('DeregisterCodeVerification', { phoneNumber: phoneNumber ,countryCode:selectedCountry.code});
    }
  };



  const handleCountrySelect = (country: { name: string; code: string }) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  const handleSendCode = () => {
    if (!phoneNumber.trim()) {
      Alert.alert('提示', '请输入手机号码');
      return;
    }
    console.log('Send verification code to:', selectedCountry.code + phoneNumber);
    Alert.alert('提示', '验证码已发送');
  };

  return (
         <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
       {/* 背景图片 */}
       <Image 
         source={require('../../../assets/profile/profile_logoff_bg.png')} 
         style={styles.backgroundImage}
         resizeMode="cover"
       />
       {/* 背景渐变效果 */}
       <View style={styles.backgroundGradient} />      
       {/* 主要内容 */}
       <View style={styles.content}>
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
        
                 {/* 验证方式选择 */}
         <View style={styles.tabContainer}>
           <TouchableOpacity 
             style={[
               styles.tab,
               verificationMethod === 'password' && styles.activeTab
             ]}
             onPress={() => setVerificationMethod('password')}
           >
             <Text style={[
               styles.tabText,
               verificationMethod === 'password' && styles.activeTabText
             ]}>
               Password verification
             </Text>
           </TouchableOpacity>
           <TouchableOpacity 
             style={[
               styles.tab,
               verificationMethod === 'phone' && styles.activeTab
             ]}
             onPress={() => setVerificationMethod('phone')}
           >
             <Text style={[
               styles.tabText,
               verificationMethod === 'phone' && styles.activeTabText
             ]}>
               Mobile phone verification
             </Text>
           </TouchableOpacity>
         </View>

         {/* 输入框 */}
         <View style={styles.inputContainer}>
           {verificationMethod === 'password' ? (
             <>
               <TextInput
                 style={styles.input}
                 value={password}
                 onChangeText={setPassword}
                 placeholder="Please enter your login password"
                 placeholderTextColor="#666666"
                 secureTextEntry
               />
             </>
                       ) : (
              <>
                {/* 选择国家 */}
                <TouchableOpacity 
                  style={styles.countrySelector}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Text style={styles.countryName}>{selectedCountry.name}</Text>
                  <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                </TouchableOpacity>
                
                                 {/* 输入手机号 */}
                 <TextInput
                   style={styles.input}
                   value={phoneNumber}
                   onChangeText={setPhoneNumber}
                   placeholder="Please enter your mobile phone number"
                   placeholderTextColor="#666666"
                   keyboardType="phone-pad"
                 />
              </>
            )}
         </View>


         {/* 确认按钮 */}
         <TouchableOpacity 
           style={[
             styles.confirmButton,
             ((verificationMethod === 'password' && !password.trim()) || 
              (verificationMethod === 'phone' && (!phoneNumber.trim() || !verificationCode.trim()))) && styles.confirmButtonDisabled
           ]} 
           onPress={handleConfirmDeregister}
         >
           <Text style={styles.confirmButtonText}>verify</Text>
         </TouchableOpacity>

         
                   {/* 发送验证码 - 仅在手机号验证时显示 */}
          {verificationMethod === 'phone' && (
            <TouchableOpacity style={styles.resendButton} onPress={handleSendCode}>
              <Text style={styles.forgotPasswordText}>Send a verification code</Text>
            </TouchableOpacity>
          )}

          {/* 忘记密码链接 - 仅在密码验证时显示 */}
          {verificationMethod === 'password' && (
           <TouchableOpacity style={styles.forgotPasswordButton}>
             <Text style={styles.forgotPasswordText}>Forgot password</Text>
           </TouchableOpacity>
          )}

        {/* 国家选择弹窗 */}
        {showCountryPicker && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Country/Region</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowCountryPicker(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
                             <ScrollView 
                 style={styles.countryList}
                 showsVerticalScrollIndicator={false}
                 contentContainerStyle={styles.countryListContent}
               >
                 {[
                   { name: 'Chinese Mainland', code: '+86' },
                   { name: 'United States', code: '+1' },
                   { name: 'United Kingdom', code: '+44' },
                   { name: 'Japan', code: '+81' },
                   { name: 'Germany', code: '+49' },
                   { name: 'France', code: '+33' },
                   { name: 'Spain', code: '+34' },
                   { name: 'Italy', code: '+39' },
                   { name: 'Canada', code: '+1' },
                   { name: 'Australia', code: '+61' },
                 ].map((country, index) => (
                   <TouchableOpacity
                     key={index}
                     style={styles.countryItem}
                     onPress={() => handleCountrySelect(country)}
                   >
                     <Text style={styles.countryItemName}>{country.name}</Text>
                     <Text style={styles.countryItemCode}>{country.code}</Text>
                   </TouchableOpacity>
                 ))}
               </ScrollView>
            </View>
          </View>
        )}
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
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
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
    marginBottom: normalize(40),
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
  description: {
    fontSize: normalizeFontSize(16),
    fontWeight: '400',
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: normalize(24),
    marginBottom: normalize(40),
    paddingHorizontal: normalize(20),
  },
  inputContainer: {
    marginBottom: normalize(30),
  },
  inputLabel: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: normalize(12),
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: normalize(54),
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    fontSize: normalizeFontSize(16),
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resendButton: {
    alignSelf: 'center',
    marginBottom: normalize(40),
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
    color: theme.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: normalize(30),
  },
  tab: {
    flex: 1,
    width: normalize(148),
    height: normalize(28),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(8),
  },
  activeTab: {
    backgroundColor: 'rgba(255, 134, 211, 0.2)',
  },
  tabText: {
    fontSize: normalizeFontSize(12),
    fontWeight: '500',
    color: '#B0B0B0',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginBottom: normalize(40),
  },
  forgotPasswordText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '500',
    color: '#B0B0B0',
  },
  countrySelector: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: normalize(54),
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: normalize(12),
  },
  countryName: {
    fontSize: normalizeFontSize(16),
    color: '#FFFFFF',
    fontWeight: '500',
  },
  countryCode: {
    fontSize: normalizeFontSize(16),
    color: '#FFFFFF',
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#262626',
    borderRadius: normalize(16),
    width: '90%',
    maxHeight: '70%',
    padding: normalize(20),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(20),
  },
  modalTitle: {
    fontSize: normalizeFontSize(18),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    width: normalize(30),
    height: normalize(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: normalizeFontSize(18),
    color: '#B0B0B0',
    fontWeight: '600',
  },
  countryList: {
    maxHeight: normalize(400),
  },
  countryListContent: {
    paddingBottom: normalize(10),
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  countryItemName: {
    fontSize: normalizeFontSize(16),
    color: '#FFFFFF',
    fontWeight: '500',
  },
  countryItemCode: {
    fontSize: normalizeFontSize(16),
    color: '#B0B0B0',
    fontWeight: '500',
  },
});

export default DeregisterVerificationScreen; 