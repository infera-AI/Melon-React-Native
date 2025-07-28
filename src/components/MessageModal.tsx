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
  title?: string;
  message: string;
  confirmText?: string;
  onClose?: () => void;
  onConfirm?: () => void;
  showCancel?: boolean;
  cancelText?: string;
  onCancel?: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({
  visible,
  title,
  message,
  confirmText,
  onClose,
  onConfirm,
  showCancel,
  cancelText,
  onCancel,
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
        {title && <Text style={styles.title}>{title}</Text>}
        <Text style={styles.message}>{message}</Text>
        {(confirmText || showCancel) && (
          <View style={styles.buttonContainer}>
            {showCancel && (
              <Text style={styles.cancelButton} onPress={onCancel}>
                {cancelText || '取消'}
              </Text>
            )}
            {confirmText && (
              <Text style={styles.confirmButton} onPress={onConfirm}>
                {confirmText}
              </Text>
            )}
          </View>
        )}
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
  title: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: normalize(8),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: normalize(16),
    width: '100%',
  },
  cancelButton: {
    fontSize: normalize(14),
    color: '#ccc',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
  },
  confirmButton: {
    fontSize: normalize(14),
    color: '#fff',
    fontWeight: '600',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
  },
});

export default MessageModal; 