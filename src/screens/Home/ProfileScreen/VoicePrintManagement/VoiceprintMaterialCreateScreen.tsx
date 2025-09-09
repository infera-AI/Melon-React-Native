import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { saveMaterials, trainVoiceprint, saveVoiceprint } from '@/api/profile/profile';
import { FilePathConverter } from '@/utils/filePathConverter';
import { uploadFiles } from '@/api/file/file';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { usePointsStore } from '@/store/modules/points.store';
import PointsConfirmModal from '@/components/PointsConfirmModal';

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
  const { materials, setMaterials, materialsId, setMaterialsId, materialsName, setMaterialsName } = useVoiceStore();
  const { refreshPointsBalance } = usePointsStore.getState();
  const { t } = useLanguage();
  const { show } = useMessageModal();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPointsListModal, setShowPointsListModal] = useState(false);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [notSaveModalVisible, setNotSaveModalVisible] = useState(false);
  const [materialsNameInput, setMaterialsNameInput] = useState(materialsName);
  const [type, setType] = useState<'save' | 'send'>('save');
  const { pointsBalance } = usePointsStore.getState();
  // 音频播放
  const [isLoading, setIsLoading] = useState(false);
  const {
    isPlayIndex,
    togglePlayPause,
    cleanup,
    isPlayingUrl,
  } = useAudioPlayer();

  // const cleanupAudioData = React.useCallback(() => {
  //   try {
  //     // 停止音频播放
  //     if (sound) {
  //       sound.stop();
  //       sound.release();
  //       setSound(null);
  //     }

  //     // 重置播放状态
  //     setIsPlaying(false);
  //     setIsPlayMusic('');

  //     // 重置所有作品的播放状态
  //     setIsPlayIndex('');

  //     console.log('音频数据清理完成');
  //   } catch (error) {
  //     console.error('清理音频数据失败:', error);
  //   }
  // }, [sound]);


  const clearAction = () => {
    setMaterials([]);
    setMaterialsId("");
    setMaterialsName("");
    cleanup();
  };

  const handleBack = () => {
    clearAction();
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

  // 保存声纹素材
  const handleSaveMaterialsRequest = async () => {
    setIsLoading(true);
    try {
      const resFile = await handleUploadFile(materials);
      if (!resFile.url_list) {
        console.log(resFile, 'resFile')
        throw new Error('upload files failed');
      }
      const file_list = resFile.url_list
      const res = await saveMaterials({
        name: materialsNameInput,
        file_list,
        name_list: materials.map(material => material.name),
      });
      show({ message: t('music.save_material_successfully') });
      return res;
    } catch (error: any) {
      console.log(error, 'error');
      throw new Error(error.message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }


  }

  const handleStoreMaterials = async () => {
    setShowAddModal(false);
    try {
      await handleSaveMaterialsRequest();
      clearAction();
      navigation.navigate('AudioMaterialLibrary' as any);
    } catch (error) {
      console.log(error, 'error');
    }
  };

  // 播放素材
  const handlePlayMaterial = (material: any) => {
    console.log('Play material:', material);
    handlePlayPause(material);
  };

  // 暂停/恢复
  const handlePlayPause = (music: any) => {
    togglePlayPause(music);
  };

  // 上传文件
  const handleUploadFile = async (files: any[]) => {

    // 分离出服务器文件和本地文件
    const serverFiles = files.filter(file => !file.type).map(file => file.uri);
    const localFiles = files.filter(file => file.type !== undefined);
    if (localFiles.length <= 0) {
      return { url_list: serverFiles };
    }
    try {
      // 转换文档
      const convertedFiles = await FilePathConverter.convertFilePaths(localFiles);
      const res = await uploadFiles({
        files: convertedFiles,
      });
      console.log(res, 'res');
      return { url_list: [...serverFiles, ...res.url_list] };
    } catch (error) {
      console.error('Upload files failed:', error);
      show({ message: "upload files failed" });
      // 抛出错误让上层捕捉
      throw new Error('upload files failed');
    }
  };

  const handleSendTraining = async () => {
    setIsLoading(true);
    console.log('Send training');
    let id = materialsId;
    let name = materialsNameInput;

    try {
      // 判断是否为声纹素材跳转
      if (!id) {
        const resMaterials = await handleSaveMaterialsRequest();
        id = resMaterials?.id;
      }
      const resSave = await saveVoiceprint({
        material_id: Number(id),
        name: name,
      });

      if (resSave?.id) {
        const res = await trainVoiceprint({
          voice_print_id: resSave?.id,
        });
        show({ message: t('music.train_voiceprint_successfully') });
        console.log(res, 'res');
        clearAction();
        navigation.replace('VoiceprintTrainingSuccess' as any);
      }
    } catch (error) {
      console.log(error, 'error');
    } finally {
      setIsLoading(false);
      refreshPointsBalance();
    }
  };

  const handleDeleteMaterial = (name: string) => {
    console.log('Delete material:', name);
    setMaterials(materials.filter(material => material.name !== name));
  };

  const handleBackIconPress = () => {
    if (materials.length > 0) {
      setNotSaveModalVisible(true)
    } else {
      handleBack()
    }
  };

  const handleSaveMaterialsAction = () => {
    setShowAddModal(true);
    setType('save');
  }

  const handleSendTrainingAction = () => {
    setShowAddModal(true);
    setType('send');
    // if (!materialsId) {
    //   setShowAddModal(true);
    //   setType('send');
    // } else {
    //   if (pointsBalance >= 200) {
    //     setPurchaseModalVisible(true);
    //   } else {
    //     setShowPointsListModal(true);
    //   }
    // }
  }

  useEffect(() => {
    return () => {
      cleanup();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView>
        {/* 页面标题和返回按钮 */}
        <View style={styles.navBar}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{t('music.voiceprint_management')}</Text>
            <TouchableOpacity style={styles.backButton} onPress={handleBackIconPress}>
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
            <Text style={styles.optionText}>{t('music.add_file')}</Text>
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
            <Text style={styles.optionText}>{t('music.direct_recording')}</Text>
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
                  <View style={styles.musicContainer}>
                    <TouchableOpacity
                      onPress={() => handlePlayMaterial(material)}
                    >
                      <Image
                        source={isPlayingUrl(material.uri) ? require('@/assets/music/music_pause_icon.png') : require('@/assets/music/music_play_icon.png')}
                        style={styles.deleteIcon}
                      />
                    </TouchableOpacity>
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
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 底部按钮 */}
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity style={styles.storeButton} onPress={handleSaveMaterialsAction}>
            <Text style={styles.storeButtonText}>{t('music.save')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton} onPress={handleSendTrainingAction}>
            <Text style={styles.sendButtonText}>{t('music.upload_training')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* 重命名 */}
      <CommonModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        config={{
          title: t('music.rename'),
          customContent: <View style={styles.renameInputContainer}>
            <TextInput
              value={materialsNameInput}
              style={styles.renameInput}
              placeholder={t('music.my_voiceprint_placeholder')}
              placeholderTextColor={theme.textTertiary}
              onChangeText={setMaterialsNameInput}
            />
          </View> as React.ReactNode,
          buttons: [
            {
              text: t('music.cancel'),
              onPress: () => { setShowAddModal(false) },
              type: 'border' as const,
            },
            {
              text: t('music.next'),
              onPress: () => {
                if (type === 'save') {
                  handleStoreMaterials()
                } else {
                  if (pointsBalance >= 200) {
                    setPurchaseModalVisible(true);
                  } else {
                    setShowPointsListModal(true);
                  }
                }
              },
              type: 'primary' as const,
            },
          ],
        }}
      />
      <PointsConfirmModal
        visible={purchaseModalVisible}
        onClose={() => setPurchaseModalVisible(false)}
        onConfirm={handleSendTraining}
        onCancel={() => setPurchaseModalVisible(false)}
        title={<Text>{t('music.we_are_about_to_generate_voiceprints').replace('{points}', '200')}</Text>}
        onDontShowAgain={() => { }}
      />
      {/* 积分不足 */}
      <PointsLimitModal
        visible={showPointsListModal}
        onClose={() => setShowPointsListModal(false)}
        onConfirm={() => {
          (navigation as any).navigate('Profile', {
            screen: 'Purchase'
          });
        }}
        onCancel={() => {
          setShowPointsListModal(false);
        }}
      />
      {/* 未保存弹窗 */}
      <CommonModal
        visible={notSaveModalVisible}
        onClose={() => setNotSaveModalVisible(false)}
        config={{
          title: '',
          content: t('music.current_voiceprint_material_not_saved'),
          buttons: [
            {
              text: t('music.exit_directly'),
              onPress: () => { handleBack() },
              type: 'border' as const,
            },
            {
              text: t('music.save_and_exit'),
              onPress: () => { handleStoreMaterials() },
              type: 'primary' as const,
            },
          ],
        }}
      />
      <FullScreenLoader
        visible={isLoading}
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
  musicContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: normalize(16),
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
    paddingLeft: normalize(8),
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
