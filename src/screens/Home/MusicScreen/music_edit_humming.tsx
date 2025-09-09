import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Modal } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { useMusicStore } from '@/store/modules/music.store';
import { formatTime } from '@/utils';
import { AudioPlayer, quickValidateAudio, getAudioDuration } from '@/utils/audioUtils';
import { polishLyrics, recommendGenres, generateMusic, getSupportedLanguages, getMusicSegmentation } from '@/api/music/music';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useMessageModal } from '@/contexts/MessageModalContext';
import { supportedLanguages } from '@/i18n/languages';
import { translateText } from '@/api/profile/profile';
import { useLanguage } from '@/contexts/LanguageContext';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePointsStore } from '@/store/modules/points.store';
import { languageDetection } from '@/api/translate/translate';

const img_pause_btn = require("../../../../assets/images/music_pause.png");


const MusicEditHummingScreen: React.FC<{ route: any }> = ({ route }) => {
  const { uri } = route.params;
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const { lyrics: lyricsInit } = useMusicStore.getState().musicGenerateInfo;
  const [lyrics, setLyrics] = useState(lyricsInit);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [leftLanguage, setLeftLanguage] = useState<string>("zh");
  const [rightLanguage, setRightLanguage] = useState<string>("zh");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef<AudioPlayer>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [type, setType] = useState<string>("");
  const { show } = useMessageModal()
  const { t } = useLanguage();
  const navigation = useNavigation();
  const currentTimeInterval = useRef<NodeJS.Timeout | null>(null);
  const [musicStyles, setMusicStyles] = useState<string[]>([]);
  const [musicStylesInput, setMusicStylesInput] = useState<string>("");
  const [supportedLanguageList, setSupportedLanguageList] = useState([])
  const refreshPointsBalance = usePointsStore.getState().refreshPointsBalance;
  const [languageList, setLanguageList] = useState<any[]>([]);




  const [loading, setLoading] = useState(false);

  // 清理音频相关数据
  const cleanupAudioData = useCallback(() => {
    try {
      // 停止音频播放
      if (audioPlayerRef.current && audioPlayerRef.current.stopAudio) {
        audioPlayerRef.current.stopAudio();
        audioPlayerRef.current = null;
      }

      // 清理定时器
      clearCurrentTimeInterval();

      // 重置播放状态
      setIsPlaying(false);
      setCurrentTime(0);

      console.log('音频数据清理完成');
    } catch (error) {
      console.error('清理音频数据失败:', error);
    }
  }, []);

  useEffect(() => {
    const fetchDuration = async () => {
      console.log('开始获取音频时长，URI:', uri);

      // 先进行快速验证
      const isValid = await quickValidateAudio(uri);
      console.log('快速验证结果:', isValid);

      if (!isValid) {
        console.error('音频文件验证失败，无法获取时长');
        setDuration(0);
        return;
      }

      try {
        const durationValue = await getAudioDuration(uri);
        console.log('获取到的音频时长:', durationValue);
        setDuration(durationValue);
      } catch (error) {
        console.error('获取音频时长失败:', error);
        setDuration(0);
      }
    };
    fetchDuration();
    return () => {
      cleanupAudioData();
    }
  }, [uri, cleanupAudioData]);

  // 获取支持语言
  const getSupportedLanguagesRequest = async () => {
    const res = await getSupportedLanguages();
    const formatLanguageList = res.support_language.map((language: any) => ({ code: language }));
    setSupportedLanguageList(formatLanguageList);
    console.log(res);
  }

  useEffect(() => {
    getSupportedLanguagesRequest();
    refreshPointsBalance();
  }, []);

  useEffect(() => {
    getRecommendStylesRequest();
  }, [lyrics]);
  const handlePlayAudio = async () => {
    if (isPlaying) {
      audioPlayerRef.current.stopAudio();
      setIsPlaying(false);
      return;
    }
    audioPlayerRef.current = AudioPlayer.getInstance();
    const success = await audioPlayerRef.current.playAudio(uri);
    audioPlayerRef.current.onFinishCallback = () => {
      audioPlayerRef.current = null;
      setIsPlaying(false);
    };
    setIsPlaying(true);
    console.log('success', success);
  }

  // 定时器获取当前时间
  const getCurrentTime = async () => {
    currentTimeInterval.current = setInterval(() => {
      const currentTime = audioPlayerRef.current?.getPlaybackStatus().currentTime;
      setCurrentTime(currentTime || 0);
    }, 1000);
  }

  const clearCurrentTimeInterval = () => {
    if (currentTimeInterval.current) {
      clearInterval(currentTimeInterval.current);
      currentTimeInterval.current = null;
    }
  }

  //去掉连续出现的逗号替换为一个逗号,去掉首尾的逗号
  const removeExtraCommas = (str: string) => {
    return str.replace(/,+/g, ",").replace(/^,+/, "").replace(/,+$/, "");
  }

  // 选择曲风
  const handleStyleSelect = (style: string) => {
    if (musicStylesInput.includes(style)) {
      setMusicStylesInput(removeExtraCommas(musicStylesInput.replace(style, "")));
    } else {
      if (musicStylesInput.endsWith(",")) {
        setMusicStylesInput(musicStylesInput + style);
      } else {
        setMusicStylesInput(musicStylesInput.length > 0 ? musicStylesInput + "," + style : style);
      }
    }
  };

  // 歌词润饰
  const handleAiPolish = async () => {
    try {
      setIsLoading(true);
      const res = await polishLyrics({
        lyrics: lyrics,
      });
      setLyrics(res.lyrics)
      setTitle(res.work_title)
    } catch (error: any) {
      console.log(error);
      show({
        message: t('music.polish_lyrics_failed') + (error.message || t('common.unknown_error')),
      });
    }
    setIsLoading(false);
  };

  // 判断语言是否符合要求
  const getLanguageDetection = async () => {
    setLoading(true);
    try {
      const res = await languageDetection({
        source_text: lyrics,
      });
      console.log(res);
      return res.detected_language;
    } catch (error) {
      console.log(error);
      return "";
    } finally {
      setLoading(false);
    }
  }

  const handleNext = async () => {
    if (lyrics.trim() === "") {
      show({ message: t('music.lyrics_empty') });
      return;
    }
    if (musicStylesInput.length === 0) {
      show({ message: t('music.select_music_style') });
      return;
    }

    // 判断语言是否符合要求
    const detectedLanguage = await getLanguageDetection();
    if (supportedLanguageList.findIndex((language: any) => language.code === detectedLanguage) === -1) {
      show({ message: "The current lyrics do not support song generation. Please rephrase them and try again." });
      return;
    }

    useMusicStore.getState().setMusicGenerateInfo({
      title: title,
      lyrics: lyrics,
      musicStyles: musicStylesInput.split(","),
    });
    navigation.navigate('SingerSelection', { type: 'generate' });
  }

  const handleLanguageSelect = (language: string) => {
    if (type === "left") {
      setLeftLanguage(language);
    } else {
      setRightLanguage(language);
    }
    setShowLanguageModal(false);
  };

  const handleLanguageSwitch = (type: string) => {
    setType(type);
    if (type === "left") {
      setLanguageList(supportedLanguages);
    } else {
      setLanguageList(supportedLanguageList);
    }
    setShowLanguageModal(true);
  }

  const handleTranslateLyrics = async () => {
    try {
      setIsLoading(true);
      const res = await translateText({
        source_text: lyrics,
        source_language: leftLanguage,
        target_language: rightLanguage,
        format_type: "text",
      });
      setLyrics(res.Translated);
    } catch (error: any) {
      console.log(error);
      show({
        message: t('music.translate_lyrics_failed') + (error.message || t('common.unknown_error')),
      });
    } finally {
      setIsLoading(false);
    }
  }

  // 获取推荐曲风
  const getRecommendStylesRequest = async () => {
    try {
      const res = await getMusicSegmentation();
      console.log(res);
      setMusicStyles(res.genres)
      return res.genres;
    } catch (error: any) {
      show({
        message: t('music.get_recommend_styles_failed') + (error.message || t('common.unknown_error')),
      });
    }
  };


  const refreshAIStyles = async () => {
    setLoading(true);
    const res = await getRecommendStylesRequest();
    setMusicStylesInput(res.join(","));
    setLoading(false);
  }

  const handleRefreshRecommendStyles = async () => {
    setLoading(true);
    await getRecommendStylesRequest();
    setLoading(false);
  }



  // 监听页面焦点变化，当页面重新获得焦点时执行getMyWorks
  useFocusEffect(
    React.useCallback(() => {
      console.log('页面获得焦点');
      // 页面失去焦点时的清理函数
      return () => {
        console.log('页面失去焦点，清理音频数据');
        cleanupAudioData();
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView>
        {/* Header Row (Back Button) */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => {
            cleanupAudioData();
            navigation.goBack();
          }} style={styles.backBtn}>
            <Image
              source={require('../../../../assets/images/music_back_btn.png')}
              style={styles.backBtnIcon}
            // resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={{ width: 32 }} />
        </View>
        {/* 内容区 */}
        <View style={styles.flexContent}>
          {/* 音频波形条 */}
          <View style={styles.audioBarContainer}>
            <Text style={styles.audioTime}>{formatTime(currentTime || duration)}</Text>
            <View style={styles.audioWaveform}>
              <Image
                source={require('../../../../assets/images/long_wave.png')}
                style={styles.longWaveImg}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity style={styles.audioPlayBtn} activeOpacity={0.7} onPress={handlePlayAudio}>
              <View style={styles.audioPlayCircle}>
                <Image
                  source={isPlaying ? img_pause_btn : require('../../../../assets/images/music_play.png')}
                  style={styles.audioPlayIcon}
                // resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>
          {/* 歌词输入卡片 */}
          <View style={styles.lyricCard}>
            <View style={styles.lyricCardHeader}>
              <Text style={styles.lyricCardTitle}>{t('music.write_lyrics')}</Text>
              <TouchableOpacity style={styles.aiPolish} onPress={handleAiPolish}>
                <Image
                  source={require('../../../../assets/images/ai_polishing_star.png')}
                  style={styles.aiIcon}
                  resizeMode="contain"
                />
                <MaskedView
                  maskElement={
                    <Text style={styles.aiPolishText}>{t('music.ai_polishing')}</Text>
                  }
                >
                  <LinearGradient
                    colors={['#85F380', '#A099FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={[styles.aiPolishText, { opacity: 0 }]}>
                      {t('music.ai_polishing')}
                    </Text>
                  </LinearGradient>
                </MaskedView>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.lyricInput}
              placeholder={t('music.enter_lyrics_placeholder')}
              placeholderTextColor="#666"
              value={lyrics}
              onEndEditing={() => setLyrics(lyrics.trim())}
              onChangeText={setLyrics}
              numberOfLines={10}
              multiline
            />
            {lyrics.length > 0 && <TouchableOpacity style={styles.clearIconContainer} onPress={() => setLyrics("")}>
              <Image source={require('@/assets/music/music_delete_icon.png')} style={styles.clearIcon} />
            </TouchableOpacity>}
          </View>

          {/* 底部操作区 */}
          <View style={{ justifyContent: 'flex-end' }}>
            {/* 语言选择与功能按钮 */}
            <View style={styles.langRow}>
              <View style={styles.langBtnContainer}>
                <TouchableOpacity style={styles.langBtn} onPress={() => handleLanguageSwitch("left")}>
                  <Text style={styles.langText}>{t(`languageNames.${leftLanguage}`)}</Text>
                </TouchableOpacity>
                <Image source={require('@/assets/main/language_exchange.png')} style={styles.langSwitch} />
                <TouchableOpacity style={styles.langBtn} onPress={() => handleLanguageSwitch("right")}>
                  <Text style={styles.langText}>{t(`languageNames.${rightLanguage}`)}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.musicTransBtn} onPress={handleTranslateLyrics}>
                <Image
                  source={require('../../../../assets/images/music_trans.png')}
                  style={styles.musicTransIcon}
                // resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {/* 曲风选择卡片 */}
            <View style={styles.musicStyleCard}>
              <View style={styles.musicStyleHeader}>
                <Text style={styles.musicStyleTitle}>{t('music.select_music_style')}</Text>
                <TouchableOpacity style={styles.aiPolish} onPress={refreshAIStyles}>
                  <Image
                    source={require('../../../../assets/images/ai_polishing_star.png')}
                    style={styles.aiIcon}
                    resizeMode="contain"
                  />
                  <MaskedView
                    maskElement={
                      <Text style={styles.aiPolishText}>{t('music.ai_polishing')}</Text>
                    }
                  >
                    <LinearGradient
                      colors={['#85F380', '#A099FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={[styles.aiPolishText, { opacity: 0 }]}>
                        {t('music.ai_polishing')}
                      </Text>
                    </LinearGradient>
                  </MaskedView>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.lyricInput}
                placeholder={'Enter style tags, separated by commas. Example: pop,rock,......'}
                placeholderTextColor="#666"
                value={musicStylesInput}
                onChangeText={setMusicStylesInput}
                numberOfLines={10}
                multiline
              />
              {musicStylesInput.length > 0 && <TouchableOpacity style={[styles.clearIconContainer, { bottom: normalize(68) }]} onPress={() => setMusicStylesInput("")}>
                <Image source={require('@/assets/music/music_delete_icon.png')} style={styles.clearIcon} />
              </TouchableOpacity>}
              {/* 音频可视化 */}
              {lyrics.length > 0 && <View style={styles.audioVisualization}>
                <TouchableOpacity onPress={handleRefreshRecommendStyles}>
                  <Image source={require('@/assets/main/refresh_icon.png')} style={styles.musicStyleInputIcon} />
                </TouchableOpacity>
                {/* 曲风选择芯片 */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.styleChipsContainer}
                  contentContainerStyle={styles.styleChipsContent}
                >
                  {musicStyles.map((style) => (
                    <TouchableOpacity
                      key={style}
                      style={[
                        styles.styleChip,
                        musicStylesInput.includes(style) && styles.styleChipSelected
                      ]}
                      onPress={() => handleStyleSelect(style)}
                    >
                      <Text style={[
                        styles.styleChipText,
                        musicStylesInput.includes(style) && styles.styleChipTextSelected
                      ]}>
                        {style}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>}


            </View>

            {/* Next 按钮 */}
            <TouchableOpacity
              style={[
                styles.nextBtn,
                !lyrics && styles.nextBtnDisabled
              ]}
              disabled={!lyrics}
              onPress={handleNext}
            >
              <Text
                style={[
                  styles.nextBtnText,
                  !lyrics && styles.nextBtnTextDisabled
                ]}
              >
                {t('music.next')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* 语言选择弹窗 */}
        <Modal
          visible={showLanguageModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('voiceprint_management.select_language')}</Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.languageList}>
                {languageList?.map((language: any, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.languageOption}
                    onPress={() => handleLanguageSelect(language?.code)}
                  >
                    <Text style={styles.languageOptionText}>{t(`languageNames.${language?.code}`)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
      <FullScreenLoader visible={isLoading} />
      <FullScreenLoader
        visible={loading}
        text={t('translate_screen.loading_text')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: normalize(24),
    paddingHorizontal: normalize(12),
    paddingBottom: normalize(24),
  },
  flexContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginTop: normalize(16), // leave space for back button
  },
  bottomBlock: {
    marginBottom: normalize(24),
  },
  lyricCard: {
    height: normalize(260),
    backgroundColor: '#191919',
    borderRadius: normalize(12),
    padding: normalize(16),
    marginBottom: normalize(18),
    flex: 1,
    minHeight: 0,
  },
  // 播放音频
  audioBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: normalize(16),
    paddingHorizontal: normalize(18),
    paddingVertical: normalize(10),
    marginBottom: normalize(18),
    marginTop: 0,
  },
  audioTime: {
    color: '#85F380',
    fontSize: normalizeFontSize(18),
    fontWeight: 'bold',
    marginRight: normalize(12),
    textAlign: 'left',
  },
  audioWaveform: {
    flex: 1,
    height: normalize(28),
    marginRight: normalize(16),
    marginLeft: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  longWaveImg: {
    width: '100%',
    height: normalize(28),
  },
  waveBar: {
    width: normalize(3),
    backgroundColor: '#85F380',
    marginHorizontal: normalize(1),
    borderRadius: normalize(2),
  },
  audioPlayBtn: {
    marginLeft: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioPlayCircle: {
    width: normalize(32),
    height: normalize(32),
    // borderRadius: 16,
    // backgroundColor: '#85F380',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioPlayIcon: {
    width: normalize(32),
    height: normalize(32),
    // tintColor: '#111',
    marginLeft: normalize(2),
  },
  lyricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  lyricCardTitle: {
    color: '#fff',
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
  },
  aiPolish: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    width: normalize(18),
    height: normalize(18),
    marginRight: normalize(4),
    tintColor: '#85F380',
  },
  aiPolishText: {
    fontWeight: 'bold',
    fontSize: normalizeFontSize(15),
    color: '#85F380', // fallback color
    textAlign: 'center',
  },
  lyricInput: {
    minHeight: normalize(90),
    color: '#fff',
    fontSize: normalizeFontSize(15),
    marginTop: normalize(2),
    textAlignVertical: 'top',
  },
  clearIconContainer: {
    position: 'absolute',
    right: normalize(16),
    bottom: normalize(16),
  },
  clearIcon: {
    width: normalize(22),
    height: normalize(22),
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: normalize(18),
  },
  langBtnContainer: {
    width: "83%",
    height: normalize(48),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: normalize(12),
    borderWidth: 1,
  },
  langBtn: {
    flex: 1,
    height: normalize(48),
    backgroundColor: 'transparent',
    borderRadius: normalize(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: normalize(2),
  },
  langText: {
    color: '#fff',
    fontSize: normalizeFontSize(15),
    fontWeight: '500',
    marginRight: normalize(4),
  },
  langArrow: {
    color: '#888',
    fontSize: normalizeFontSize(13),
  },
  langSwitch: {
    width: normalize(20),
    height: normalize(20),
  },
  musicTransBtn: {
    width: normalize(48),
    height: normalize(48),
    backgroundColor: '#222',
    borderRadius: normalize(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicTransIcon: {
    width: normalize(48),
    height: normalize(48),
    // tintColor: '#333',
  },
  nextBtn: {
    backgroundColor: '#85F380',
    borderRadius: normalize(12),
    paddingVertical: normalize(14),
    alignItems: 'center',
    marginTop: normalize(2),
  },
  nextBtnDisabled: {
    backgroundColor: '#444',
  },
  nextBtnText: {
    color: '#111',
    fontSize: normalizeFontSize(18),
    fontWeight: '600',
  },
  nextBtnTextDisabled: {
    color: '#888',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    marginBottom: 0,
    marginTop: normalize(8),
  },
  backBtn: {
    width: normalize(32),
    height: normalize(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnIcon: {
    width: normalize(28),
    height: normalize(28),
  },
  // 曲风选择卡片样式
  musicStyleCard: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    padding: normalize(16),
    marginBottom: normalize(18),
    height: normalize(388),
    paddingBottom: normalize(16),
  },
  musicStyleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  musicStyleTitle: {
    color: '#FFFFFF',
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  // 音频可视化样式
  audioVisualization: {
    position: 'absolute',
    height: normalize(36),
    bottom: normalize(16),
    left: normalize(16),
    right: normalize(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  musicStyleInputIcon: {
    width: normalize(22),
    height: normalize(22),
    marginRight: normalize(12),
  },
  audioDescription: {
    color: '#B0B0B0',
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    lineHeight: normalize(20),
    letterSpacing: -0.4,
    marginBottom: normalize(8),
  },
  // 曲风选择芯片样式
  styleChipsContainer: {
    height: normalize(36),
  },
  styleChipsContent: {
    position: 'absolute',
    height: normalize(36),
  },
  styleChip: {
    backgroundColor: '#262626',
    borderRadius: normalize(8),
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(12),
    marginRight: normalize(8),
    borderWidth: 1,
    borderColor: '#454545',
  },
  styleChipSelected: {
    backgroundColor: '#85F380',
    borderColor: '#85F380',
  },
  styleChipText: {
    color: '#FFFFFF',
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    textAlign: 'center',
  },
  styleChipTextSelected: {
    color: '#333333',
  },
  // 弹窗样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    width: normalize(300),
    maxHeight: normalize(400),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: normalizeFontSize(18),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  languageList: {
    maxHeight: normalize(300),
  },
  languageOption: {
    padding: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  languageOptionText: {
    fontSize: normalizeFontSize(14),
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default MusicEditHummingScreen;
