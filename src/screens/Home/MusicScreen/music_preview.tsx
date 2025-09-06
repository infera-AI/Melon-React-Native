import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MusicStackParamList } from './navigator';
import theme from '@/utils/theme';
import { useMessageModal } from '@/contexts/MessageModalContext';
import Sound from 'react-native-sound';
import { AudioDurationManager } from '@/utils/AudioPlayerUtils';
import { saveGenerateMusicOS } from '@/api/music/music';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import CommonModal from '@/components/CommonModal';
import { useMusicStore } from '@/store/modules/music.store';
import { usePointsStore } from '@/store/modules/points.store';

type MusicPreviewScreenNavigationProp = NativeStackNavigationProp<MusicStackParamList, 'MusicPreview'>;

// 定义音乐类型
interface Music {
  id: number;
  url: string;
  cover: string;
  title: string;
  lyrics: string;
  taskId: string;
  duration: number;
  genres: string[];
}

const MusicPreviewScreen: React.FC<{ route: RouteProp<MusicStackParamList, 'MusicPreview'> }> = ({ route }) => {
  const navigation = useNavigation<MusicPreviewScreenNavigationProp>();
  const [songs, setSongs] = useState<any[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<any>(songs[0]);
  const { music } = route.params || {};
  const { show } = useMessageModal();
  const [sound, setSound] = useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowModal, setIsShowModal] = useState(false);
  const { taskId } = useMusicStore.getState();
  const { refreshPointsBalance } = usePointsStore.getState();
  const { isSelectedVoice } = useMusicStore.getState();
  const { t } = useLanguage();
  // 作品数组转换
  async function convertSongData(songData: any) {
    if (!songData || !songData.work_url) return [];
    const length = songData.work_url.length;
    const genres = [];
    for (let i = 0; i < songData.work_genres.length; i++) {
      genres.push(songData.work_genres[i]);
    }
    const result = [];
    for (let i = 0; i < length; i++) {
      result.push({
        id: i,
        url: songData.work_url[i],
        cover: songData.work_cover[i],
        title: songData.work_title,
        lyrics: songData.work_lyrics[i],
        taskId: songData.task_id,
        duration: await getDuration(songData.work_url[i]),
        genres,
      });
    }
    return result;
  }

  //获取音乐时长
  const getMusicDuration = (music: any) => {
    console.log(music, 'music')
  }

  // 播放音乐 
  const handlePlayAudio = (audioUrl: string) => {
    if (!audioUrl) {
      show({ message: t('music.no_audio_available') });
      return;
    }

    // 停止当前播放的音频
    if (sound) {
      sound.stop();
      sound.release();
    }

    // 创建新的音频实例
    const newSound = new Sound(audioUrl, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load audio:', error);
        show({ message: t('music.failed_to_load_audio') });
        return;
      }

      // 音频加载成功，开始播放
      newSound.play((success) => {
        if (success) {
          console.log('Audio played successfully');
        } else {
          console.log('Audio playback failed');
        }
        setIsPlaying(false);
        newSound.release();
      });

      setIsPlaying(true);
    });

    setSound(newSound);
  };

  // 选中音乐
  const handleSelectMusic = (music: Music) => {
    console.log(music, 'music')
    setSelectedMusic(music);
    // handlePlayAudio(music.url);
    navigation.navigate('MusicPlay', { music: music, songs: songs });
  }

  const getDuration = async (url: string) => {
    console.log('开始获取音频时长，URI:', url);
    try {
      const durationTime = await AudioDurationManager.getDuration(url);
      console.log(durationTime, 'durationTime')
      return durationTime;
    } catch (error) {
      console.log(error, 'error')
    }
  }

  const lyricsArrayToText = (lyricsArray: any) => {
    return lyricsArray?.map((item: any) => {
      return item[2]
    }).join('\n')
  }

  const secToTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSaveMusic = async () => {
    try {
      setIsLoading(true);
      const res = await saveGenerateMusicOS({
        task_id: taskId,
      });
      show({ message: t('music.save_success') })
      refreshPointsBalance();
      navigation.reset({
        index: 0,
        routes: [
          { name: 'Music' as any, params: { screen: 'MyWork' } },
        ]
      });
    } catch (error) {
      show({ message: t('music.save_failed') })
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoBack = () => {
    setIsShowModal(true);
  }

  const modalConfig = {
    title: "",
    content: 'The current song has not been saved yet',
    buttons: [
      {
        text: 'Exit',
        onPress: () => {
          setIsShowModal(false);
          navigation.reset({
            index: 0,
            routes: [
              { name: 'Music' as any, params: { screen: 'MusicMain' } },
            ]
          });
        },
        type: 'secondary' as const,
      },
      {
        text: 'Save and Exit',
        onPress: handleSaveMusic,
        type: 'primary' as const,
      },
    ],
  }

  useEffect(() => {
    console.log(music, 'music')
    const fetchSongDatas = async () => {
      setIsLoading(true);
      const songDatas = await convertSongData(music);
      console.log(songDatas, 'songDatas')
      const musicInfo = {
        url: !isSelectedVoice ? music.music_url : music.cover_url,
        title: music.title,
        duration: music.duration,
        cover: music.cover,
        lyrics: music.lyrics,
        genres: music.genres

      }
      setSongs([musicInfo]);
      setSelectedMusic(musicInfo);
      setIsLoading(false);
    }
    fetchSongDatas();
  }, [])
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={{ width: '100%' }}>
        {/* 风格标签 */}
        <View>
          <Text style={styles.lyricText}>
            Music style
          </Text>
          <View style={[styles.lyricCard, styles.genresCard]}>
            <ScrollView
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              contentContainerStyle={styles.lyricScrollContent}
            >
              <Text style={styles.lyricContent}>
                {selectedMusic?.genres.join(', ')}
              </Text>
            </ScrollView>
          </View>
        </View>
        {/* 歌词/文本卡片 */}
        <Text style={styles.lyricText}>
          Lyrics
        </Text>
        <View style={styles.lyricCard}>
          <ScrollView
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.lyricScrollContent}
          >
            <Text style={styles.lyricContent}>
              {selectedMusic?.lyrics || 'lyrics'}
            </Text>
          </ScrollView>
        </View>
        {/* 封面卡片 */}
        <View style={styles.coversRow}>
          {songs.map((c, idx) => (
            <TouchableOpacity style={[styles.coverCard]} key={c.id} onPress={() => handleSelectMusic(c)}>
              <Image source={{ uri: c.cover }} style={styles.coverBgimg} resizeMode="contain" />
              <Text style={styles.coverTitle} ellipsizeMode='tail' numberOfLines={1}>{c.title}</Text>
              <Image
                source={require('../../../../assets/images/music_play.png')}
                style={styles.coverImg}
                resizeMode="contain"
              />
              <Text style={styles.coverTime}>{secToTime(Math.floor(c.duration)) || '--:--'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* 波形和band文本 */}
        <View style={styles.bandRow}>
          <Image
            source={require('../../../../assets/images/long_wave.png')}
            style={styles.bandWave}
            resizeMode="contain"
          />
          {isPlaying && <Text style={styles.bandText}>{t('music.the_band_is_playing')}</Text>}
        </View>
        {/* 按钮区 */}
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Text style={styles.homeBtnText}>{t('music.back_to_homepage')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.okBtn}
          onPress={handleSaveMusic}
          activeOpacity={0.7}
        >
          <Text style={styles.okBtnText}>{t('music.save_all')}</Text>
        </TouchableOpacity>
      </ScrollView>
      <FullScreenLoader visible={isLoading} />
      <CommonModal
        visible={isShowModal}
        onClose={() => setIsShowModal(false)}
        config={modalConfig}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    paddingTop: normalize(32),
    paddingHorizontal: normalize(24),
    paddingBottom: normalize(24),
    marginTop: normalize(24),
  },
  styleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#262626',
    borderRadius: normalize(8),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(6),
    marginBottom: normalize(16),
    borderWidth: 1,
    borderColor: '#454545',
  },
  styleTagText: {
    color: '#85F380',
    fontSize: normalizeFontSize(18),
    // fontWeight: 'bold',
  },
  lyricCard: {
    width: "100%",
    backgroundColor: '#222',
    borderRadius: normalize(12),
    padding: normalize(12),
    marginBottom: normalize(18),
    height: normalize(406), // 固定高度，让ScrollView可以滚动
    borderColor: "#454545",
    borderWidth: 1,
    marginTop: normalize(12),
  },
  genresCard: {
    height: normalize(80),
  },
  lyricScrollContent: {
    flexGrow: 1, // 确保ScrollView内容可以增长
  },
  lyricText: {
    color: theme.textPrimary,
    fontWeight: '600',
    fontSize: normalizeFontSize(15),
    lineHeight: normalize(22),
  },
  lyricContent: {
    color: theme.textSecondary,
    fontSize: normalizeFontSize(14),
    lineHeight: normalize(20),
  },
  coversRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: normalize(12),
    width: normalize(327),
    marginBottom: normalize(18),
  },
  coverCard: {
    width: normalize(75),
    height: normalize(75),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#191919',
    borderRadius: normalize(12),
    // paddingVertical: normalize(6),
    marginHorizontal: normalize(2),
    borderWidth: 1,
    borderColor: '#85F380',
    overflow: 'hidden',
  },
  coverTitle: {
    fontSize: normalizeFontSize(12),
    color: '#fff',
    position: 'absolute',
    top: normalize(4),
    textAlign: 'center',
    marginBottom: normalize(20),
  },
  coverBgimg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: normalize(74),
    height: normalize(74),
  },
  coverImg: {
    width: normalize(23),
    height: normalize(23),
    position: 'absolute',
    top: normalize(24),
    left: normalize(26),
    marginBottom: normalize(20),
  },
  coverLabel: {
    color: '#85F380',
    fontSize: normalizeFontSize(13),
    fontWeight: 'bold',
    marginBottom: normalize(2),
  },
  coverTime: {
    position: 'absolute',
    bottom: 0,
    width: "100%",
    height: normalize(17),
    textAlign: 'center',
    lineHeight: normalize(17),
    color: '#181819',
    fontSize: normalizeFontSize(12),
    backgroundColor: theme.primary,
  },
  bandRow: {
    width: normalize(327),
    alignItems: 'center',
    marginBottom: normalize(18),
    marginTop: normalize(8),
  },
  bandWave: {
    width: '100%',
    height: normalize(22),
    marginBottom: normalize(4),
  },
  bandText: {
    color: '#85F380',
    fontSize: normalizeFontSize(18),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: normalize(2),
  },
  homeBtn: {
    width: "100%",
    height: normalize(48),
    backgroundColor: '#111',
    borderRadius: normalize(12),
    borderWidth: 2,
    borderColor: '#85F380',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(14),
  },
  homeBtnText: {
    color: '#fff',
    fontSize: normalizeFontSize(18),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  okBtn: {
    width: "100%",
    height: normalize(48),
    backgroundColor: '#85F380',
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  okBtnText: {
    color: '#0C0C0D',
    fontSize: normalizeFontSize(20),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MusicPreviewScreen;
