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
import { usePointsStore } from '@/store/modules/points.store';

interface PointsConfirmModalProps {
  visible: boolean;
  leftBtnText?: string;
  rightBtnText?: string;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onDontShowAgain?: (dontShow: boolean) => void;
  title: React.ReactNode;
}

const PointsConfirmModal: React.FC<PointsConfirmModalProps> = ({
  visible,
  leftBtnText,
  rightBtnText,
  onClose,
  onConfirm,
  onCancel,
  title,
  onDontShowAgain,
}) => {
  const { t } = useLanguage();
  const { text, textSecondary } = useGlobalTheme();
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const { pointsBalance } = usePointsStore.getState();

  const handleDontShowAgain = () => {
    const newValue = !dontShowAgain;
    setDontShowAgain(newValue);
    onDontShowAgain?.(newValue);
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
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

          {/* 积分消耗提示 */}
          <View style={styles.pointsTextContainer}>
            <Text style={[styles.pointsText, text]}>
              {title}
            </Text>
          </View>

          {/* 积分余额 */}
          <View style={styles.balanceContainer}>
            <Text style={[styles.balanceLabel]}>
              {t('music.points_balance')}
            </Text>
            <Text style={[styles.balanceValue, { color: theme.primary }]}>
              &nbsp;{pointsBalance}
            </Text>
          </View>

          {/* 按钮组 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, text]}>
                {leftBtnText || t('music.use_points')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>
                {rightBtnText || t('music.free_generation')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 不再提示选项 */}
          {/* <View style={styles.dontShowContainer}>
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
              {t('points_confirm.dont_show_again')}
            </Text>
          </View> */}
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
    minHeight: normalize(243),
    alignItems: 'center',
    paddingHorizontal: normalize(24),
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
  pointsTextContainer: {
    marginTop: normalize(20),
    marginBottom: normalize(18),
    alignItems: 'center',
  },
  pointsText: {
    fontSize: normalizeFontSize(17),
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: normalize(22),
    letterSpacing: -0.4,
    paddingHorizontal: normalize(8),
  },
  pointsHighlight: {
    color: theme.primary,
    fontWeight: '500',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(18),
    justifyContent: 'center',
  },
  balanceLabel: {
    fontSize: normalizeFontSize(13),
    fontWeight: '400',
    color: theme.textPrimary,
    letterSpacing: -0.4,
  },
  balanceValue: {
    fontSize: normalizeFontSize(12),
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: normalize(16),
  },
  cancelButton: {
    backgroundColor: theme.backgroundTertiary,
    borderRadius: normalize(12),
    height: normalize(45),
    flex: 1,
    marginRight: normalize(17),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    letterSpacing: -0.4,
    lineHeight: normalize(21),
  },
  confirmButton: {
    backgroundColor: theme.primary,
    borderRadius: normalize(12),
    height: normalize(45),
    flex: 1,
    marginLeft: normalize(17),
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: theme.background,
    letterSpacing: -0.4,
    lineHeight: normalize(21),
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

export default PointsConfirmModal;
