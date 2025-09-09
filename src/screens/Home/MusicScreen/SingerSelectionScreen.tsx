// src/screens/SingerSelectionScreen/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import theme from '@/utils/theme';
import PointsLimitModal from '@/components/PointsLimitModal';
import PointsConfirmModal from '@/components/PointsConfirmModal';
import { polishLyrics, recommendGenres, generateMusic, coverMusic } from '@/api/music/music';
import { getPersonalVoiceprints, getCommonVoiceprints } from '@/api/profile/profile';
import { useMusicStore } from '@/store/modules/music.store';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useMessageModal } from '@/contexts/MessageModalContext';
import CommonModal from '@/components/CommonModal';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { FilePathConverter } from '@/utils/filePathConverter';
import { uploadFiles } from '@/api/file/file';
import { usePointsStore } from '@/store/modules/points.store';


// 歌手数据接口
interface Singer {
  id: string | number;
  name: string;
  language: string;
  avatar: any;
  isSelected?: boolean;
}

// Tab类型
type TabType = 'public' | 'voiceprint';

// 模拟歌手数据
// const singers: Singer[] = [
//   {
//     id: 1,
//     name: 'Gladys',
//     language: 'Hindi',
//     avatar: require('@/assets/profile/profile_voice_icon.png'),
//   },
//   {
//     id: '2',
//     name: 'Beyoncé Giselle Knowles',
//     language: 'English',
//     avatar: require('@/assets/profile/profile_voice_icon.png'),
//   },
//   {
//     id: '3',
//     name: 'Gladys',
//     language: 'Hindi',
//     avatar: require('@/assets/profile/profile_voice_icon.png'),
//   },
//   {
//     id: '4',
//     name: 'Gladys',
//     language: 'Hindi',
//     avatar: require('@/assets/profile/profile_voice_icon.png'),
//   },
//   {
//     id: '5',
//     name: 'Gladys',
//     language: 'Hindi',
//     avatar: require('@/assets/profile/profile_voice_icon.png'),
//   },
//   {
//     id: '6',
//     name: 'Gladys',
//     language: 'Hindi',
//     avatar: require('@/assets/profile/profile_voice_icon.png'),
//   },
//   {
//     id: '7',
//     name: 'Gladys',
//     language: 'Hindi',
//     avatar: require('@/assets/profile/profile_voice_icon.png'),
//   },
//   {
//     id: '8',
//     name: 'Gladys',
//     language: 'Hindi',
//     avatar: require('@/assets/profile/profile_voice_icon.png'),
//   },
// ];

const SingerSelectionScreen: React.FC<any> = ({ route }: any) => {
  const { type } = route.params || {};
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { show } = useMessageModal()
  const { apply, applyItem, text, textSecondary } = useGlobalTheme();
  const [selectedSinger, setSelectedSinger] = useState<Singer | null>(null);
  const [singersList, setSingersList] = useState<Singer[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('voiceprint');
  const [modalVisible, setModalVisible] = useState(false);
  const [pointsLimitModalVisible, setPointsLimitModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [commonVoiceprints, setCommonVoiceprints] = useState<any[]>([]);
  const [personalVoiceprints, setPersonalVoiceprints] = useState<any[]>([]);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { setGenerateMusicType, musicGenerateInfo, coverMusicFile, setIsSelectedVoice } = useMusicStore.getState();
  const isSelectedVoice = useMusicStore.getState().isSelectedVoice;
  const { refreshPointsBalance, pointsBalance } = usePointsStore.getState();
  const {
    isPlayIndex,
    togglePlayPause,
    cleanup,
    isPlayingUrl,
  } = useAudioPlayer();
  // 处理Tab切换
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // 切换Tab时清空选择
    setSelectedSinger(null);
    setSingersList(prev =>
      prev.map(singer => ({
        ...singer,
        isSelected: false
      }))
    );
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

  // 处理歌手选择
  const handleSingerSelect = (singer: Singer) => {
    console.log(singer, 'singer')
    setIsSelectedVoice(true);
    setSelectedSinger(singer);
    setSelectedId(singer.id);
  };

  // 处理跳过选择
  const handleSkipSelection = () => {
    // 跳过选择逻辑
    setIsSelectedVoice(false);
    if (checkPointsBalance(false)) {
      setModalVisible(true);
    } else {
      setPointsLimitModalVisible(true);
    }
  };

  // 处理上一步
  const handlePreviousStep = () => {
    navigation.goBack();
  };

  // 处理下一步
  const handleNextStep = () => {

    // if (checkPointsBalance(isSelectedVoice)) {
    setModalVisible(true);
    // } else {
    //   setPointsLimitModalVisible(true);
    // }
    // if (selectedSinger) {
    //   console.log('选择的歌手:', selectedSinger);
    //   console.log('当前Tab:', activeTab);
    //   // navigation.navigate('NextScreen', { selectedSinger, tab: activeTab });
    // } else {
    //   // 提示用户选择歌手
    //   console.log('请选择歌手');
    // }
  };

  // 获取公用声纹
  const getPublicVoiceprintsRequest = async () => {
    const res = await getCommonVoiceprints();
    setCommonVoiceprints(res.data_list || []);
    console.log('res', res);
  }
  // 获取个人声纹
  const getPersonalVoiceprintsRequest = async () => {
    const res = await getPersonalVoiceprints();
    setPersonalVoiceprints(res.data_list || []);
    console.log('res', res);
  }

  useEffect(() => {
    getPublicVoiceprintsRequest();
    getPersonalVoiceprintsRequest();
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
          activeTab === 'public' && styles.activeTabItem
        ]}
        onPress={() => handleTabChange('public')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'public' && styles.activeTabText
        ]}>
          {t('music.public_singer')}
        </Text>
        {activeTab === 'public' && <View style={styles.tabIndicator} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabItem,
          activeTab === 'voiceprint' && styles.activeTabItem
        ]}
        onPress={() => handleTabChange('voiceprint')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'voiceprint' && styles.activeTabText
        ]}>
          {t('music.my_voiceprint')}
        </Text>
        {activeTab === 'voiceprint' && <View style={styles.tabIndicator} />}
      </TouchableOpacity>
    </View>
  );

  // 判断积分余额是否足够
  const checkPointsBalance = (selectedVoice: boolean) => {
    if (selectedVoice) {
      return pointsBalance >= 110;
    } else {
      return pointsBalance >= 50;
    }
  }

  // 渲染内容区域
  const renderContent = () => {
    return <>
      {activeTab === 'voiceprint' && <View
        style={[
          styles.addButtonContainer,
        ]}
      >
        {/* 增加按钮 */}
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.7}
          onPress={() => {
            // 处理添加录音逻辑
            setRecordModalVisible(true)
            console.log('Go record pressed');
          }}
        >
          <View style={styles.addButtonContent}>
            <Image source={require('@/assets/music/music_add_icon.png')} style={styles.plusIcon} />
            <Text style={styles.addButtonText}>{t('music.go_record')}</Text>
          </View>
        </TouchableOpacity>
      </View>}
      {/* 歌手列表 */}
      <ScrollView style={[styles.singerList, activeTab === 'public' && styles.commonList]} showsVerticalScrollIndicator={false}>
        {activeTab === 'public' && commonVoiceprints.length < 1 && <View style={styles.CommonvoiceprintContent}>
          <Text style={[styles.voiceprintSubtext, textSecondary]}>
            {t('music.no_content')}
          </Text>
        </View>}
        {activeTab === 'voiceprint' && personalVoiceprints.length < 1 && <View style={styles.voiceprintContent}>
          <Text style={[styles.voiceprintSubtext, textSecondary]}>
            {t('music.no_content')}
          </Text>
        </View>}
        {(activeTab === 'public' ? commonVoiceprints : personalVoiceprints)?.map((singer, index) => (
          <TouchableOpacity
            key={singer.id}
            disabled={singer.status !== 2}
            style={[
              styles.singerItem,
              index === singersList.length - 1 && styles.lastSingerItem,
              selectedId === singer.id && styles.selectedSingerItem,
              { opacity: singer.status === 2 ? 1 : 0.4 }
            ]}
            onPress={() => handleSingerSelect(singer)}
          >
            <View style={styles.singerInfo}>
              <Image
                source={require('@/assets/profile/profile_voice_icon.png')}
                style={styles.singerAvatar}
              />
              <Text style={[styles.singerName, text]}>
                {singer.name}
              </Text>
            </View>
            {activeTab === 'public' && singer.status === 2 && <TouchableOpacity
              style={styles.languageButton}
              onPress={() => { }}
            >
              <Text style={styles.languageButtonText}>{singer.language}</Text>
            </TouchableOpacity>}
            {singer.status === 2 && <TouchableOpacity
              onPress={() => handlePlayMaterial(singer)}
            >
              <Image source={isPlayingUrl(singer.merge_file) ? require('@/assets/music/music_pause_icon.png') : require('@/assets/music/music_play_icon.png')} style={styles.playIcon} />
            </TouchableOpacity>}
            {singer.status !== 2 && <Text style={styles.trainingText}>{t('music.training')}</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  };

  // 跳转到音乐生成页面 skip跳过声纹
  const handleToMusicGenerate = (skip: boolean = false) => {
    setIsLoading(true);
    generateMusic({
      work_title: musicGenerateInfo.title,
      lyrics: musicGenerateInfo.lyrics,
      genres: musicGenerateInfo.musicStyles,
      voice_print_id: skip ? 0 : Number(selectedSinger?.id) || 0,
    }).then((rsp) => {
      setIsLoading(false);
      if (!rsp.task_id) {
        show({
          message: t('translate_screen.failed_again')
        })
        return
      }
      refreshPointsBalance();
      setGenerateMusicType('generate');
      (navigation as any).navigate('GeneratingMusic', {
        taskId: rsp.task_id,
        createTaskTime: Math.floor(performance.now())
      });
    }).catch(() => {
      setIsLoading(false);
      show({
        message: t('http_service_error')
      })
    });
  }

  // 上传文件
  const handleUploadFile = async (file: any) => {
    try {
      // 转换文档
      const convertedFileuri = await FilePathConverter.convertContentUriToFilePath(file.uri);
      const res = await uploadFiles({
        files: [{ name: file.name, type: file.type, uri: convertedFileuri }],
      });
      console.log(res, 'res');
      return res;
    } catch (error) {
      show({ message: t('music.upload_files_failed') });
      return {};
    }
  };

  // 翻唱歌曲
  const handleCoverSingToMusic = async () => {
    setIsLoading(true);
    coverMusic({
      voice_print_id: String(selectedSinger?.id) || '0',
      music_file: coverMusicFile,
    }).then((rsp) => {
      if (!rsp.task_id) {
        show({
          message: t('translate_screen.failed_again')
        })
        return
      }
      setGenerateMusicType('cover');
      refreshPointsBalance();
      (navigation as any).navigate('GeneratingMusic', {
        taskId: rsp.task_id,
        createTaskTime: Math.floor(performance.now())
      });
    }).catch(() => {
      setIsLoading(false);
      show({
        message: t('http_service_error')
      })
    }).finally(() => {
      setIsLoading(false);
    });
  }
  const handlePointsTopup = () => {
    // navigation.navigate('PointsTopup');
  }

  const handleWatchAds = () => {
    // navigation.navigate('AI');
  }

  const handleGenerateMusicAction = () => {
    if (type === 'generate') {
      handleToMusicGenerate(!isSelectedVoice);
    } else if (type === 'cover') {
      handleCoverSingToMusic();
    }
  }

  return (
    <SafeAreaView style={apply(styles.container)}>

      {/* Tab栏 */}
      {renderTabBar()}

      {/* 内容区域 */}
      {renderContent()}

      {/* 跳过选择 */}
      {type === 'generate' && <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkipSelection}>
          <Text style={[styles.skipText]}>
            {t('music.skip_selection')}
          </Text>
        </TouchableOpacity>
      </View>}

      {/* 底部按钮 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.previousButton]}
          onPress={handlePreviousStep}
        >
          <Text style={[styles.buttonText, text]}>{type === 'cover' ? t('music.cancel') : t('music.previous_step')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.nextButton,
            !selectedSinger && styles.disabledButton
          ]}
          onPress={handleNextStep}
          disabled={!selectedSinger}
        >
          <Text style={[styles.buttonText, styles.nextButtonText]}>
            {t('music.start_production')}
          </Text>
        </TouchableOpacity>
      </View>
      <PointsConfirmModal
        visible={modalVisible}
        onClose={handleGenerateMusicAction}
        onConfirm={handleGenerateMusicAction}
        onCancel={() => setModalVisible(false)}
        title={t('music.generating_your_song_will_cost').replace('{points}', (isSelectedVoice ? 110 : 50).toString())}
        onDontShowAgain={() => { }}
      />
      <PointsLimitModal
        visible={pointsLimitModalVisible}
        onClose={() => setPointsLimitModalVisible(false)}
        onConfirm={handlePointsTopup}
        onCancel={() => setModalVisible(false)}
        onDontShowAgain={() => { }}
      />
      <CommonModal
        visible={recordModalVisible}
        onClose={() => setRecordModalVisible(false)}
        config={{
          title: t('music.creating_voiceprint_will_leave_page'),
          content: t('music.voiceprint_recording_rules_content'),
          buttons: [
            {
              text: t('music.cancel'),
              onPress: () => { setRecordModalVisible(false) },
              type: 'border' as const,
            },
            {
              text: t('music.go_record_button'),
              onPress: () => {
                (navigation as any).reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Profile',
                      params: {
                        screen: 'VoiceprintMaterialCreate'
                      }
                    },
                  ]
                });
              },
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
    paddingTop: normalize(30),
  },

  // Tab栏样式
  tabBar: {
    flexDirection: 'row',
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

  // 状态栏样式
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingTop: normalize(10),
    paddingBottom: normalize(5),
  },
  timeText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalIcon: {
    width: normalize(20),
    height: normalize(12),
    backgroundColor: '#FFFFFF',
    marginRight: normalize(4),
    borderRadius: normalize(2),
  },
  wifiIcon: {
    width: normalize(16),
    height: normalize(12),
    backgroundColor: '#FFFFFF',
    marginRight: normalize(4),
    borderRadius: normalize(2),
  },
  batteryIcon: {
    width: normalize(24),
    height: normalize(12),
  },

  // 标题栏样式
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(15),
  },
  titleText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '600',
  },
  subtitleText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
  },

  // 头像容器
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: normalize(20),
  },
  userAvatar: {
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(40),
  },

  // 跳过选择
  skipContainer: {
    alignItems: 'center',
    paddingVertical: normalize(10),
  },
  skipText: {
    fontSize: normalizeFontSize(14),
    color: theme.primary,
  },
  addButtonContainer: {
    height: normalize(72),
    backgroundColor: theme.backgroundSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: normalize(12),
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    margin: normalize(24),
    marginBottom: normalize(0),
  },
  // 歌手列表
  singerList: {
    flex: 1,
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: 'transparent',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: theme.backgroundSecondary,
    margin: normalize(24),
    marginBottom: normalize(15),
    marginTop: normalize(0),
  },
  commonList: {
    borderTopLeftRadius: normalize(12),
    borderTopRightRadius: normalize(12),
    marginTop: normalize(24),
  },
  singerItem: {
    width: '100%',
    height: normalize(72),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: normalize(15),
    paddingHorizontal: normalize(20),
    borderBottomWidth: 1,
    borderColor: theme.background,
  },
  selectedSingerItem: {
    backgroundColor: 'rgba(133,243,128,0.4)',
    flex: 1,
  },
  lastSingerItem: {
    borderBottomWidth: 0,
  },
  singerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageButton: {
    width: normalize(60),
    height: normalize(24),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: '#454545',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(16),
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
  playIcon: {
    width: normalize(26),
    height: normalize(26),
  },
  singerAvatar: {
    width: normalize(22),
    height: normalize(22),
    borderRadius: normalize(20),
    marginRight: normalize(12),
  },
  singerName: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
  },
  checkIcon: {
    width: normalize(20),
    height: normalize(20),
  },

  CommonvoiceprintContent: {
    height: normalize(400),
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceprintContent: {
    height: normalize(300),
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceprintText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: normalize(10),
  },
  voiceprintSubtext: {
    fontSize: normalizeFontSize(14),
    textAlign: 'center',
  },

  // 底部按钮
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(10),
    paddingHorizontal: normalize(20),
  },
  button: {
    flex: 1,
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(20),
    borderRadius: normalize(8),
    alignItems: 'center',
    marginHorizontal: normalize(8),
  },
  previousButton: {
    borderWidth: 1,
    borderColor: theme.primary,
  },
  nextButton: {
    backgroundColor: theme.primary,
  },
  disabledButton: {
    backgroundColor: theme.backgroundTertiary,
  },
  buttonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
  },
  nextButtonText: {
    color: theme.background,
  },
  addButton: {
    flex: 1,
    backgroundColor: theme.backgroundTertiary,
    height: normalize(48),
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    margin: normalize(16),
    marginBottom: normalize(15),
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plusIcon: {
    width: normalize(12),
    height: normalize(12),
    marginRight: normalize(6),
  },
  addButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: theme.primary,
  },
});

export default SingerSelectionScreen;