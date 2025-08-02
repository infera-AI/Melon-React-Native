import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  TextInput,
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import Slider from "@react-native-community/slider";
import Clipboard from "@react-native-clipboard/clipboard";
import { saveMusicWork } from "@/api/music";
import Sound from "react-native-sound";
import { useMessageModal } from "@/contexts/MessageModalContext";
import { AudioDurationManager } from '@/utils/AudioPlayerController';
import theme from "@/utils/theme";
import { deleteMusicWork, getMusicWorkInfo, modifyMusicTitle } from "@/api/music/music";
import { useLanguage } from '@/contexts/LanguageContext';

type Music = {
  id: number;
  url: string;
  cover: string;
  title: string;
  lyrics: string;
  genres: string[];
}

// 控制按钮图片资源
const img_last_song = require("../../../../assets/images/last_song.png");
const img_next_song = require("../../../../assets/images/next_song.png");
const img_play_btn = require("../../../../assets/images/music_play.png");
const img_pause_btn = require("../../../../assets/images/music_pause.png");
const img_music_share = require("../../../../assets/images/music_share.png");
const img_music_back_btn = require("../../../../assets/images/music_back_btn.png");
const img_music_edit = require("@/assets/music/music_edit_icon.png");
const img_music_delete = require("@/assets/music/music_delete_icon.png");
const img_music_save = require("@/assets/music/music_reload_icon.png");

const { width } = Dimensions.get("window");

// normalize函数
const normalize = (size: number) => {
  const scale = width / 375;
  return Math.round(size * scale);
};

// normalizeFontSize函数
const normalizeFontSize = (size: number) => {
  const scale = width / 375;
  return Math.min(Math.round(size * scale), size);
};

const MyWorkMusicPlay = ({ navigation, route }: any) => {
  const { music={} } = route.params;
  const [sound, setSound] = useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const { show } = useMessageModal();
  const lyricScrollRef = useRef<FlatList<any>>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [musicInfo, setMusicInfo] = useState<Music>({} as Music);
  const { t } = useLanguage();

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
  // 编辑歌曲名弹窗
  const [showEditModal, setShowEditModal] = useState(false);
  // 编辑歌曲名输入
  const [editTitle, setEditTitle] = useState('');

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
    if (musicInfo.lyrics && Array.isArray(musicInfo.lyrics)) {
      const lyricsData = musicInfo.lyrics; // 取第一个语言版本
      return lyricsData.map((item: any) => {

        const [startTime, endTime, text] = item;
          return {
            startTime: timeToSec(startTime),
            endTime: timeToSec(endTime),
            text: text,
          }
      });
    }
    return []
  }, [musicInfo.lyrics]);

  // 播放音乐
  const handlePlayAudio = () => {
    if (!musicInfo.url) {
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
    const newSound = new (Sound as any)(musicInfo.url, (error: any) => {
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
    console.log('开始获取音频时长，URI:', musicInfo.url);
    try {
      const durationTime = await AudioDurationManager.getDuration(musicInfo.url);
      console.log(durationTime,'durationTime')
      setDuration(durationTime);
    } catch (error) {
      console.log(error,'error')
    }
  }, [musicInfo.url]);

  // 播放/暂停
  const handlePlayPause = () => {
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
      const lyric = lyricArr[i];
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

  useEffect(() => {
    fetchDuration();
  }, []);

 
  // 编辑歌曲名
  const handleEditTitle = async () => {
    if (!editTitle.trim()) {
      show({ message: t('music.please_enter_song_name') });
      return;
    }
    try {
      const res = await modifyMusicTitle({
        work_id: music.id,
        work_title: editTitle,
      })
      show({ message: t('music.modify_success') });
      setShowEditModal(false);
      setEditTitle('');
      handleRefreshMusicInfo();
    } catch (error) {
      show({ message: t('music.modify_failed') });
    }
  };

  const handleRefreshMusicInfo = async () => {
    await getMusicWorkInfoRequest();
  }

  // 删除歌曲
  const handleDeleteMusic = async () => {
    try {
      const res = await deleteMusicWork({work_ids: [music.id]})
      show({ message: t('music.delete_success') });
      setShowDeleteModal(false);
      navigation.goBack();
    } catch (error) {
      show({ message: t('music.delete_failed') });
    }
  };
  // 获取作品信息
  const getMusicWorkInfoRequest = async () => {
    try {
    const res = await getMusicWorkInfo({work_id: music.id})
    console.log(res,'res');
    const info ={
      id: res.work_id,
      title: res.work_title,
      url: res.work_url,
      lyrics: res.work_lyrics,
      genres: res.work_genres,
      cover: res.work_cover,
    }
    setMusicInfo(info);
    } catch (error) {
      console.log(error);
    }
  }

 

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

  // 自动滚动歌词
  useEffect(() => {
    if (lyricScrollRef.current && lyricArr.length > 0) {
      // 找到当前应该高亮的歌词行
      let activeIndex = 0;
      for (let i = 0; i < lyricArr.length; i++) {
        if (currentTime >= lyricArr[i].startTime) {
          activeIndex = i;
        }
      }

      // 滚动到当前歌词行
      lyricScrollRef.current.scrollToIndex({
        index: Math.max(0, activeIndex - 2), // 提前2行显示
        animated: true,
        viewPosition: 0.3, // 在屏幕30%位置显示
      });
    }
  }, [currentTime, lyricArr]);

  useEffect(() => { 
    getMusicWorkInfoRequest();
  }, [musicInfo.id]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => {
            cleanupAudioData();
            navigation.goBack();
          }}
          style={styles.backBtn}
        >
          <Image source={img_music_back_btn} style={styles.backIconImg} />
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.avatarBox}>
          <Image source={{ uri: musicInfo.cover }} style={styles.avatar} />
        </View>
        <View style={styles.infoMain}>
          <View style={styles.infoHeaderRow}>
            <Text
              style={styles.name}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {musicInfo.title}
            </Text>
            <Text
              style={styles.tags}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {musicInfo.genres?.join(", ")}
            </Text>
          </View>
         <View style={styles.infoHeaderRowRight}>
          <TouchableOpacity onPress={() => {
            setEditTitle(musicInfo.title || '');
            setShowEditModal(true);
          }}>
            <Image source={img_music_edit} style={styles.infoIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
            <Image source={img_music_delete} style={styles.infoIcon} />
          </TouchableOpacity>
        </View>
        </View>
        <View style={styles.infoSideIcons}>
          <TouchableOpacity onPress={()=>{}}>
            <Image source={img_music_save} style={styles.infoIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowShareModal(true)}>
            <Image source={img_music_share} style={styles.infoIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 歌词 */}
      <View style={styles.lyricSection}>
        <View style={styles.lyricHeader}>
          <Text style={styles.lyricTitle}>{t('music.lyrics')}</Text>
          <Text style={styles.lyricProgress}>
            {getActiveLyricIndex() + 1} / {lyricArr.length}
          </Text>
        </View>
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
                  {item.text}
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
        <TouchableOpacity>
          <Image source={img_last_song} style={styles.controlImg} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPause}>
          <Image
            source={isPlaying ? img_pause_btn : img_play_btn}
            style={styles.playImg}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={img_next_song} style={styles.controlImg} />
        </TouchableOpacity>
      </View>

      {/* 删除弹窗已移至下方 */}

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
              Share {musicInfo.title}
            </Text>
            <Text style={styles.shareLink}>{musicInfo.url}</Text>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => {
                show({
                  title: t('music.copy_success'),
                  message: t('music.link_copied'),
                });
                Clipboard.setString(musicInfo.url);
                setShowShareModal(false)
              }}
            >
              <Text style={styles.copyBtnText}>{t('music.copy_link')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 编辑歌曲名弹窗 */}
      <Modal
        visible={showEditModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.blurMask} onPress={() => setShowEditModal(false)} />
          <View style={[styles.bottomModal,styles.bottomModalTitle]}>
            <Text style={styles.modalTitle}>
              {t('music.edit')}
            </Text>
            <TextInput
              style={styles.editInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder={t('music.enter_new_title')}
              placeholderTextColor="#888"
              autoFocus
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelBtnText}>{t('music.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.okBtn}
                onPress={handleEditTitle}
              >
                <Text style={styles.okBtnText}>{t('music.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 删除歌曲弹窗 */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.blurMask} onPress={() => setShowDeleteModal(false)} />
          <View style={styles.bottomModal}>
            <Text style={styles.modalTitle}>{t('music.delete')} {musicInfo.title}</Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelBtnText}>{t('music.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={handleDeleteMusic}
              >
                <Text style={styles.okBtnText}>{t('music.ok')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
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
    backgroundColor: "#191919",
    borderRadius: normalize(18),
    marginHorizontal: normalize(16),
    padding: normalize(16),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: normalize(18),
  },
  avatarBox: {
    width: normalize(72),
    height: normalize(72),
    borderRadius: normalize(16),
    backgroundColor: "#FFE89D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: normalize(14),
  },
  avatar: {
    width: normalize(72),
    height: normalize(72),
    borderRadius: normalize(12),
    backgroundColor: "#FFE89D",
  },
  infoMain: {
    flex: 1,
    height: normalize(72),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    minWidth: 0,  
  },
  infoHeaderRow: {
    flexDirection: "column",
    flex:1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginBottom: normalize(2),
  },
  infoHeaderRowRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: normalize(8),
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
    color: "#bdbdbd",
    fontSize: normalizeFontSize(15),
    marginTop: normalize(2),
    marginBottom: 0,
    flexShrink: 1,
    minWidth: 0,
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
    flex:1
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
    height: normalize(197),
    backgroundColor: "#222",
    borderTopLeftRadius: normalize(18),
    borderTopRightRadius: normalize(18),
    paddingTop: normalize(24),
    paddingBottom: normalize(32),
    paddingHorizontal: normalize(24),
    alignItems: "center",
    justifyContent: "center",
  },
  bottomModalTitle: {
    height: normalize(197),
    justifyContent: "flex-start",
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
    position: "absolute",
    bottom: normalize(32),
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#222",
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: "#444",
    marginRight: normalize(8),
    paddingVertical: normalize(12),
    alignItems: "center",
  },
  okBtn: {
    flex: 1,
    backgroundColor: theme.primary,
    borderRadius: normalize(12),
    marginLeft: normalize(8),
    paddingVertical: normalize(12),
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#fff",
    fontSize: normalizeFontSize(16),
    fontWeight: "bold",
  },
  okBtnText: {
    color: "#111",
    fontSize: normalizeFontSize(16),
    fontWeight: "bold",
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
    position: "absolute",
    bottom: normalize(32),
  },
  copyBtnText: {
    color: "#111",
    fontSize: normalizeFontSize(18),
    fontWeight: "bold",
    textAlign: "center",
  },
  editInput: {
    width: "100%",
    height: normalize(48),
    backgroundColor: "#333",
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    color: "#fff",
    fontSize: normalizeFontSize(16),
    marginBottom: normalize(24),
  },
  deleteWarning: {
    color: "#bdbdbd",
    fontSize: normalizeFontSize(14),
    textAlign: "center",
    marginBottom: normalize(24),
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: theme.primary,
    borderRadius: normalize(12),
    marginLeft: normalize(8),
    paddingVertical: normalize(12),
    alignItems: "center",
  },
  deleteBtnText: {
    color: "#fff",
    fontSize: normalizeFontSize(16),
    fontWeight: "bold",
  },
});

export default MyWorkMusicPlay;
