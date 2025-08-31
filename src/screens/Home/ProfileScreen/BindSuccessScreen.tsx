import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../../utils/theme';
import { normalize, normalizeFontSize } from '../../../utils/stylesUtil';
import { ProfileStackParamList } from './ProfileNavigator';

type BindSuccessScreenRouteProp = RouteProp<ProfileStackParamList, 'BindSuccess'>;
type BindSuccessScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'BindSuccess'>;

const BindSuccessScreen: React.FC = () => {
  const navigation = useNavigation<BindSuccessScreenNavigationProp>();
  const route = useRoute<BindSuccessScreenRouteProp>();
  
  // 从路由参数获取绑定信息
  const bindType = route.params?.bindType || 'phone'; // 'phone' 或 'email'
  const bindValue = route.params?.bindValue || '+86 12378912345';

  const handleBack = () => {
    navigation.goBack();
  };

  const handleComplete = () => {
    // 返回上一页或首页
    navigation.goBack();
  };

  const getTitle = () => {
    return bindType === 'phone' ? 'Bind mobile number' : 'Bind email';
  };

  const getSuccessText = () => {
    return bindType === 'phone' ? 'Already bound phone number' : 'Email Already bound';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* 导航栏 */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image 
              source={require('../../../assets/main/page_return_icon.png')} 
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.titleText}>{getTitle()}</Text>
        </View>

        {/* 成功图标 */}
        <View style={styles.successIconContainer}>
          <Image source={require('@/assets/main/success_big_icon.png')} style={styles.successIcon} />
        </View>

        {/* 绑定信息 */}
        <View style={styles.bindInfoContainer}>
          <Text style={styles.successText}>{getSuccessText()}</Text>
          <Text style={styles.bindValueText}>{bindValue}</Text>
        </View>

        {/* 完成按钮 */}
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>complete</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: normalize(16)
  },
  // 状态栏样式
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(14),
    marginTop: normalize(17),
  },
  timeText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
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
  // 导航栏样式
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(17),
    height: normalize(40),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: 'rgba(62, 62, 62, 1)',
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: normalize(16),
    height: normalize(16),
  },
  titleText: {
    flex:1,
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: normalize(21),
  },
  // 成功图标
  successIconContainer: {
    alignItems: 'center',
    marginTop: normalize(66),
  },
  successIcon: {
    width: normalize(53),
    height: normalize(53),
    borderRadius: normalize(26.5),
  },
  // 绑定信息
  bindInfoContainer: {
    alignItems: 'center',
    marginTop: normalize(20),
  },
  successText: {
    fontSize: normalizeFontSize(24),
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: normalize(32),
  },
  bindValueText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: normalize(21),
    marginTop: normalize(8),
  },
  // 完成按钮
  completeButton: {
    width: "100%",
    height: normalize(74),
    backgroundColor: 'rgba(133, 243, 128, 0.7)',
    borderRadius: normalize(50),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(136),
  },
  completeButtonText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: 'rgba(62, 62, 62, 1)',
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: normalize(21),
  },
});

export default BindSuccessScreen;
