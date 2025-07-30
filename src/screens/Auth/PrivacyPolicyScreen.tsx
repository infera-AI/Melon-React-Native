import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  ScrollView,
  Image,
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
  return Math.min(Math.round(newSize), size);
};

type PrivacyPolicyScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'PrivacyPolicy'>;

const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation<PrivacyPolicyScreenNavigationProp>();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181819" />
      
      {/* 状态栏占位 */}
      <View style={styles.statusBarPlaceholder} />
      
      {/* 主要内容容器 */}
      <View style={styles.contentContainer}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <View style={styles.backIcon}>
              <Image source={require('../../assets/main/page_return_icon.png')} style={styles.backIcon} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        {/* 协议内容 */}
        <ScrollView style={styles.agreementContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.agreementText}>
            Introduction{'\n\n'}
            Chapter 1  Information Collection{'\n'}
            1.1 We collect information you provide directly to us.{'\n\n'}
            Chapter 2  Information Usage{'\n'}
            2.1 We use the information we collect to provide and improve our services.{'\n'}
            2.2 We may use your information to communicate with you.{'\n\n'}
            Chapter 3  Information Sharing{'\n'}
            3.1 We do not sell, trade, or otherwise transfer your personal information.{'\n'}
            3.2 We may share information with third-party service providers.
          </Text>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
  },
  statusBarPlaceholder: {
    height: Platform.OS === 'ios' ? 44 : 24,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: normalize(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(12),
    marginBottom: normalize(18),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: normalize(16),
    height: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  headerSpacer: {
    width: normalize(40),
  },
  agreementContainer: {
    flex: 1,
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(20),
  },
  agreementText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#B0B0B0',
    lineHeight: normalize(20),
    letterSpacing: -0.4,
  },
});

export default PrivacyPolicyScreen; 