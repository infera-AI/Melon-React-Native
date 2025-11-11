import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import theme from '@/utils/theme';
import { usePointsStore } from '@/store/modules/points.store';
import { useNavigation } from '@react-navigation/native';
import JiliAdBtn from '@/components/JiliAdBtn';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleSize } from '@/utils/scale';

interface PointsConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onDontShowAgain?: (dontShow: boolean) => void;
}

const PointsLimitModal: React.FC<PointsConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  onCancel,
  onDontShowAgain,
}) => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets(); // 获取安全区域距离
  const { text } = useGlobalTheme();
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const { pointsBalance } = usePointsStore.getState();
  const _handleDontShowAgain = () => {
    const newValue = !dontShowAgain;
    setDontShowAgain(newValue);
    onDontShowAgain?.(newValue);
  };

  const handleConfirm = () => {
    onConfirm();
    // (navigation as any).navigate('Profile', {
    //   screen: 'Purchase'
    // });
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
        <View style={[styles.modalContainer, {paddingBottom: insets.bottom ? insets.bottom - scaleSize(8) : scaleSize(0)}]}>
          {/* 拖拽指示器 */}
          <View style={styles.dragIndicator} />

          {/* 标题 */}
          <View style={styles.titleContainer}>
            <Text style={[styles.titleText, text]}>
            </Text>
          </View>

          {/* 内容 */}
          <View style={styles.contentContainer}>
            <Text style={[styles.contentText, text]}>
              {t('music.credit_limit_insufficient')}
            </Text>
          </View>

          {/* 积分余额 */}
          <View style={styles.balanceContainer}>
            <Text style={[styles.balanceLabel]}>
              {t('music.points_balance')}
            </Text>
            <Text style={[styles.balanceValue, { color: theme.primary }]}>
              &nbsp;{pointsBalance || 0}
            </Text>
          </View>

          {/* 按钮组 */}
          <View style={styles.buttonContainer}>
            {/* <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, text]}>
                {t('music.watch_ads')}
              </Text>
            </TouchableOpacity> */}
            <JiliAdBtn
              style={styles.cancelButton}
              renderContent={() => {
                return (
                  <Text style={[styles.cancelButtonText, text]}>
                    {t('music.watch_ads')}
                  </Text>
                )
              }}
              adCloseHandle={() => {
                setTimeout(() => {
                  onClose()
                })
                // ;
                // handleCancel()
              }}
            />
            

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>
                {t('music.points_topup')}
              </Text>
            </TouchableOpacity>
          </View>
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
    // height: normalize(243),
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
    paddingHorizontal: normalize(24),
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
  contentText: {
    fontSize: normalizeFontSize(17),
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: normalize(22),
    letterSpacing: -0.4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: normalize(30),
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

export default PointsLimitModal;
