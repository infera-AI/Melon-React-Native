/**
 * 通过modal,解决在android中圆角modal显示时闪屏的问题
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Animated
} from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  backdropOpacity?: number;
  bottomSafeBgColor?: string; // 设置底部安全区域颜色，防止安全区域颜色不一致 注： 不设置，外部调用方兼容
  renderContent?: () => JSX.Element;
  onBackdropPress?: (() => void) | null | undefined; // 点击背景关闭回调
};
const PublicModal: React.FC<Props> = ({
  visible = false,
  backdropOpacity = 0.4,
  bottomSafeBgColor = 'transparent',
  renderContent = () => <View/>,
  onBackdropPress = null,
}) => {

  // const insets = useSafeAreaInsets(); // 获取安全区域距离
  
  const opacityAnim = useRef(new Animated.Value(0)).current; // 初始透明度0（完全透明）

  const bgClose = () => {
    onBackdropPress && onBackdropPress()
  }

  // 当 `visible` 改变时触发动画
  useEffect(() => {
    if (visible) {
      // fadeIn();  // 显示时触发透明度动画
      Animated.timing(opacityAnim, {
        toValue: 1,          // 目标透明度为1（完全不透明）
        duration: 10,
        useNativeDriver: true, // 透明度支持原生动画驱动
      }).start();
    } else {
      // fadeOut(); // 隐藏时触发透明度动画
      Animated.timing(opacityAnim, {
        toValue: 0,          // 目标透明度为0
        useNativeDriver: true,
      }).start();
    }
  }, [visible, opacityAnim]);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={bgClose}  // 点击背景关闭
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={backdropOpacity}
      backdropTransitionOutTiming={1} // 避免关闭时mask闪
      hideModalContentWhileAnimating={true} // 内容在动画过程中隐藏
      style={{
        justifyContent: 'flex-end', // 让 modal 停在底部
        margin: 0, // 取消默认 margin，不然内容会上浮
      }}
    >
      <Animated.View style={[{ opacity: opacityAnim }]}>
        <View>
          {renderContent && renderContent()}
          {/* 底部安全区域 */}
          {/* <View style={{paddingBottom: insets.bottom, backgroundColor: bottomSafeBgColor}}/> */}
        </View>
      </Animated.View>
      
    </Modal>
  )
}

export default PublicModal;