import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Pressable,
  ImageBackground,
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import Sound from "react-native-sound";
import { useMessageModal } from "@/contexts/MessageModalContext";
import { AudioDurationManager } from '@/utils/AudioPlayerUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import Slider from "@react-native-community/slider";
import Clipboard from "@react-native-clipboard/clipboard";
import theme from "@/utils/theme";
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import { MusicDownloader } from '@/utils/MusicDownloader';
import FullScreenLoading from "@/components/FullScreenLoader";
import { SafeAreaView } from "react-native-safe-area-context";

// 控制按钮图片资源
const img_last_song = require("../../../../assets/images/last_song.png");
const img_next_song = require("../../../../assets/images/next_song.png");
const img_play_btn = require("../../../../assets/images/music_play.png");
const img_pause_btn = require("../../../../assets/images/music_pause.png");
const img_music_share = require("../../../../assets/images/music_share.png");
const img_music_back_btn = require("../../../../assets/images/music_back_btn.png");

// const { width } = Dimensions.get("window");

const MusicPlayScreen = ({ navigation, route }: any) => {
  const { music = {}, songs = [], type } = route.params || {};
  const [sound, setSound] = useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const { show } = useMessageModal();
  const lyricScrollRef = useRef<FlatList<any>>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [currentMusic, setCurrentMusic] = useState<any>(type !== 'cover' ? music : { url: music.cover_url });
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const downloader = MusicDownloader.getInstance();

  // 清理音频相关数据
  const cleanupAudioData = useCallback(() => {
    try {
      // 停止音频播放
      if (sound) {
        sound.stop();
        sound.release();
        setSound(null);
      }

      // 清理定时器
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }

      // 重置播放状态
      setIsPlaying(false);
      setCurrentTime(0);
      setIsSliding(false);

      console.log('音频数据清理完成');
    } catch (error) {
      console.error('清理音频数据失败:', error);
    }
  }, [sound]);

  // 删除弹窗
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // 分享弹窗
  const [showShareModal, setShowShareModal] = useState(false);
  // 风格标签展开状态
  const [isGenresExpanded, setIsGenresExpanded] = useState(false);

  // 秒数转换
  const timeToSec = (t: string) => {
    const [min, sec] = t.split(":").map(Number);
    return min * 60 + sec;
  };

  const secToTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  // 解析歌词数据 - 支持新的work_lyrics格式
  const lyricArr = React.useMemo(() => {
    // 如果music.lyrics是work_lyrics格式
    // if (currentMusic.lyrics && Array.isArray(currentMusic.lyrics)) {
    //   const lyricsData = currentMusic.lyrics; // 取第一个语言版本
    //   return lyricsData.map((item: any) => {

    //     const [startTime, endTime, text] = item;
    //     return {
    //       startTime: timeToSec(startTime),
    //       endTime: timeToSec(endTime),
    //       text: text,
    //     }
    //   });
    // }
    if (type === 'cover') {
      return ["暂无歌词"];
    }
    return [music.lyrics]
  }, [currentMusic.lyrics]);

  // 播放音乐
  const handlePlayAudio = () => {
    if (!currentMusic.url) {
      show({ message: t('music.no_audio_available') });
      return;
    }

    // 停止当前播放的音频
    if (sound) {
      sound.stop();
      sound.release();
      setSound(null);
    }

    // 创建新的音频实例
    const newSound = new (Sound as any)(currentMusic.url, (error: any) => {
      if (error) {
        console.log('Failed to load audio:', error);
        show({ message: t('music.failed_to_load_audio') });
        setSound(null);
        return;
      }

      // 获取音频时长
      newSound.getDuration((durationInSeconds: number) => {
        setDuration(durationInSeconds);
      });

      // 开始播放
      newSound.play((success: boolean) => {
        if (success) {
          console.log('Audio played successfully');
        } else {
          console.log('Audio playback failed');
        }
        setIsPlaying(false);
        setCurrentTime(0);
        // 播放完成后释放音频实例
        newSound.release();
        setSound(null);
      });

      setIsPlaying(true);
    });

    setSound(newSound);
  };

  const fetchDuration = useCallback(async () => {
    console.log('开始获取音频时长，URI:', currentMusic.url);
    try {
      const durationTime = await AudioDurationManager.getDuration(currentMusic.url);
      console.log(durationTime, 'durationTime')
      setDuration(durationTime);
    } catch (error) {
      console.log(error, 'error')
    }
  }, [currentMusic.url]);

  useEffect(() => {
    fetchDuration();
  }, [fetchDuration]);

  // 播放/暂停
  const handlePlayPause = () => {
    // 如果没有音频实例或音频已播放完成，重新创建并播放
    if (!sound) {
      handlePlayAudio();
      return;
    }

    if (isPlaying) {
      sound.pause();
      setIsPlaying(false);
    } else {
      sound.play();
      setIsPlaying(true);
    }
  };

  // 监听播放进度
  useEffect(() => {
    if (isPlaying && sound && !isSliding) {
      progressInterval.current = setInterval(() => {
        sound.getCurrentTime((seconds) => {
          setCurrentTime(seconds);
        });
      }, 100);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, sound, isSliding]);

  // 获取当前高亮的歌词索引
  const getActiveLyricIndex = useCallback(() => {
    let activeIndex = 0;
    for (let i = 0; i < lyricArr.length; i++) {
      const lyric = lyricArr[i] || {};
      // 检查当前时间是否在歌词的时间范围内
      if (currentTime >= lyric.startTime && currentTime <= lyric.endTime) {
        activeIndex = i;
        break;
      }
      // 如果当前时间超过歌词开始时间，暂时设为当前行
      if (currentTime >= lyric.startTime) {
        activeIndex = i;
      }
    }
    return activeIndex;
  }, [currentTime, lyricArr]);

  // 自动滚动歌词
  useEffect(() => {
    if (lyricScrollRef.current && lyricArr.length > 0) {
      const activeIndex = getActiveLyricIndex();

      // 滚动到当前歌词行
      lyricScrollRef.current.scrollToIndex({
        index: Math.max(0, activeIndex - 1), // 提前1行显示
        animated: true,
        viewPosition: 0.3, // 在屏幕30%位置显示
      });
    }
  }, [currentTime, lyricArr, getActiveLyricIndex]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanupAudioData();
    };
  }, [cleanupAudioData]);

  // 页面失去焦点时清理音频数据
  useFocusEffect(
    useCallback(() => {
      // 页面获得焦点时的处理（如果需要的话）
      return () => {
        // 页面失去焦点时清理音频数据
        console.log('页面失去焦点，清理音频数据');
        cleanupAudioData();
      };
    }, [cleanupAudioData])
  );

  const handleDownload = async () => {
    setDownloading(true);
    setProgress(0);

    try {
      await downloader.downloadMusic(
        currentMusic.url,
        currentMusic.title || Date.now().toString(),
        {
          onProgress: (progress) => {
            setProgress(progress);
          },
          onComplete: (result) => {
            setDownloading(false);
            console.log('下载完成:', result.localPath);
            show({ message: t('music.download_success') });
          },
          onError: (error) => {
            setDownloading(false);
            console.log('下载失败:', error);
          }
        }
      );
    } catch (error) {
      setDownloading(false);
      console.error('下载出错:', error);
    }
  };

  //切换歌曲
  const handleSwitchMusic = (typeSwitch: string) => {

    if (type === 'cover') {
      return;
    }
    // 记录当前是否正在播放
    const wasPlaying = isPlaying;

    // 停止当前播放
    if (sound) {
      sound.stop();
      sound.release();
      setSound(null);
    }
    setIsPlaying(false);
    setCurrentTime(0);

    // 清除进度监听
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    // 切换歌曲
    if (typeSwitch === 'prev') {
      const index = songs.findIndex((item: any) => item.id === currentMusic.id);
      const newIndex = index - 1 < 0 ? songs.length - 1 : index - 1;
      setCurrentMusic(songs[newIndex]);
      console.log(songs[newIndex], 'songs[newIndex]')
    } else {
      const index = songs.findIndex((item: any) => item.id === currentMusic.id);
      const newIndex = index + 1 > songs.length - 1 ? 0 : index + 1;
      setCurrentMusic(songs[newIndex]);
    }

    // 如果之前正在播放，则自动播放新歌曲
    if (wasPlaying) {
      // 等待一下让新的音乐信息加载完成
      setTimeout(() => {
        handlePlayAudio();
      }, 100);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => {
            cleanupAudioData();
            if (type === 'cover') {
              // 重置导航栈，让 MyWork 成为新的根页面
              navigation.reset({
                index: 0,
                routes: [
                  { name: 'MyWork' }
                ]
              });
            } else {
              navigation.goBack();
            }
          }}
          style={styles.backBtn}
        >
          <Image source={img_music_back_btn} style={styles.backIconImg} />
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <ImageBackground source={require('@/assets/music/music_avatar_icon.png')} style={styles.avatarBox}>
          {currentMusic.cover && <Image source={{ uri: currentMusic.cover }} style={styles.avatar} />}
        </ImageBackground>
        <View style={styles.infoMain}>
          <View style={styles.infoHeaderRow}>
            <Text
              style={styles.name}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {currentMusic.title || '暂无'}
            </Text>
          </View>
        </View>
        <View style={styles.infoSideIcons}>
          {/* <TouchableOpacity onPress={handleSaveMusic}>
            <Image source={img_music_save} style={styles.infoIcon} />
          </TouchableOpacity> */}
          <TouchableOpacity onPress={() => setShowShareModal(true)}>
            <Image source={img_music_share} style={styles.infoIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.genersCard}>
        <View style={[styles.tagsContainer, { minHeight: isGenresExpanded ? normalize(30) : undefined }]}>
          {isGenresExpanded ? (
            // 展开状态：完整显示，不受宽度限制
            <Text
              style={[styles.tags, styles.tagsExpanded]}
              // 移除所有可能限制文本显示的属性
              allowFontScaling={true}
              adjustsFontSizeToFit={false}
            >
              {currentMusic?.genres?.join(", ")}
            </Text>
          ) : (
            // 折叠状态：单行显示，带省略号
            <Text
              style={[styles.tags, styles.tagsCollapsed]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {currentMusic?.genres?.join(", ")}
            </Text>
          )}

          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsGenresExpanded(!isGenresExpanded)}
            activeOpacity={0.7}
          >
            <Image source={isGenresExpanded ? require('@/assets/profile/points_dropup_icon.png') : require('@/assets/profile/points_dropdown_icon.png')} style={styles.expandButtonImg} />
          </TouchableOpacity>

        </View>
      </View>

      {/* 歌词 */}
      <View style={styles.lyricSection}>
        {/* <View style={styles.lyricHeader}>
          <Text style={styles.lyricTitle}>{t('music.lyrics')}</Text>
          <Text style={styles.lyricProgress}>
            {getActiveLyricIndex() + 1} / {lyricArr.length}
          </Text>
        </View> */}
        <FlatList
          style={styles.lyricScroll}
          data={lyricArr}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item, index }) => {
            const activeIndex = getActiveLyricIndex();
            const isActive = index === activeIndex;
            const isPast = index < activeIndex;

            return (
              <View style={styles.lyricItem}>
                <Text
                  style={[
                    styles.lyrics,
                    {
                      color: isActive ? "#3cff8f" : isPast ? "#666" : "#888",
                      fontWeight: isActive ? "bold" : "normal",
                      fontSize: isActive ? normalizeFontSize(18) : normalizeFontSize(16),
                      opacity: isActive ? 1 : isPast ? 0.7 : 0.5,
                      transform: [{ scale: isActive ? 1.05 : 1 }],
                    },
                  ]}
                >
                  {item}
                </Text>
                {/* {isActive && (
                  <Text style={styles.lyricTime}>
                    {secToTime(item.startTime)} - {secToTime(item.endTime)}
                  </Text>
                )} */}
              </View>
            );
          }}
          getItemLayout={(_, idx) => ({
            length: normalize(32),
            offset: normalize(32) * idx,
            index: idx,
          })}
          ref={lyricScrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.lyricContainer}
        />
      </View>

      {/* 播放进度条 */}
      <View style={styles.progressRow}>
        <Slider
          style={{ width: "100%", height: normalize(24) }}
          minimumValue={0}
          maximumValue={duration}
          value={currentTime}
          minimumTrackTintColor="#3cff8f"
          maximumTrackTintColor="#333"
          thumbTintColor="#3cff8f"
          onSlidingStart={() => setIsSliding(true)}
          onSlidingComplete={(value) => {
            if (sound) {
              sound.setCurrentTime(value);
            }
            setCurrentTime(value);
            setIsSliding(false);
          }}
          onValueChange={(value) => {
            if (isSliding) {
              setCurrentTime(value);
            }
          }}
          step={0.1} // 更精确的控制
        />
        <View style={styles.progressTimeRow}>
          <Text style={styles.progressTime}>{secToTime(Math.floor(currentTime))}</Text>
          <Text style={styles.progressTime}>{secToTime(Math.floor(duration))}</Text>
        </View>
      </View>

      {/* 播放控制 */}
      <View style={styles.controlRow}>
        <TouchableOpacity onPress={() => handleSwitchMusic('prev')}>
          <Image source={img_last_song} style={styles.controlImg} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPause}>
          <Image
            source={isPlaying ? img_pause_btn : img_play_btn}
            style={styles.playImg}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSwitchMusic('next')}>
          <Image source={img_next_song} style={styles.controlImg} />
        </TouchableOpacity>
      </View>
      {/* 分享弹窗 */}
      <Modal
        visible={showShareModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.blurMask} onPress={() => setShowShareModal(false)} />
          <View style={styles.bottomModal}>
            <Text style={styles.modalTitle}>
              {t('music.share')} {currentMusic.title || ''}
            </Text>
            <Text style={styles.shareLink}>{currentMusic.url}</Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleDownload}
              >
                <Text style={styles.cancelBtnText}>{t('music.download')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.okBtn}
                onPress={() => {
                  show({
                    message: t('music.link_copied'),
                  });
                  Clipboard.setString(currentMusic.url);
                  setShowShareModal(false)
                }}
              >
                <Text style={styles.copyBtnText}>{t('music.copy_link')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <FullScreenLoading visible={downloading} progress={progress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: normalize(32),
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: normalize(16),
    marginBottom: normalize(8),
  },
  backBtn: {
    width: normalize(36),
    height: normalize(36),
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    color: "#fff",
    fontSize: normalizeFontSize(28),
    fontWeight: "bold",
  },
  backIconImg: {
    width: normalize(28),
    height: normalize(28),
    // resizeMode: "contain",
  },
  infoCard: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: normalize(18),
    marginHorizontal: normalize(16),
    padding: normalize(16),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: normalize(12),
  },
  genersCard: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: normalize(18),
    marginHorizontal: normalize(16),
    padding: normalize(16),
    flexDirection: "row",
    alignItems: "flex-start",  // 改为flex-start，允许内容向上扩展
    marginBottom: normalize(18),
  },
  avatarBox: {
    width: normalize(100),
    height: normalize(100),
    borderRadius: normalize(50),
    justifyContent: "center",
    alignItems: "center",
    marginRight: normalize(14),
  },
  avatar: {
    width: normalize(50),
    height: normalize(50),
    borderRadius: normalize(25),
  },
  infoMain: {
    flex: 1,
    minWidth: 0, marginRight: normalize(10),
  },
  infoHeaderRow: {
    flexDirection: "column",
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    width: normalize(160),
    marginBottom: normalize(2),
    marginTop: normalize(10),
  },
  name: {
    color: "#fff",
    fontSize: normalizeFontSize(22),
    fontWeight: "700",
    marginRight: normalize(8),
    flexShrink: 1,
    minWidth: 0,
  },
  nameIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: normalize(4),
    gap: 0,
  },
  tags: {
    color: theme.textSecondary,
    fontSize: normalizeFontSize(12),
    marginBottom: 0,
    flexShrink: 0,  // 改为0，防止文本被收缩
    minWidth: 0,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',  // 改为flex-start，允许内容向上对齐
    justifyContent: 'space-between',
    paddingRight: normalize(40),
    width: '100%',
    position: 'relative',  // 添加相对定位
    // minHeight: normalize(40),  // 设置最小高度
  },
  tagsCollapsed: {
    flex: 1,
    flexShrink: 1,  // 折叠时才收缩
  },
  tagsExpanded: {
    flex: 1,
    flexShrink: 0,  // 展开时不收缩
    flexWrap: 'wrap',  // 允许换行
    alignSelf: 'flex-start',  // 从左边开始对齐
    width: '100%',  // 确保占满容器宽度
    maxWidth: '100%',  // 最大宽度限制
    paddingRight: normalize(50),  // 为展开按钮留出空间
    lineHeight: normalize(18),  // 设置行高
  },
  expandButton: {
    position: 'absolute',
    right: normalize(0),
    top: normalize(0),
    zIndex: 1,  // 确保按钮在最上层
    backgroundColor: theme.backgroundSecondary,  // 添加背景色，防止文本穿透
    padding: normalize(4),  // 添加内边距
  },
  expandButtonImg: {
    width: normalize(20),
    height: normalize(20),
  },
  expandButtonText: {
    color: theme.primary,
    fontSize: normalizeFontSize(10),
    fontWeight: '500',
  },
  infoSideIcons: {
    position: "absolute",
    bottom: normalize(16),
    right: normalize(16),
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginLeft: normalize(8),
    gap: normalize(8),
  },
  infoIcon: {
    width: normalize(24),
    height: normalize(24),
    marginVertical: normalize(2),
    marginHorizontal: normalize(2),
    resizeMode: "contain",
  },
  iconBtn: {
    color: "#fff",
    fontSize: normalizeFontSize(18),
    marginHorizontal: normalize(4),
  },
  iconImg: {
    width: normalize(22),
    height: normalize(22),
    marginHorizontal: normalize(4),
    resizeMode: "contain",
  },
  lyricSection: {
    marginHorizontal: normalize(16),
    marginBottom: normalize(12),
    flex: 1,
  },
  lyricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalize(8),
  },
  lyricTitle: {
    color: "#fff",
    fontSize: normalizeFontSize(18),
    fontWeight: "bold",
  },
  lyricProgress: {
    color: "#888",
    fontSize: normalizeFontSize(14),
  },
  lyricScroll: {
    flex: 1,
    marginHorizontal: normalize(16),
    marginBottom: normalize(12),
  },
  lyricContainer: {
    paddingBottom: normalize(100), // 确保歌词列表底部有足够的空间
  },
  lyricItem: {
    paddingVertical: normalize(4),
  },
  lyrics: {
    color: "#fff",
    fontSize: normalizeFontSize(16),
    textAlign: "center",
    lineHeight: normalize(24),
  },
  lyricTime: {
    color: "#888",
    fontSize: normalizeFontSize(12),
    marginTop: normalize(4),
    textAlign: "center",
  },
  progressRow: {
    marginHorizontal: normalize(16),
    marginBottom: normalize(8),
  },
  progressBarBg: {
    height: normalize(6),
    backgroundColor: "#333",
    borderRadius: normalize(3),
    width: "100%",
    marginBottom: normalize(2),
  },
  progressBar: {
    height: normalize(6),
    backgroundColor: "#3cff8f",
    borderRadius: normalize(3),
    position: "absolute",
    left: 0,
    top: 0,
  },
  progressTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressTime: {
    color: "#fff",
    fontSize: normalizeFontSize(13),
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: normalize(18),
    columnGap: normalize(40),
    // gap: 40, // 若项目支持 gap 可启用
  },
  controlBtn: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: normalize(18),
  },
  // playBtn: {
  //   backgroundColor: '#3cff8f',
  // },
  playIcon: {
    color: "#111",
    fontSize: normalizeFontSize(28),
    fontWeight: "bold",
  },
  playImg: {
    width: normalize(48),
    height: normalize(48),
    resizeMode: "contain",
  },
  controlIcon: {
    color: "#fff",
    fontSize: normalizeFontSize(24),
  },
  controlImg: {
    width: normalize(48),
    height: normalize(48),
    // resizeMode: 'contain',
  },
  // ----------- modal styles below -----------
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  blurMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bottomModal: {
    backgroundColor: "#222",
    borderTopLeftRadius: normalize(18),
    borderTopRightRadius: normalize(18),
    paddingTop: normalize(24),
    paddingBottom: normalize(32),
    paddingHorizontal: normalize(24),
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontSize: normalizeFontSize(18),
    fontWeight: "bold",
    marginBottom: normalize(24),
  },
  modalBtnRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginTop: normalize(8),
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#222",
    borderRadius: normalize(12),
    borderWidth: 1,
    marginRight: normalize(8),
    paddingVertical: normalize(12),
    alignItems: "center",
  },
  okBtn: {
    flex: 1,
    marginLeft: normalize(8),
    alignItems: "center",
    backgroundColor: theme.primary,
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(32),
    marginTop: 0,
  },
  cancelBtnText: {
    color: "#fff",
    fontSize: normalizeFontSize(16),
    fontWeight: "500",
    textAlign: 'center'
  },
  okBtnText: {
    color: "#111",
    fontSize: normalizeFontSize(16),
    fontWeight: "500",
  },
  shareLink: {
    color: "#fff",
    fontSize: normalizeFontSize(16),
    marginBottom: normalize(24),
    textAlign: "center",
  },
  copyBtn: {
    backgroundColor: theme.primary,
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(32),
    alignItems: "center",
    marginTop: 0,
    width: "100%",
  },
  copyBtnText: {
    color: '#111',
    fontSize: normalizeFontSize(18),
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default MusicPlayScreen;
