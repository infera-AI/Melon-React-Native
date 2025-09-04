import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import theme from '@/utils/theme';
import Clipboard from '@react-native-clipboard/clipboard';
import { useMessageModal } from '@/contexts/MessageModalContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface InvitationCodeModalProps {
  visible: boolean;
  onClose: () => void;
  invitationCode: string;
  title?: string;
}

const { width: screenWidth } = Dimensions.get('window');

const InvitationCodeModal: React.FC<InvitationCodeModalProps> = ({
  visible,
  onClose,
  invitationCode,
  title = 'Invitation Code',
}) => {
  const { text } = useGlobalTheme();
  const { show } = useMessageModal();
  const { t } = useLanguage();

  const handleCopy = () => {
    Clipboard.setString(invitationCode);
    show({
      message: t('common.copied_to_clipboard'),
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 顶部拖拽指示器 */}
          <View style={styles.grabHandle} />
          
          {/* 标题 */}
          <Text style={[styles.title, text]}>{title}</Text>
          
          {/* 邀请码 */}
          <Text style={[styles.invitationCode, text]}>{invitationCode}</Text>
          
          {/* 按钮区域 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopy}
              activeOpacity={0.7}
            >
              <Text style={styles.copyButtonText}>Copy</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: screenWidth * 0.85,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: normalize(16),
    paddingHorizontal: normalize(24),
    paddingTop: normalize(16),
    paddingBottom: normalize(24),
    alignItems: 'center',
  },
  grabHandle: {
    width: normalize(40),
    height: normalize(4),
    backgroundColor: theme.backgroundTertiary,
    borderRadius: normalize(2),
    marginBottom: normalize(20),
  },
  title: {
    fontSize: normalizeFontSize(18),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: normalize(24),
    letterSpacing: -0.4,
  },
  invitationCode: {
    fontSize: normalizeFontSize(24),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: normalize(32),
    letterSpacing: -0.4,
    color: theme.textPrimary,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: normalize(12),
  },
  cancelButton: {
    flex: 1,
    height: normalize(48),
    backgroundColor: theme.backgroundTertiary,
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.backgroundTertiary,
  },
  cancelButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: theme.textPrimary,
    letterSpacing: -0.4,
  },
  copyButton: {
    flex: 1,
    height: normalize(48),
    backgroundColor: theme.primary,
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: theme.background,
    letterSpacing: -0.4,
  },
});

export default InvitationCodeModal;

