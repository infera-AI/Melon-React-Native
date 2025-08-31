import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../ProfileNavigator';
import theme from '@/utils/theme';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pick } from '@react-native-documents/picker';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMessageModal } from '@/contexts/MessageModalContext';
import { useVoiceStore } from '@/store/modules/voice.store';
import CommonModal from '@/components/CommonModal';
import PointsLimitModal from '@/components/PointsLimitModal';
import { saveMaterials } from '@/api/profile/profile';

type VoiceprintMaterialCreateScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'VoiceprintMaterialCreate'>;

interface AudioFile {
  name: string;
  size: number;
  uri: string;
  type: string;
  fileCopyUri?: string;
}

const MAX_FILE_SIZE_MB = 100; // 文件大小限制（MB）

// 支持的文件类型
const audioFileTypes = [
  'audio/mpeg',           // .mp3
  'audio/wav',            // .wav
  'audio/mp4',            // .m4a
  'audio/aac',            // .aac
  'audio/ogg',            // .ogg
  'audio/flac',           // .flac
  'audio/x-m4a',          // .m4a (alternative MIME type)
];
// Android 支持的文件类型
const androidAudioTypes = [
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/aac',
  'audio/ogg',
  'audio/flac',
  'audio/x-m4a',
];

// iOS 支持的文件类型
const iosAudioTypes = [
  'public.audio',
  'public.mp3',
  'public.wav',
  'public.m4a',
  'public.aac',
  'public.ogg',
  'public.flac',
];

const VoiceprintMaterialCreateScreen: React.FC = () => {
  const navigation = useNavigation<VoiceprintMaterialCreateScreenNavigationProp>();
  const { materials, setMaterials } = useVoiceStore();
  const { t } = useLanguage();
  const { show } = useMessageModal();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPointsListModal, setShowPointsListModal] = useState(false);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [notSaveModalVisible, setNotSaveModalVisible] = useState(false);
  const [materialsName, setMaterialsName] = useState('');
  const handleBack = () => {
    setMaterials([]);
    navigation.replace('VoiceprintManagementList' as any);
  };


  const handleFileSelect = async () => {
    try {
      const res = await pick({
        type: Platform.OS === 'ios' ? iosAudioTypes : audioFileTypes,
        allowMultiSelection: false,
      });

      if (!res || res.length === 0) {
        console.log('用户取消选择文件');
        return;
      }

      const file = res[0];

      // 验证文件类型
      if (!androidAudioTypes.includes(file.type ?? '')) {
        show({
          message: t('music.unsupported_file_format')
        });
        return;
      }

      // 验证文件大小
      const fileSizeMB = (file.size ?? 0) / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        show({
          message: t('music.file_size_exceeded').replace('{maxSize}', MAX_FILE_SIZE_MB.toString())
        });
        return;
      }

      console.log('✅ 选中的音频文件:', file);
      setMaterials([...materials, file as AudioFile]);

    } catch (error) {
      console.error('文件选择失败:', error);
      show({
        message: t('music.file_selection_failed')
      });
    }
  };
  const handleDirectRecording = () => {
    navigation.navigate('CreateVoice' as any);
    console.log('Direct recording');
    // 这里可以处理直接录音逻辑
  };

  const handleStoreMaterials = async () => {
    setShowAddModal(false);
    try {
      const res = await saveMaterials({
        name: materialsName,
        file_list: materials.map(material => material.uri),
      });
      console.log(res, 'res');
      navigation.navigate('AudioMaterialLibrary' as any);

    } catch (error) {
      console.log(error, 'error');
    }

  };

  const handleSendTraining = () => {
    console.log('Send training');
    // 这里可以处理发送训练逻辑
  };

  const handleDeleteMaterial = (name: string) => {
    console.log('Delete material:', name);
    setMaterials(materials.filter(material => material.name !== name));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView>
        {/* 页面标题和返回按钮 */}
        <View style={styles.navBar}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Voiceprint Management</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => setNotSaveModalVisible(true)}>
              <Image
                source={require('@/assets/main/page_return_icon.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 创建选项卡片 */}
        <View style={styles.createOptionsContainer}>
          {/* 添加文件卡片 */}
          <TouchableOpacity style={styles.createOptionCard} onPress={handleFileSelect}>
            <View style={styles.optionHeader}>
              <View style={styles.optionIconContainer}>
                <Image
                  source={require('@/assets/profile/create_add_icon.png')}
                  style={styles.optionIcon}
                />
              </View>
              <Image
                source={require('@/assets/main/right_arrow_icon.png')}
                style={styles.optionIcon}
              />
            </View>
            <Text style={styles.optionText}>Add File</Text>
          </TouchableOpacity>

          {/* 直接录音卡片 */}
          <TouchableOpacity style={styles.createOptionCard} onPress={() => navigation.navigate('CreateVoice' as any)}>
            <View style={styles.optionHeader}>
              <View style={styles.optionIconContainer}>
                <Image
                  source={require('@/assets/profile/create_voice_icon.png')}
                  style={styles.optionIcon}
                />
              </View>
              <Image
                source={require('@/assets/main/right_arrow_icon.png')}
                style={styles.optionIcon}
              />
            </View>
            <Text style={styles.optionText}>Direct Recording</Text>
          </TouchableOpacity>
        </View>

        {/* 素材列表 */}
        <View style={styles.materialsContainer}>
          <ScrollView style={styles.materialsList} showsVerticalScrollIndicator={false}>
            {materials.map((material, _index) => (
              <View key={_index} style={styles.materialItem}>
                <View style={styles.materialContent}>
                  <View style={styles.materialInfo}>
                    <Image
                      source={require('@/assets/profile/profile_voice_icon.png')}
                      style={styles.materialIcon}
                    />
                    <Text style={styles.materialName} numberOfLines={1} ellipsizeMode="tail">{material.name}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteMaterial(material.name)}
                  >
                    <Image
                      source={require('@/assets/music/music_delete_icon.png')}
                      style={styles.deleteIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 底部按钮 */}
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity style={styles.storeButton} onPress={() => setShowAddModal(true)}>
            <Text style={styles.storeButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton} onPress={() => setPurchaseModalVisible(true)}>
            <Text style={styles.sendButtonText}>Upload training</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* 重命名 */}
      <CommonModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        config={{
          title: 'Rename',
          customContent: <View style={styles.renameInputContainer}>
            <TextInput
              value={materialsName}
              style={styles.renameInput}
              placeholder="1.My voiceprint"
              placeholderTextColor={theme.textTertiary}
              onChangeText={setMaterialsName}
            />
          </View> as React.ReactNode,
          buttons: [
            {
              text: 'Cancel',
              onPress: () => { setShowAddModal(false) },
              type: 'border' as const,
            },
            {
              text: 'Next',
              onPress: () => { handleStoreMaterials() },
              type: 'primary' as const,
            },
          ],
        }}
      />
      {/* 积分不足 */}
      <PointsLimitModal
        visible={showPointsListModal}
        onClose={() => setShowPointsListModal(false)}
        onConfirm={() => { }}
        onCancel={() => { }}
        pointsBalance={300}
      />
      {/* 消费弹窗 */}
      <CommonModal
        visible={purchaseModalVisible}
        onClose={() => setPurchaseModalVisible(false)}
        config={{
          title: '',
          buttons: [
            {
              text: 'Cancel',
              onPress: () => { setPurchaseModalVisible(false) },
              type: 'border' as const,
            },
            {
              text: 'Next',
              onPress: handleSendTraining,
              type: 'primary' as const,
            },
          ],
          customContent: <View style={styles.purchaseContainer}>
            {/* 内容 */}
            <View style={styles.contentContainer}>
              <Text style={[styles.contentText]}>
                We are about to generate voiceprints for you spending <Text style={{ color: theme.primary }}>2000</Text> points.
              </Text>
            </View>

            {/* 积分余额 */}
            <View style={styles.balanceContainer}>
              <Text style={[styles.balanceLabel]}>
                Points balance:
              </Text>
              <Text style={[styles.balanceValue, { color: theme.primary }]}>
                &nbsp;{300}
              </Text>
            </View>
          </View> as React.ReactNode,
        }}
      />
      {/* 未保存弹窗 */}
      <CommonModal
        visible={notSaveModalVisible}
        onClose={() => setNotSaveModalVisible(false)}
        config={{
          title: '',
          content: 'The current voiceprint material has not been saved yet',
          buttons: [
            {
              text: 'Exit directly',
              onPress: () => { handleBack() },
              type: 'border' as const,
            },
            {
              text: 'Save and Exit',
              onPress: () => { handleStoreMaterials() },
              type: 'primary' as const,
            },
          ],
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: normalize(24),
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(14),
    marginTop: normalize(12),
  },
  timeText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  signalIcon: {
    width: normalize(17),
    height: normalize(11),
    backgroundColor: '#FFFFFF',
  },
  wifiIcon: {
    width: normalize(16),
    height: normalize(11),
    backgroundColor: '#FFFFFF',
  },
  batteryIcon: {
    width: normalize(25),
    height: normalize(12),
  },
  navBar: {
    marginTop: normalize(24),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: normalize(40),
    marginTop: normalize(8),
  },
  titleText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    width: normalize(40),
    height: normalize(40),
    backgroundColor: theme.backgroundTertiary,
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: normalize(16),
    height: normalize(16),
  },
  createOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: normalize(12),
    marginTop: normalize(20),
    marginBottom: normalize(17),
  },
  createOptionCard: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: normalize(12),
    width: "48%",
    height: normalize(96),
    padding: normalize(12),
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  optionIconContainer: {
    backgroundColor: theme.backgroundTertiary,
    borderRadius: normalize(12),
    width: normalize(40),
    height: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIcon: {
    width: normalize(20),
    height: normalize(25),
  },
  optionDivider: {
    width: normalize(6),
    height: normalize(10),
  },
  optionText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: normalize(20),
  },
  materialsContainer: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: normalize(12),
    width: "100%",
    height: normalize(360),
    marginTop: normalize(-1),
  },
  materialsList: {
    flex: 1,
  },
  materialItem: {
    width: "100%",
    height: normalize(72),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.4)',
  },
  materialContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(18),
    paddingVertical: normalize(28),
  },
  materialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  materialIcon: {
    width: normalize(18),
    height: normalize(15),
    marginRight: normalize(8),
  },
  materialName: {
    width: normalize(160),
    fontSize: normalizeFontSize(14),
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: normalize(16),
  },
  deleteButton: {
    width: normalize(20),
    height: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    width: normalize(20),
    height: normalize(20),
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(16),
  },
  storeButton: {
    borderWidth: 1,
    borderColor: theme.primary,
    borderRadius: normalize(12),
    height: normalize(48),
    width: "48%",
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: normalize(21),
  },
  sendButton: {
    backgroundColor: theme.primary,
    borderRadius: normalize(12),
    height: normalize(48),
    width: "48%",
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: 'rgba(12, 12, 13, 0.7)',
    letterSpacing: -0.4,
    lineHeight: normalize(21),
  },
  renameInputContainer: {
    width: '100%',
    height: normalize(38),
    justifyContent: 'center',
    alignItems: 'center',
  },
  renameInput: {
    width: normalize(259),
    height: normalize(38),
    backgroundColor: theme.background,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
    fontSize: normalizeFontSize(14),
    fontWeight: '500',
    color: theme.textPrimary,
    letterSpacing: -0.4,
    lineHeight: normalize(16),
  },
  purchaseContainer: {
    width: '100%',
  },
  contentContainer: {
    marginBottom: normalize(18),
    alignItems: 'center',
    paddingHorizontal: normalize(24),
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: theme.textPrimary,
  },
});

export default VoiceprintMaterialCreateScreen;
