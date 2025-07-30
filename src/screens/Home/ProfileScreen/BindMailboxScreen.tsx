import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';
import theme from '../../../utils/theme';
import { deleteAccount } from '@/api/profile/profile';
import { useUserStore } from '@/store/modules/user.store';

const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const { width, height } = require('react-native').Dimensions.get('window');
  const scale = based === 'width' ? width / 375 : height / 812;
  return Math.round(size * scale);
};

const normalizeFontSize = (size: number) => {
  return normalize(size, 'width');
};

type BindMailboxScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'BindMailbox'>;

const BindMailboxScreen: React.FC<{ route: { params: { action_token: string } } }> = ({ route }) => {
  const { action_token } = route.params || {};
  const navigation = useNavigation<BindMailboxScreenNavigationProp>();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleConfirm = async() => {
    try{
      const res = await deleteAccount({
        action_token: action_token,
      })
      console.log('Delete account:', res);
      useUserStore.getState().setUserInfo({
        id: '',
        username: '',
        email: '',
      }); 
      useUserStore.getState().setToken('');
      navigation.replace('Auth' as never);
    }catch(error){
      console.log('Delete account error:', error);
    }
    
  };

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
          <Text style={styles.title}>Bind mailboxes</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.mainContent}>
          {/* 邮箱图标 */}
          <View style={styles.mailIconContainer}>
            <Image 
              source={require('../../../assets/profile/profile_tips_icon.png')} 
              style={styles.mailIcon}
            />
          </View>

          {/* 说明文字 */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              Once your account is canceled, all data will be permanently deleted and cannot be recovered
            </Text>
          </View>

          {/* 确认按钮 */}
          <TouchableOpacity 
            style={[
              styles.confirmButton,
             styles.confirmButtonActive
            ]} 
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>
              Confirm the logout
            </Text>
          </TouchableOpacity>

          {/* 确认复选框 */}
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setIsConfirmed(!isConfirmed)}
          >
                         {/* <View style={[
               styles.checkbox,
               isConfirmed && styles.checkboxChecked
             ]}>
               {isConfirmed && (
                 <Text style={styles.checkText}>✓</Text>
               )}
             </View> */}
            <Text style={styles.checkboxText}>
              I fully understand the consequences of cancellation and voluntarily delete my Melon account and all data permanently
            </Text>
          </TouchableOpacity>
        </View>
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
    color: theme.textPrimary,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: normalize(60),
  },
  mailIconContainer: {
    marginBottom: normalize(40),
  },
  mailIcon: {
    width: normalize(53),
    height: normalize(53),
    resizeMode: 'contain',
  },
  descriptionContainer: {
    marginBottom: normalize(40),
    paddingHorizontal: normalize(6),
  },
  descriptionText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '400',
    color: theme.textProfile,
    textAlign: 'center',
    lineHeight: normalizeFontSize(21),
  },
  confirmButton: {
    backgroundColor: 'transparent',
    borderRadius: normalize(50),
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(24),
    alignItems: 'center',
    marginBottom: normalize(30),
    borderWidth: normalize(2),
    borderColor: theme.textPrimary,
    width: '100%',
  },
  confirmButtonActive: {
    borderColor: theme.textPrimary,
    backgroundColor: 'rgba(255, 134, 211, 0.1)',
  },
  confirmButtonText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: normalize(6),
  },
  checkbox: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(4),
    borderWidth: 1,
    borderColor: '#EBEDF0',
    backgroundColor: 'transparent',
    marginRight: normalize(12),
    marginTop: normalize(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.textPrimary,
    borderColor: theme.textPrimary,
  },
  checkText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  checkboxText: {
    flex: 1,
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#EBEDF0',
    lineHeight: normalizeFontSize(21),
    textAlign: 'center',
  },
});

export default BindMailboxScreen; 