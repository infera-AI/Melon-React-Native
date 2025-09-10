/**
 * 注：已兼容顶部安全区域
 * 使用示例
 * import CustomNavigation from '@/components/CustomNavigation';
 * <CustomNavigation
      text="设置"
      backgroundColor="#181819"
      onBack={() => navigation.goBack()} // 可传可不传
    />
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator'
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 安全区
import { scaleSize, scaleFont } from '@/utils/scale';

type Props = {
  text?: string;
  rightBtnText?: string;
  backgroundColor?: string;
  useTopSafeArea?: boolean;
  onBack?: (() => void) | null | undefined;
  rightBtnClick?: (() => void) | null | undefined;
  textStyle?: TextStyle;
  style?: ViewStyle;
};

const CustomNavigation: React.FC<Props> = ({
  text = '',
  rightBtnText = '',
  backgroundColor = '#2196F3',
  useTopSafeArea = true,
  onBack = null,
  rightBtnClick = null,
  textStyle,
  style
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets(); // 获取安全区高度

  const backBtnClick = () => {
    if (onBack) {
      onBack()
    } else {
      navigation.goBack()
    }
  }

  const rightClick = () => {
    if (rightBtnClick) {
      rightBtnClick()
    }
  }
  return (
    <View>
      {useTopSafeArea && <View style={{ height: insets.top }} />}
      
      <View style={[styles.container, { backgroundColor }, style]}>
        {
          rightBtnText ? null :
          <Text style={[styles.title, textStyle]} numberOfLines={1}>{text}</Text>
        }
        
        <TouchableOpacity onPress={backBtnClick} style={styles.backButton}>
          <Text>
            <Icon name="chevron-back" size={18} color="#fff" />
          </Text>
        </TouchableOpacity>
        {
          rightBtnText ?
          <TouchableOpacity onPress={rightClick} style={styles.rightButton}>
            <Text style={styles.rightBtnText}>
              {rightBtnText}
            </Text>
          </TouchableOpacity>
          : null
        }
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: scaleSize(56),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleSize(12),
    justifyContent: 'center',
    elevation: 4, // Android 阴影
    shadowColor: '#000', // iOS 阴影
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: scaleSize(40),
    height: scaleSize(40),
    backgroundColor: '#3E3E3E',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scaleSize(12),
    position: 'absolute',
    left: 16,
  },
  rightButton: {
    width: 'auto',
    height: 'auto',
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    position: 'absolute',
    right: 16,
    paddingVertical: scaleSize(5),
    paddingHorizontal: scaleSize(22)
  },
  rightBtnText: {
    fontSize: scaleFont(12),
    color: '#fff',
    fontWeight: '500',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: scaleFont(16),
    fontWeight: '600',
  },
});

export default CustomNavigation;