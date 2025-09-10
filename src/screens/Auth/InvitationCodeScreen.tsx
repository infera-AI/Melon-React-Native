import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from './AuthNavigator';
import theme from '../../utils/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { normalize, normalizeFontSize } from '../../utils/stylesUtil';
import { verifyInvitationCode } from '../../api/profile/profile';
type InvitationCodeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'InvitationCode'>;

const InvitationCodeScreen: React.FC = () => {
  const navigation = useNavigation<InvitationCodeScreenNavigationProp>();
  const { t } = useLanguage();
  const [invitationCode, setInvitationCode] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleConfirm = async () => {
    if (invitationCode.trim()) {
      //验证邀请码
      const response = await verifyInvitationCode({
        invitation_code: invitationCode,
      });
      console.log('Verify invitation code:', response);
      // 处理邀请码确认逻辑
      navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] })

    }
  };

  const handleSkip = () => {
    // 跳过邀请码填写
    navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] })
    // 导航到下一个页面
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 导航栏 */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image
            source={require('@/assets/main/page_return_icon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.titleText}>Fill in invitation code</Text>
      </View>

      {/* 说明文字 */}
      <Text style={styles.descriptionText}>
        Enter your friend's invitation code to earn points rewards for both of you.
      </Text>

      {/* 输入框 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Please enter the invitation code"
          placeholderTextColor="rgba(176, 176, 176, 1)"
          value={invitationCode}
          onChangeText={setInvitationCode}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </View>

      {/* 确认按钮 */}
      <TouchableOpacity
        style={[styles.confirmButton, !invitationCode.trim() && styles.disabledButton]}
        onPress={handleConfirm}
        disabled={!invitationCode.trim()}
      >
        <Text style={styles.confirmButtonText}>CONFIRM</Text>
      </TouchableOpacity>

      {/* 跳过按钮 */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>SKIP</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: normalize(24),
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(12),
    marginTop: normalize(17),
  },
  timeText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: normalize(20),
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
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: normalize(40),
    marginTop: normalize(17),
  },
  backButton: {
    position: 'absolute',
    left: 0,
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
  titleText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: normalize(21),
  },
  descriptionText: {
    fontSize: normalizeFontSize(24),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'left',
    letterSpacing: -0.4,
    lineHeight: normalize(32),
    marginTop: normalize(73),
    marginBottom: normalize(39),
  },
  inputContainer: {
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    height: normalize(56),
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: normalize(16),
  },
  input: {
    fontSize: normalizeFontSize(15),
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: normalize(20),
    fontFamily: 'SF Pro-Regular',
    fontWeight: 'normal',
    height: normalize(56),
  },
  confirmButton: {
    backgroundColor: 'rgba(133, 243, 128, 0.8)',
    borderRadius: normalize(50),
    height: normalize(74),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(50),
  },
  disabledButton: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: 'rgba(62, 62, 62, 1)',
    letterSpacing: -0.4,
    lineHeight: normalize(21),
  },
  skipButton: {
    borderRadius: normalize(50),
    height: normalize(74),
    borderWidth: 2,
    borderColor: 'rgba(133, 243, 128, 1)',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(24),
  },
  skipButtonText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: normalize(21),
  },
});

export default InvitationCodeScreen;
