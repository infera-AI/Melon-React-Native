/**
 * 使用示例：
 * import FullScreenLoader from '@/components/FullScreenLoader';
 * <FullScreenLoader
      visible={loading}
      text="请稍候..."
      timeout={5000}
      onTimeout={() => setLoading(false)}
    />
 */
import React, { useEffect } from 'react';
import {
  Modal,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';

type Props = {
  visible: boolean;
  text?: string;
  color?: string;
  backgroundColor?: string;
  spinnerSize?: 'small' | 'large';
  customIndicator?: React.ReactNode;
  timeout?: number;
  onTimeout?: () => void;
  progress?: number;
};

const FullScreenLoader: React.FC<Props> = ({
  visible = false,
  text = '加载中...',
  color = '#fff',
  backgroundColor = 'rgba(0,0,0,0.5)',
  spinnerSize = 'large',
  customIndicator = null,
  timeout = null, // ❗超时时间（单位 ms）
  onTimeout = null, // ❗超时后回调
  progress = null, // ❗0~1 显示进度条文本
}) => {
  useEffect(() => {
    let timer: any;
    if (visible && timeout) {
      timer = setTimeout(() => {
        onTimeout?.();
      }, timeout);
    }
    return () => clearTimeout(timer);
  }, [visible, timeout]);

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={[styles.overlay, { backgroundColor }]}>
        <View style={styles.content}>
          <View style={styles.box}> 
            <Text>
              {customIndicator ? (
                customIndicator
              ) : (
                <ActivityIndicator size={spinnerSize} color={color} />
              )}
            </Text>
            

            <Text style={[styles.text, { color }]}>
              {progress != null
                ? `${text} ${Math.round(progress * 100)}%`
                : text}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  box: {
    backgroundColor: '#333', // 小方块背景色
    padding: 20,
    borderRadius: 8,  // 圆角
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',  // 阴影
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,  // Android 阴影
    minWidth: 140,
    width: 'auto',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default FullScreenLoader;