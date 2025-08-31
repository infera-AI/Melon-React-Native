import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import theme from '@/utils/theme';

// 按钮配置接口
interface ButtonConfig {
  text: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'danger'| 'border';
  disabled?: boolean;
}

// 弹窗配置接口
interface ModalConfig {
  title?: string;
  content?: string;
  icon?: any; // 图标资源
  buttons: ButtonConfig[];
  showDontShowAgain?: boolean;
  customContent?: React.ReactNode; // 自定义内容
}

interface CommonModalProps {
  visible: boolean;
  onClose: () => void;
  config: ModalConfig;
  onDontShowAgain?: (dontShow: boolean) => void;
}

const CommonModal: React.FC<CommonModalProps> = ({
  visible,
  onClose,
  config,
  onDontShowAgain,
}) => {
  const { t } = useLanguage();
  const { text, textSecondary } = useGlobalTheme();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleDontShowAgain = () => {
    const newValue = !dontShowAgain;
    setDontShowAgain(newValue);
    onDontShowAgain?.(newValue);
  };

  const handleButtonPress = (button: ButtonConfig) => {
    if (!button.disabled) {
      button.onPress();
      onClose();
    }
  };

  const getButtonStyle = (button: ButtonConfig) => {
    const baseStyle = [styles.button];
    
    switch (button.type) {
      case 'primary':
        baseStyle.push(styles.primaryButton);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButton);
        break;
      case 'danger':
        baseStyle.push(styles.dangerButton);
        break;
      case 'border':
        baseStyle.push(styles.borderButton);
        break;
      default:
        baseStyle.push(styles.secondaryButton);
    }

    if (button.disabled) {
      baseStyle.push(styles.disabledButton);
    }

    return baseStyle;
  };

  const getButtonTextStyle = (button: ButtonConfig) => {
    const baseStyle = [styles.buttonText];
    
    switch (button.type) {
      case 'primary':
        baseStyle.push(styles.primaryButtonText);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButtonText);
        break;
      case 'danger':
        baseStyle.push(styles.dangerButtonText);
        break;
      case 'border':
        baseStyle.push(styles.borderButtonText);
        break;
      default:
        baseStyle.push(styles.secondaryButtonText);
    }

    if (button.disabled) {
      baseStyle.push(styles.disabledButtonText);
    }

    return baseStyle;
  };

  const renderButtons = () => {
    if (config.buttons.length === 1) {
      const button = config.buttons[0];
      return (
        <View style={styles.singleButtonContainer}>
          <TouchableOpacity 
            style={getButtonStyle(button)}
            onPress={() => handleButtonPress(button)}
            activeOpacity={0.7}
            disabled={button.disabled}
          >
            <Text style={getButtonTextStyle(button)}>
              {button.text}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.buttonContainer}>
        {config.buttons.map((button, index) => (
          <TouchableOpacity 
            key={index}
            style={[
              getButtonStyle(button),
              index > 0 && { marginLeft: normalize(17) }
            ]}
            onPress={() => handleButtonPress(button)}
            activeOpacity={0.7}
            disabled={button.disabled}
          >
            <Text style={getButtonTextStyle(button)}>
              {button.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          {/* 拖拽指示器 */}
          <View style={styles.dragIndicator} />
          
          {/* 图标 */}
          {config.icon && (
            <View style={styles.iconContainer}>
              <Image 
                source={config.icon}
                style={styles.icon}
              />
            </View>
          )}

          {/* 标题 */}
          {config.title && (
            <View style={styles.titleContainer}>
              <Text style={[styles.titleText, text]}>
                {config.title}
              </Text>
            </View>
          )}

          {/* 内容 */}
          {config.customContent ? (
            <View style={styles.customContentContainer}>
              {config.customContent}
            </View>
          ) : config.content ? (
            <View style={styles.contentContainer}>
              <Text style={[styles.contentText, text]}>
                {config.content}
              </Text>
            </View>
          ) : null}

          {/* 按钮组 */}
          {renderButtons()}

          {/* 不再提示选项 */}
          {config.showDontShowAgain && (
            <View style={styles.dontShowContainer}>
              <TouchableOpacity 
                style={[
                  styles.checkbox,
                  dontShowAgain && styles.checkboxChecked
                ]}
                onPress={handleDontShowAgain}
              >
                {dontShowAgain && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
              <Text style={[styles.dontShowText, textSecondary]}>
                {t('common.dont_show_again')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: theme.backgroundSecondary,
    borderTopLeftRadius: normalize(16),
    borderTopRightRadius: normalize(16),
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: normalize(24),
    paddingBottom: normalize(30),
  },
  dragIndicator: {
    backgroundColor: theme.backgroundTertiary,
    borderRadius: normalize(4),
    width: normalize(50),
    height: normalize(4),
    marginTop: normalize(16),
    marginBottom: normalize(16),
  },
  iconContainer: {
    marginBottom: normalize(16),
    alignItems: 'center',
  },
  icon: {
    width: normalize(36),
    height: normalize(36),
  },
  titleContainer: {
    marginBottom: normalize(18),
    alignItems: 'center',
  },
  titleText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: normalize(20),
  },
  contentContainer: {
    marginBottom: normalize(18),
    alignItems: 'center',
  },
  contentText: {
    fontSize: normalizeFontSize(17),
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: normalize(22),
    letterSpacing: -0.4,
    paddingHorizontal: normalize(8),
    marginTop: normalize(16),
  },
  customContentContainer: {
    marginBottom: normalize(18),
    width: '100%',
  },
  singleButtonContainer: {
    width: '100%',
    marginBottom: normalize(16),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: normalize(16),
  },
  button: {
    flex: 1,
    height: normalize(45),
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: theme.primary,
  },
  secondaryButton: {
    backgroundColor: theme.backgroundTertiary,
  },
  dangerButton: {
    backgroundColor: theme.error || '#FF4444',
  },
  borderButton: {
    backgroundColor: theme.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  disabledButton: {
    backgroundColor: theme.textTertiary,
    opacity: 0.5,
  },
  buttonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    letterSpacing: -0.4,
    lineHeight: normalize(21),
  },
  primaryButtonText: {
    color: theme.background,
  },
  secondaryButtonText: {
    color: theme.text,
  },
  dangerButtonText: {
    color: theme.background,
  },
  borderButtonText: {
    color: theme.textPrimary,
  },
  disabledButtonText: {
    color: theme.textSecondary,
  },
  dontShowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(8),
  },
  checkbox: {
    width: normalize(12),
    height: normalize(12),
    borderRadius: normalize(4),
    borderWidth: 1,
    borderColor: theme.textTertiary,
    marginRight: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  checkmark: {
    fontSize: normalizeFontSize(8),
    color: theme.background,
    fontWeight: 'bold',
  },
  dontShowText: {
    fontSize: normalizeFontSize(13),
    fontWeight: '400',
    letterSpacing: -0.4,
  },
});

export default CommonModal;
