import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../ProfileNavigator';
import theme from '@/utils/theme';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCommonVoiceprints, getPersonalVoiceprints, renameVoiceprint, deleteVoiceprint } from '@/api/profile/profile';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import CommonModal from '@/components/CommonModal';
import { useMessageModal } from '@/contexts/MessageModalContext';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useLanguage } from '@/contexts/LanguageContext';

type VoiceprintManagementListScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'VoiceprintManagementList'>;

const VoiceprintManagementListScreen: React.FC = () => {
  const navigation = useNavigation<VoiceprintManagementListScreenNavigationProp>();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'voiceprint' | 'dataset'>('voiceprint');
  const [commonVoiceprints, setCommonVoiceprints] = useState<any[]>([]);
  const [personalVoiceprints, setPersonalVoiceprints] = useState<any[]>([]);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameNameInput, setRenameNameInput] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { show } = useMessageModal();
  const {
    isPlayIndex,
    togglePlayPause,
    cleanup,
    isPlayingUrl,
  } = useAudioPlayer();

  const handleBack = () => {
    navigation.replace('ProfileMain' as any);
  };

  const handleCreate = () => {
    console.log('Create voiceprint');
    navigation.navigate('VoiceprintMaterialCreate' as any);
  };

  const handleRename = async () => {
    if (!selectedId) return;
    setIsLoading(true);
    const res = await renameVoiceprint({
      id: selectedId,
      name: renameNameInput,
    });
    personalVoiceprints.forEach(voiceprint => {
      if (voiceprint.id === selectedId) {
        voiceprint.name = renameNameInput;
      }
    });
    setPersonalVoiceprints([...personalVoiceprints]);
    console.log(res, 'res');
    setShowRenameModal(false);
    setRenameNameInput('');
    setSelectedId(null);
    setIsLoading(false);
  };

  const voiceprints = [
    { id: 1, name: 'My voiceprint', type: 'voiceprint' },
    { id: 2, name: 'My voiceprint', type: 'voiceprint' },
    { id: 3, name: 'My voiceprint', type: 'voiceprint' },
    { id: 4, name: 'Calm voice', type: 'voiceprint' },
    { id: 5, name: 'Calm voice', type: 'voiceprint' },
  ];

  const handleTabPress = (tab: 'voiceprint' | 'dataset') => {
    setActiveTab(tab);
  };

  const handleEdit = (id: number) => {
    setSelectedId(id);
    console.log('Edit voiceprint:', id);
    setShowRenameModal(true);
  };

  const handleDelete = async (id: number) => {
    setIsLoading(true);
    console.log('Delete voiceprint:', id);
    const res = await deleteVoiceprint({
      id_list: [id],
    });
    show({ message: t('music.delete_voiceprint_successfully') });
    console.log(res, 'res');
    getPersonalMaterialsRequest();
    setIsLoading(false);
  };

  const getCommonMaterialsRequest = async () => {
    setIsLoading(true);
    const res = await getCommonVoiceprints();
    console.log(res, 'res');
    setCommonVoiceprints(res.data_list || []);
    setIsLoading(false);
  };

  const getPersonalMaterialsRequest = async () => {
    setIsLoading(true);
    const res = await getPersonalVoiceprints();
    console.log(res, 'res');
    setPersonalVoiceprints(res.data_list || []);
    setIsLoading(false);
  };

  // 播放素材
  const handlePlayMaterial = (material: any) => {
    console.log('Play material:', material);
    const materialCopy = { ...material, uri: material.merge_file };
    handlePlayPause(materialCopy);
  };

  // 暂停/恢复
  const handlePlayPause = (music: any) => {
    togglePlayPause(music);
  };


  useEffect(() => {
    getCommonMaterialsRequest();
    getPersonalMaterialsRequest();
    return () => {
      cleanup();
    }
  }, []);

  // 渲染Tab栏
  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[
          styles.tabItem,
          activeTab === 'dataset' && styles.activeTabItem
        ]}
        onPress={() => handleTabPress('dataset')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'dataset' && styles.activeTabText
        ]}>
          {t('music.public_singer')}
        </Text>
        {activeTab === 'dataset' && <View style={styles.tabIndicator} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabItem,
          activeTab === 'voiceprint' && styles.activeTabItem
        ]}
        onPress={() => handleTabPress('voiceprint')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'voiceprint' && styles.activeTabText
        ]}>
          {t('music.my_voiceprint')}
        </Text>
        {/* 红色小圆点 */}
        {personalVoiceprints.find(voiceprint => voiceprint.status === 1) && <View style={styles.redDot} />}
        {activeTab === 'voiceprint' && <View style={styles.tabIndicator} />}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 页面标题和返回按钮 */}
        <View style={styles.navBar}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{t('music.voiceprint_management')}</Text>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Image
                source={require('@/assets/main/page_return_icon.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 素材库UI */}
        <View style={styles.materialLibraryContainer}>
          <TouchableOpacity
            style={styles.materialLibrarySection}
            onPress={() => navigation.navigate('AudioMaterialLibrary' as any)}
          >
            <View style={styles.materialLibraryContent}>
              <Image
                source={require('@/assets/profile/voiceprint_library_icon.png')}
                style={styles.materialLibraryIcon}
              />
              <Text style={styles.materialLibraryText}>{t('music.audio_materials')}</Text>
            </View>
            <Image
              source={require('@/assets/main/right_arrow_icon.png')}
              style={styles.materialLibraryThumbnail}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('VoiceprintManagementInitial' as any)}>
            <Image
              source={require('@/assets/profile/profile_help_icon.png')}
              style={styles.materialLibraryActionIcon}
            />
          </TouchableOpacity>
        </View>

        {/* 标签栏 */}
        {renderTabBar()}

        {/* 声纹列表 */}
        <View style={styles.listContainer}>
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {(activeTab === 'dataset' ? commonVoiceprints : personalVoiceprints)?.map((voiceprint, _index) => (
              <View key={voiceprint.id} style={[styles.voiceprintItem, { opacity: voiceprint.status !== 2 ? 0.4 : 1 }]}>
                <View style={styles.voiceprintContent}>
                  <View style={styles.voiceprintInfo}>
                    <Image
                      source={require('@/assets/profile/profile_voice_icon.png')}
                      style={styles.voiceprintIcon}
                    />
                    <Text style={styles.voiceprintName} numberOfLines={1} ellipsizeMode="tail">{voiceprint.name}</Text>
                  </View>
                  <View style={styles.actionButtons}>
                    {activeTab === 'dataset' && voiceprint.status === 2 && <TouchableOpacity
                      style={styles.languageButton}
                      onPress={() => handlePlayMaterial({})}
                    >
                      <Text style={styles.languageButtonText}>{voiceprint.language}</Text>
                    </TouchableOpacity>}
                    {voiceprint.status === 2 && <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handlePlayMaterial(voiceprint)}
                    >
                      <Image
                        source={isPlayingUrl(voiceprint.merge_file) ? require('@/assets/music/music_pause_icon.png') : require('@/assets/music/music_play_icon.png')}
                        style={styles.actionIcon}
                      />
                    </TouchableOpacity>}
                    {activeTab === 'voiceprint' && voiceprint.status === 2 && <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEdit(voiceprint.id)}
                    >
                      <Image
                        source={require('@/assets/music/music_edit_icon.png')}
                        style={styles.actionIcon}
                      />
                    </TouchableOpacity>}
                    {activeTab === 'voiceprint' && voiceprint.status === 2 && <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDelete(voiceprint.id)}
                    >
                      <Image
                        source={require('@/assets/music/music_delete_icon.png')}
                        style={styles.actionIcon}
                      />
                    </TouchableOpacity>}
                    {voiceprint.status !== 2 && <Text style={styles.trainingText}>{t('music.training')}</Text>}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 创建按钮 */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>{t('music.create')}</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* 重命名 */}
      <CommonModal
        visible={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        config={{
          title: t('music.rename'),
          customContent: <View style={styles.renameInputContainer}>
            <TextInput
              value={renameNameInput}
              style={styles.renameInput}
              placeholder={t('music.my_voiceprint_placeholder')}
              placeholderTextColor={theme.textTertiary}
              onChangeText={setRenameNameInput}
            />
          </View> as React.ReactNode,
          buttons: [
            {
              text: t('music.cancel'),
              onPress: () => { setShowRenameModal(false) },
              type: 'border' as const,
            },
            {
              text: t('music.next'),
              onPress: () => {
                handleRename()
              },
              type: 'primary' as const,
            },
          ],
        }}
      />
      <FullScreenLoader visible={isLoading} />
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
    marginTop: normalize(17),
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
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: normalize(16),
    height: normalize(16),
  },
  // Tab栏样式
  tabBar: {
    flexDirection: 'row',
    marginTop: normalize(8),
    marginBottom: normalize(24),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: normalize(10),
    position: 'relative',
  },
  activeTabItem: {
    // 激活状态的Tab样式
  },
  tabText: {
    fontSize: normalizeFontSize(16),
    color: theme.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  redDot: {
    position: 'absolute',
    top: normalize(10),
    right: normalize(25),
    width: normalize(8),
    height: normalize(8),
    backgroundColor: '#FF5861',
    borderRadius: normalize(4),
  },
  activeTabText: {
    fontWeight: '600',
    color: theme.primary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -15,
    left: '50%',
    marginLeft: normalize(-10),
    width: normalize(20),
    height: normalize(3),
    backgroundColor: theme.primary,
    borderRadius: normalize(1.5),
  },
  listContainer: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: normalize(12),
    width: "100%",
    minHeight: normalize(360),
    marginTop: normalize(-1),
  },
  list: {
    flex: 1,
  },
  voiceprintItem: {
    width: "100%",
    height: normalize(72),
    borderBottomWidth: 1,
  },
  voiceprintContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(18),
    justifyContent: 'space-between',
    paddingVertical: normalize(28),
  },
  voiceprintInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceprintIcon: {
    width: normalize(18),
    height: normalize(15),
    marginRight: normalize(8),
  },
  voiceprintName: {
    width: normalize(100),
    fontSize: normalizeFontSize(14),
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: normalize(16),
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(16),
  },
  languageButton: {
    width: normalize(60),
    height: normalize(24),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: '#454545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageButtonText: {
    fontSize: normalizeFontSize(12),
    fontWeight: '400',
    color: theme.primary,
    letterSpacing: -0.4,
  },
  trainingText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '500',
    color: theme.textPrimary,
    letterSpacing: -0.4,
    height: normalize(20),
  },
  actionButton: {
    width: normalize(20),
    height: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    width: normalize(20),
    height: normalize(20),
  },
  createButton: {
    backgroundColor: theme.primary,
    borderRadius: normalize(12),
    height: normalize(48),
    width: "100%",
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(24),
    marginBottom: normalize(40),
  },
  createButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: 'rgba(12, 12, 13, 0.7)',
    letterSpacing: -0.4,
    lineHeight: normalize(21),
  },
  // 素材库样式
  materialLibraryContainer: {
    width: "100%",
    height: normalize(48),
    marginTop: normalize(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  materialLibrarySection: {
    backgroundColor: theme.primary,
    borderRadius: normalize(12),
    width: "88%",
    height: normalize(48),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  materialLibraryContent: {
    height: normalize(40),
    marginTop: normalize(4),
    marginLeft: normalize(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  materialLibraryIcon: {
    width: normalize(40),
    height: normalize(40),
  },
  materialLibraryText: {
    width: normalize(109),
    height: normalize(18),
    color: 'rgba(12, 12, 13, 0.7)',
    fontSize: normalizeFontSize(15),
    letterSpacing: -0.4,
    fontFamily: 'SF Pro-Semibold',
    fontWeight: '600',
    textAlign: 'left',
    lineHeight: normalize(15),
    marginTop: normalize(12),
  },
  materialLibraryThumbnail: {
    width: normalize(20),
    height: normalize(20),
    marginTop: normalize(14),
    marginRight: normalize(12),
  },
  materialLibraryActionIcon: {
    width: normalize(24),
    height: normalize(24),
    marginTop: normalize(12),
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
});

export default VoiceprintManagementListScreen;
