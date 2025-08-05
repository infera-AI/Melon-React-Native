import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Modal } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { useMusicStore } from '@/store/modules/music.store';
import { formatTime } from '@/utils';
import { AudioPlayer, quickValidateAudio ,getAudioDuration} from '@/utils/audioUtils';
import { polishLyrics, generateMusic } from '@/api/music/music';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useMessageModal } from '@/contexts/MessageModalContext';
import { supportedLanguages } from '@/i18n/languages';
import { translateText } from '@/api/profile/profile';
import { useLanguage } from '@/contexts/LanguageContext';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import { SafeAreaView } from 'react-native-safe-area-context';

const CARD_RADIUS = normalize(18);
const CARD_PADDING = normalize(16);
const CARD_MARGIN_BOTTOM = normalize(18);

const img_pause_btn = require("../../../../assets/images/music_pause.png");


const MusicEditHummingScreen: React.FC<{route: any}> = ({route}) => {
  const {uri} = route.params;
  const [duration,setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const {lyrics:lyricsInit,musicStyles} = useMusicStore.getState().musicGenerateInfo;
  const [lyrics, setLyrics] = useState(lyricsInit);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [leftLanguage, setLeftLanguage] = useState<string>("zh");
  const [rightLanguage, setRightLanguage] = useState<string>("zh");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef<AudioPlayer>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [type,setType] = useState<string>("");
  const {show} = useMessageModal()
  const {t} = useLanguage();
  const navigation = useNavigation();
  const currentTimeInterval = useRef<NodeJS.Timeout | null>(null);

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
  const handlePlayAudio = async () => {

    // if(!audioPlayerRef.current){
    //   audioPlayerRef.current = AudioPlayer.getInstance();
    //   audioPlayerRef.current.onFinishCallback(() => {
    //     clearCurrentTimeInterval();
    //     audioPlayerRef.current = null;
    //     setIsPlaying(false);
    //     setCurrentTime(0);
    //   });
    // }

    // if(isPlaying){
    //   AudioPlayer.getInstance().pauseAudio();
    //   setIsPlaying(false);
    //   return;
    // }else if(audioPlayerRef.current.sound){
    //   audioPlayerRef.current.resumeAudio();
    //   setIsPlaying(true);
    //   return;
    // }
    if(isPlaying){
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
    console.log('success',success);
  }

  // 定时器获取当前时间
  const getCurrentTime = async () => {
    currentTimeInterval.current = setInterval(() => {
      const currentTime = audioPlayerRef.current?.getPlaybackStatus().currentTime;
      setCurrentTime(currentTime || 0);
    }, 1000);
  }

  const clearCurrentTimeInterval = () => {
    if(currentTimeInterval.current){
      clearInterval(currentTimeInterval.current);
      currentTimeInterval.current = null;
    }
  }

   // 选择曲风
   const handleStyleSelect = (style: string) => {
    setSelectedStyles(prev => {
      if (prev.includes(style)) {
        return prev.filter(item => item !== style);
      } else {
        return [...prev, style];
      }
    });
  };

   // 歌词润饰
   const handleAiPolish = async () => {
    try {
      setIsLoading(true);
      const res = await polishLyrics({
        work_lyrics: lyrics,
      });
      setLyrics(res.work_lyrics)
      setTitle(res.work_title)
    } catch (error: any) {
      console.log(error);
      show({
        message: t('music.polish_lyrics_failed') + (error.message || t('common.unknown_error')),
      });
    }
    setIsLoading(false);
  };

  const handleNext = async () => {
    if(lyrics.trim() === ""){
      show({
        message: t('music.lyrics_empty'),
      });
      return;
    }
    if(selectedStyles.length === 0){
      show({
        message: t('music.select_music_style'),
      });
      return;
    }
    useMusicStore.getState().setMusicGenerateInfo({
      title: title,
      lyrics: lyrics,
      musicStyles: selectedStyles,
    });
    setLoading(true);
    generateMusic({ 
      work_title: title,
      work_lyrics: lyrics,
      work_genres: selectedStyles,
    }).then((rsp) => {
      setLoading(false);
      if(!rsp.task_id){
        show({
          message: t('translate_screen.failed_again')
        })
        return
      }
      navigation.replace('GeneratingMusic' as never, {
        taskId: rsp.task_id,
        createTaskTime: Math.floor(performance.now())
      });
    }).catch(() => {
      setLoading(false);
      show({
        message: t('http_service_error')
      })
    });
    
  }

  const handleLanguageSelect = (language: string) => {
    if(type==="left"){
      setLeftLanguage(language);
    }else{
      setRightLanguage(language);
    }
    setShowLanguageModal(false);
  };

  const handleLanguageSwitch = (type:string) => {
    setType(type);
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
    } catch (error:any) {
      console.log(error);
      show({
        message: t('music.translate_lyrics_failed') + (error.message || t('common.unknown_error')),
      });
    }finally{
      setIsLoading(false);
    }
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
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
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
          <Text style={styles.audioTime}>{formatTime(currentTime||duration)}</Text>
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
            placeholder="Enter the lyrics in your mind."
            placeholderTextColor="#666"
            value={lyrics}
            onChangeText={setLyrics}
            multiline
          />
        </View>

        {/* 下方区块 */}
        <View style={styles.bottomBlock}>
          {/* 语言选择与功能按钮 */}
          <View style={styles.langRow}>
            <TouchableOpacity style={styles.langBtn} onPress={()=>handleLanguageSwitch("left")}>
              <Text style={styles.langText}>{leftLanguage}</Text>
              <Text style={styles.langArrow}>▼</Text>
            </TouchableOpacity>
            <Text style={styles.langSwitch}>⇄</Text>
            <TouchableOpacity style={styles.langBtn} onPress={()=>handleLanguageSwitch("right")}>
              <Text style={styles.langText}>{rightLanguage}</Text>
              <Text style={styles.langArrow}>▼</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.musicTransBtn} onPress={handleTranslateLyrics}>
              <Image
                source={require('../../../../assets/images/music_trans.png')}
                style={styles.musicTransIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* 音乐风格选择卡片 */}
          <View style={styles.styleCard}>
            <View style={styles.lyricCardHeader}>
              <Text style={styles.lyricCardTitle}>{t('music.select_music_style')}</Text>  
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
            <Text style={styles.styleSubtitle}>
              Pre-filled based on user's humming tone
            </Text>
            <ScrollView
              style={styles.styleBtnRowScroll}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.styleBtnRow}
            >
              {musicStyles.map((btn) => (
                <TouchableOpacity
                  key={btn}
                  style={[
                    styles.styleBtn,
                    selectedStyles.includes(btn) && styles.styleBtnSelected,
                  ]}
                  onPress={() => handleStyleSelect(btn)}
                >
                  <Text
                    style={[
                      styles.styleBtnText,
                      selectedStyles.includes(btn) && styles.styleBtnTextSelected,
                    ]}
                  >
                    {btn}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        {/* Next 按钮 */}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>{t('music.next')}</Text>
        </TouchableOpacity>
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
                {supportedLanguages?.map((language: any, index: number) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.languageOption} 
                    onPress={() => handleLanguageSelect(language.code)}
                  >
                    <Text style={styles.languageOptionText}>{language.label}</Text>
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
    borderRadius: CARD_RADIUS,
    padding: CARD_PADDING,
    marginBottom: CARD_MARGIN_BOTTOM,
    minHeight: normalize(120),
    flex: 1,
    overflow:'hidden',
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
    color: '#85F380',
  },
  lyricInput: {
    minHeight: normalize(120),
    color: '#fff',
    fontSize: normalizeFontSize(15),
    marginTop: normalize(2),
    textAlignVertical: 'top',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: normalize(18),
  },
  langBtn: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: normalize(10),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(14),
    marginHorizontal: normalize(2),
    justifyContent: 'center',
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
    color: '#fff',
    fontSize: normalizeFontSize(22),
    marginHorizontal: normalize(8),
  },
  musicTransBtn: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#222',
    borderRadius: normalize(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: normalize(6),
  },
  musicTransIcon: {
    width: normalize(32),
    height: normalize(32),
  },
  styleCard: {
    backgroundColor: '#191919',
    borderRadius: CARD_RADIUS,
    padding: CARD_PADDING,
    marginBottom: CARD_MARGIN_BOTTOM,
  },
  styleSubtitle: {
    color: '#aaa',
    fontSize: normalizeFontSize(14),
    marginBottom: normalize(12),
    marginTop: normalize(2),
  },
  styleBtnRowScroll: {
    marginBottom: 0,
  },
  styleBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
    paddingRight: normalize(8),
  },
  styleBtn: {
    backgroundColor: '#222',
    borderRadius: normalize(8),
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(18),
    marginRight: normalize(8),
    marginBottom: normalize(8),
  },
  styleBtnSelected: {
    backgroundColor: '#85F380',
  },
  styleBtnText: {
    color: '#fff',
    fontSize: normalizeFontSize(15),
    fontWeight: '500',
  },
  styleBtnTextSelected: {
    color: '#111',
    fontWeight: '700',
  },
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
    width: normalize(44),
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
  nextBtn: {
    width: '100%',
    backgroundColor: '#85F380',
    borderRadius: normalize(12),
    paddingVertical: normalize(16),
    alignItems: 'center',
    marginBottom: 0,
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
  nextBtnText: {
    color: '#111',
    fontSize: normalizeFontSize(20),
    fontWeight: '600',
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
