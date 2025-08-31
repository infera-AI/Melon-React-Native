import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import CommonModal from './CommonModal';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import theme from '@/utils/theme';

const CommonModalExample: React.FC = () => {
  const { text } = useGlobalTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<any>(null);
  const [_dontShowAgain, setDontShowAgain] = useState(false);

  const handleShowPointsConfirm = () => {
    setModalConfig({
      title: '积分确认',
      content: '即将为您创建歌曲，花费 50 积分',
      icon: require('@/assets/music/music_tips_icon.png'),
      buttons: [
        {
          text: '取消',
          onPress: () => console.log('用户取消操作'),
          type: 'secondary' as const,
        },
        {
          text: '确认',
          onPress: () => console.log('用户确认花费积分'),
          type: 'primary' as const,
        },
      ],
      showDontShowAgain: true,
    });
    setModalVisible(true);
  };

  const handleShowPointsInsufficient = () => {
    setModalConfig({
      title: '积分不足',
      content: '当前积分余额不足，请观看广告或前往充值',
      icon: require('@/assets/music/music_warning_icon.png'),
      buttons: [
        {
          text: '观看广告',
          onPress: () => console.log('用户选择观看广告'),
          type: 'secondary' as const,
        },
        {
          text: '积分充值',
          onPress: () => console.log('用户选择充值'),
          type: 'primary' as const,
        },
      ],
      showDontShowAgain: true,
    });
    setModalVisible(true);
  };

  const handleShowCustomModal = () => {
    setModalConfig({
      title: '自定义弹窗',
      customContent: (
        <View style={styles.customContent}>
          <Text style={[styles.customText, text]}>
            这是一个自定义内容的弹窗示例
          </Text>
          <View style={styles.customItem}>
            <Text style={[styles.customLabel, text]}>项目1: 100积分</Text>
          </View>
          <View style={styles.customItem}>
            <Text style={[styles.customLabel, text]}>项目2: 200积分</Text>
          </View>
        </View>
      ),
      buttons: [
        {
          text: '确定',
          onPress: () => console.log('用户确定'),
          type: 'primary' as const,
        },
      ],
    });
    setModalVisible(true);
  };

  const handleShowDangerModal = () => {
    setModalConfig({
      title: '危险操作',
      content: '此操作不可撤销，确定要继续吗？',
      icon: require('@/assets/music/music_warning_icon.png'),
      buttons: [
        {
          text: '取消',
          onPress: () => console.log('用户取消'),
          type: 'secondary' as const,
        },
        {
          text: '删除',
          onPress: () => console.log('用户确认删除'),
          type: 'danger' as const,
        },
      ],
    });
    setModalVisible(true);
  };

  const handleShowBottomSheet = () => {
    setModalConfig({
      title: '底部弹窗',
      content: '这是一个底部弹出的弹窗示例，带有拖拽指示器',
      buttons: [
        {
          text: '取消',
          onPress: () => console.log('用户取消'),
          type: 'secondary' as const,
        },
        {
          text: '确认',
          onPress: () => console.log('用户确认'),
          type: 'primary' as const,
        },
      ],
    });
    setModalVisible(true);
  };

  const handleDontShowAgain = (value: boolean) => {
    setDontShowAgain(value);
    console.log('不再提示设置:', value);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={handleShowPointsConfirm}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, text]}>
          积分确认弹窗
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.buttonSecondary]}
        onPress={handleShowPointsInsufficient}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, text]}>
          积分不足弹窗
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.buttonCustom]}
        onPress={handleShowCustomModal}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, text]}>
          自定义内容弹窗
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.buttonDanger]}
        onPress={handleShowDangerModal}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, text]}>
          危险操作弹窗
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.buttonBottom]}
        onPress={handleShowBottomSheet}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, text]}>
          底部弹出弹窗
        </Text>
      </TouchableOpacity>

      {modalConfig && (
        <CommonModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          config={modalConfig}
          onDontShowAgain={handleDontShowAgain}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(20),
  },
  button: {
    backgroundColor: theme.primary,
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(24),
    borderRadius: normalize(8),
    marginBottom: normalize(16),
    minWidth: normalize(200),
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: theme.backgroundTertiary,
  },
  buttonCustom: {
    backgroundColor: '#FF6B6B',
  },
  buttonDanger: {
    backgroundColor: theme.error || '#FF4444',
  },
  buttonBottom: {
    backgroundColor: '#4A90E2',
  },
  buttonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: theme.background,
  },
  customContent: {
    width: '100%',
    alignItems: 'center',
  },
  customText: {
    fontSize: normalizeFontSize(16),
    marginBottom: normalize(16),
    textAlign: 'center',
  },
  customItem: {
    backgroundColor: theme.backgroundTertiary,
    padding: normalize(12),
    borderRadius: normalize(8),
    marginBottom: normalize(8),
    width: '100%',
  },
  customLabel: {
    fontSize: normalizeFontSize(14),
    textAlign: 'center',
  },
});

export default CommonModalExample;
