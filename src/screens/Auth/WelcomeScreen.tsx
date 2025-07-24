import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from './AuthNavigator';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 响应式工具函数
const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const newSize = based === 'height' ? size * screenHeight / 812 : size * screenWidth / 375;
  return Math.round(newSize);
};

// 字体大小响应式函数
const normalizeFontSize = (size: number) => {
  const newSize = size * screenWidth / 375;
  return Math.min(Math.round(newSize), size); // 确保字体不会过大
};

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Initial'>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleRegister = () => {
    navigation.navigate('RegisterEmail');
  };

  const handleLogin = () => {
    navigation.navigate('LoginEmail');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181819" />
      
      {/* 背景装饰圆圈 */}
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />
      
      {/* 主要内容容器 */}
      <View style={styles.contentContainer}>
        {/* 状态栏占位 */}
        <View style={styles.statusBarPlaceholder} />
        
        {/* Melon Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>M</Text>
          </View>
        </View>
        
        {/* Melon 标题 */}
        <Text style={styles.title}>Melon</Text>
        
        {/* 标语 */}
        <Text style={styles.slogan}>MELON SLOGAN</Text>
        
        {/* 注册按钮 */}
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register a Melon account</Text>
        </TouchableOpacity>
        
        {/* 登录链接 */}
        <TouchableOpacity style={styles.loginLink} onPress={handleLogin}>
          <Text style={styles.loginLinkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
        
        {/* 语言选择器 */}
        <View style={styles.languageSelector}>
          <View style={styles.languageContainer}>
            <View style={styles.flagContainer}>
              <Image
                source={require('../../../assets/images/flag_usuk.png')}
                style={styles.flag}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.languageText}>English</Text>
            <View style={styles.dropdownIcon}>
              <Text style={styles.dropdownText}>▼</Text>
            </View>
          </View>
        </View>
        
        {/* 用户协议 */}
        <View style={styles.agreementContainer}>
          <View style={styles.checkboxContainer}>
            <View style={styles.checkbox} />
          </View>
          <Text style={styles.agreementText}>
            By registering or logging in, you have read and agreed to the User Service Agreement and Privacy Policy.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#181819',
    },
    backgroundCircle1: {
      position: 'absolute',
      width: normalize(399),
      height: normalize(359, 'height'),
      left: -normalize(204),
      top: -normalize(230, 'height'),
      borderRadius: normalize(199.5),
      backgroundColor: 'transparent',
      opacity: 0.6,
      shadowColor: '#85F380',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: normalize(158.8),
      elevation: 10,
    },
    backgroundCircle2: {
      position: 'absolute',
      width: normalize(377),
      height: normalize(339, 'height'),
      right: -normalize(324),
      bottom: -normalize(624, 'height'),
      borderRadius: normalize(188.5),
      backgroundColor: 'transparent',
      shadowColor: '#85F380',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: normalize(158.8),
      elevation: 10,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: normalize(24),
      width: normalize(327),
    },
    statusBarPlaceholder: {
      height: Platform.OS === 'ios' ? 44 : 24,
    },
    logoContainer: {
      alignItems: 'center',
      marginTop: normalize(40, 'height'),
      marginBottom: normalize(20, 'height'),
    },
    logoPlaceholder: {
      width: normalize(85),
      height: normalize(87, 'height'),
      borderRadius: normalize(16),
      backgroundColor: '#262626',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      fontSize: normalizeFontSize(48),
      fontWeight: '700',
      color: '#85F380',
    },
    title: {
      fontSize: normalizeFontSize(48),
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: normalize(25, 'height'),
      color: '#85F380',
      textShadowColor: '#79B1FF',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: normalize(10),
    },
    slogan: {
      fontSize: normalizeFontSize(15),
      fontWeight: '400',
      textAlign: 'center',
      color: '#B0B0B0',
      marginBottom: normalize(100, 'height'),
      letterSpacing: -0.4,
    },
    registerButton: {
      backgroundColor: '#85F380',
      borderRadius: 50,
      paddingVertical: normalize(12, 'height'),
      paddingHorizontal: normalize(16),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: normalize(16, 'height'),
    },
    registerButtonText: {
      fontSize: normalizeFontSize(18),
      fontWeight: '700',
      color: '#3E3E3E',
      textAlign: 'center',
      letterSpacing: -0.4,
    },
    loginLink: {
      alignItems: 'center',
      marginBottom: normalize(68, 'height'),
    },
    loginLinkText: {
      fontSize: normalizeFontSize(13),
      fontWeight: '400',
      color: '#B0B0B0',
      textAlign: 'center',
      letterSpacing: -0.4,
    },
    languageSelector: {
      alignItems: 'center',
      marginBottom: normalize(50, 'height'),
    },
    languageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#262626',
      borderRadius: normalize(12),
      paddingVertical: normalize(16, 'height'),
      paddingHorizontal: normalize(48),
      width: normalize(213),
      height: normalize(48, 'height'),
    },
    flagContainer: {
      width: normalize(20),
      height: normalize(20),
      marginRight: normalize(12),
    },
    flag: {
      width: '100%',
      height: '100%',
    },
    languageText: {
      fontSize: normalizeFontSize(14),
      fontWeight: '500',
      color: '#FFFFFF',
      flex: 1,
    },
    dropdownIcon: {
      width: normalize(10.67),
      height: normalize(6, 'height'),
      alignItems: 'center',
      justifyContent: 'center',
    },
    dropdownText: {
      fontSize: normalizeFontSize(8),
      color: '#FFFFFF',
    },
    agreementContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: normalize(20),
    },
    checkboxContainer: {
      marginRight: normalize(8),
      marginTop: normalize(2, 'height'),
    },
    checkbox: {
      width: normalize(17),
      height: normalize(17),
      borderWidth: 1,
      borderColor: '#B0B0B0',
      borderRadius: 2,
      backgroundColor: 'transparent',
    },
    agreementText: {
      fontSize: normalizeFontSize(12),
      fontWeight: '400',
      color: '#B0B0B0',
      lineHeight: normalize(18, 'height'),
      textAlign: 'center',
      flex: 1,
      letterSpacing: -0.4,
    },
  });

export default WelcomeScreen; 