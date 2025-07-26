import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import theme from '../utils/theme';

const { width: screenWidth } = Dimensions.get('window');

const normalize = (size: number) => {
  const newSize = size * screenWidth / 375;
  return Math.round(newSize);
};

interface MessageModalProps {
  visible: boolean;
  message: string;
  onClose?: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({
  visible,
  message,
  onClose,
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.container}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    // 不再需要半透明背景
  },
  container: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: normalize(12),
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(32),
    minWidth: normalize(120),
    maxWidth: normalize(280),
    alignItems: 'center',
  },
  message: {
    fontSize: normalize(15),
    color: '#fff',
    textAlign: 'center',
    lineHeight: normalize(22),
  },
});

export default MessageModal; 