import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from './AuthNavigator';
import RegisterEmailScreen from './RegisterEmailScreen';
import RegisterPhoneScreen from './RegisterPhoneScreen';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const newSize = based === 'height' ? size * screenHeight / 812 : size * screenWidth / 375;
  return Math.round(newSize);
};

const normalizeFontSize = (size: number) => {
  const newSize = size * screenWidth / 375;
  return Math.min(Math.round(newSize), size);
};

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'RegisterEmail'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleTabChange = (tab: 'email' | 'phone') => {
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181819" />
      
      {/* 顶部Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Melon account</Text>
        <View style={{ width: normalize(40) }} />
      </View>

      {/* Tab切换 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'email' && styles.activeTabButton]}
          onPress={() => handleTabChange('email')}
        >
          <Text style={[styles.tabText, activeTab === 'email' && styles.activeTabText]}>
            Email
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'phone' && styles.activeTabButton]}
          onPress={() => handleTabChange('phone')}
        >
          <Text style={[styles.tabText, activeTab === 'phone' && styles.activeTabText]}>
            Phone
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab内容 */}
      <View style={styles.tabContent}>
        {activeTab === 'email' ? (
          <RegisterEmailScreen />
        ) : (
          <RegisterPhoneScreen />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(24),
    marginTop: Platform.OS === 'ios' ? normalize(44, 'height') : normalize(24, 'height'),
    marginBottom: normalize(24, 'height'),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: '#fff',
    fontSize: normalizeFontSize(18),
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginLeft: -normalize(40), // 保证标题居中
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: normalize(24),
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    padding: normalize(4),
    marginBottom: normalize(24, 'height'),
  },
  tabButton: {
    flex: 1,
    paddingVertical: normalize(12, 'height'),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: normalize(8),
  },
  activeTabButton: {
    backgroundColor: '#85F380',
  },
  tabText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '500',
    color: '#B0B0B0',
  },
  activeTabText: {
    color: '#3E3E3E',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: normalize(24),
  },
});

export default RegisterScreen; 