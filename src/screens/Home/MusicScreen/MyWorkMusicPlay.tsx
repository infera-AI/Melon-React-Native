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
  ScrollView,
  ImageBackground,
  Platform,
  PermissionsAndroid,
  NativeModules
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import Sound from "react-native-sound";
import { useMessageModal } from "@/contexts/MessageModalContext";
import { AudioDurationManager } from '@/utils/AudioPlayerUtils';
import { deleteMusicWork, getMusicWorkInfo, renameMusic, deleteMusic, getShareLink } from "@/api/music/music";
import { useLanguage } from '@/contexts/LanguageContext';
import Slider from "@react-native-community/slider";
import Clipboard from "@react-native-clipboard/clipboard";
import theme from "@/utils/theme";
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import { MusicDownloader } from '@/utils/MusicDownloader';
import FullScreenLoading from "@/components/FullScreenLoader";
import { useMusicStore } from '@/store/modules/music.store';

import RNFS from 'react-native-fs';
import Share from 'react-native-share';

type Music = {
  id: number;
  url: string;
  cover: string;
  title: string;
  lyrics: string;
  genres: string[];
  music_url: string;
  type: number;
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
const img_music_save = require("@/assets/music/music_cover_icon.png");

const { width } = Dimensions.get("window");

const MyWorkMusicPlay = ({ navigation, route }: any) => {
  const { music = {}, songList = [], myWorkIds = [] } = route.params || {};
  const [sound, setSound] = useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const { show } = useMessageModal();
  const lyricScrollRef = useRef<FlatList<any>>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [musicInfo, setMusicInfo] = useState<Music>(music as Music);
  const [currentMusicIndex, setCurrentMusicIndex] = useState(myWorkIds.indexOf(music.id));
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const downloader = MusicDownloader.getInstance();
  const [isGenresExpanded, setIsGenresExpanded] = useState(false);
  const shareLink = useRef('');



  // 防抖状态
  const [isSwitching, setIsSwitching] = useState(false);

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

  const { setGenerateMusicType, setMusicGenerateInfo } = useMusicStore.getState();

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

    console.log('开始播放音乐:', musicInfo.title, 'URL:', musicInfo.url);

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
        // 播放完成后重置状态
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
    if (!musicInfo.url) {
      console.log('musicInfo.url 为空，跳过获取时长');
      return;
    }
    console.log('开始获取音频时长，URI:', musicInfo.url);
    try {
      const durationTime = await AudioDurationManager.getDuration(musicInfo.url);
      console.log('获取到的时长:', durationTime, '秒');
      setDuration(durationTime);
    } catch (error) {
      console.log('获取音频时长失败:', error);
    }
  }, [musicInfo.url]);

  // 当musicInfo更新时获取时长
  useEffect(() => {
    if (musicInfo.url) {
      fetchDuration();
    }
  }, [musicInfo.url, fetchDuration]);

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

          // 检查是否播放完成
          if (seconds >= duration && duration > 0) {
            console.log('检测到播放完成，重置状态');
            setIsPlaying(false);
            setCurrentTime(0);
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
            }
          }
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
  }, [isPlaying, sound, isSliding, duration]);

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


  // 编辑歌曲名
  const handleEditTitle = async () => {
    if (!editTitle.trim()) {
      show({ message: t('music.please_enter_song_name') });
      return;
    }
    console.log(music, 'music.id', editTitle, 'editTitle');
    try {
      await renameMusic({
        id: music.id,
        name: editTitle,
      })
      show({ message: t('music.modify_success') });
      setMusicInfo({ ...musicInfo, title: editTitle });
      setShowEditModal(false);
      setEditTitle('');
    } catch (error) {
      show({ message: t('music.modify_failed') });
    }
  };

  // 切换歌曲
  const handleSwitchMusic = async (type: string) => {
    // 防抖：如果正在切换中，则忽略此次点击
    if (isSwitching) {
      console.log('正在切换歌曲中，忽略此次点击');
      return;
    }

    console.log(currentMusicIndex, 'currentMusicIndex', myWorkIds);

    // 设置切换状态
    setIsSwitching(true);

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

    // 计算新的索引
    let newIndex = currentMusicIndex;
    if (type === 'next') {
      if (currentMusicIndex === myWorkIds.length - 1) {
        newIndex = 0;
      } else {
        newIndex = currentMusicIndex + 1;
      }
    } else {
      if (currentMusicIndex === 0) {
        newIndex = myWorkIds.length - 1;
      } else {
        newIndex = currentMusicIndex - 1;
      }
    }

    // 先更新索引，确保状态同步
    setCurrentMusicIndex(newIndex);

    // 获取新的音乐信息
    try {
      const newMusicInfo = await getMusicWorkInfoRequest(myWorkIds[newIndex]);

      // 如果之前正在播放，则自动播放新歌曲
      if (wasPlaying && newMusicInfo) {
        // 等待一下让新的音乐信息加载完成
        setTimeout(() => {
          // 再次检查当前索引是否还是我们期望的索引
          if (currentMusicIndex === newIndex && musicInfo.id === newMusicInfo.id) {
            console.log('确认播放正确的音乐:', newMusicInfo.title);
            handlePlayAudio();
          } else {
            console.log('音乐信息不匹配，跳过播放');
          }
          // 重置切换状态
          setIsSwitching(false);
        }, 200);
      } else {
        // 如果没有自动播放，也要重置切换状态
        setIsSwitching(false);
      }
    } catch (error) {
      console.log('获取音乐信息失败:', error);
      setIsSwitching(false);
    }
  }

  // 获取分享链接
  const handleGetShareLink = async () => {
    try {
      const res = await getShareLink({ id: musicInfo.id });
      console.log(res, 'res');
      shareLink.current = res.share_url;
    } catch (error) {
      console.log(error);
    }
  }

  // 删除歌曲
  const handleDeleteMusic = async () => {
    try {
      await deleteMusic({ id_list: [music.id] })
      show({ message: t('music.delete_success') });
      setShowDeleteModal(false);
      navigation.goBack();
    } catch (error) {
      show({ message: t('music.delete_failed') });
    }
  };

  const getMusicWorkInfoRequest = useCallback(async (id?: number) => {
    const info = songList.find((item: any) => item.id === id);
    setMusicInfo({ ...info });
    return info;
  }, [songList]);

  /**
   * 请求 Android 存储权限
   */
  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: t('translate_screen.audio_permission_title'),
          message: t('translate_screen.audio_permission_desc'),
          buttonNeutral: t('translate_screen.audio_permission_btn1'),
          buttonNegative: t('translate_screen.document_cancel'),
          buttonPositive: t('translate_screen.camera_permission_ok'),
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('权限请求失败:', err);
      return false;
    }
  };

  const downloadToDownloads = async (url: string, name: string) => {
    const { FileSaver } = NativeModules;

    try {
      const savedPath = await FileSaver.saveFileToDownloadsUsingMediaStore(url, name);
      console.log('下载成功', `文件已保存到：\nDownload`);
      setDownloading(false);
      show({
        message: `${t('translate_screen.download_file_success')}: /Download`
      })
    } catch (e: any) {
      setDownloading(false);
      console.log('下载失败', e.message || '未知错误');
      show({
        message: t('translate_screen.download_file_error')
      })
    }
  };

  const handleDownload = async () => {
    // console.log('musicInfo.url---', musicInfo.url);
    // console.log('musicInfo.title---', musicInfo.title);
    setShowShareModal(false)
    if (Platform.OS === 'android') {
      const isPermission = requestStoragePermission()
      if (!isPermission) {
        console.log('无权限');
        return
      }
      setDownloading(true);
      downloadToDownloads(musicInfo.url, `${musicInfo.title}.${musicInfo.url.split(/\.(?=[^\.]+$)/)[1]}`)
      return
    }

    // ios保存文件代码
    setDownloading(true);
    // 获取存储路径
    let localFilePath = `${RNFS.DocumentDirectoryPath}/${musicInfo.title}.${musicInfo.url.split(/\.(?=[^\.]+$)/)[1]}`;
    const options = {
      fromUrl: musicInfo.url, // 网络文件地址
      toFile: localFilePath, // 本地保存路径
    };

    try {
      const result = await RNFS.downloadFile(options).promise;

      if (result.statusCode === 200) {
        console.log('下载成功:', localFilePath);
        shareFile(localFilePath)
        return localFilePath;
      } else {
        console.warn('下载失败，状态码:', result.statusCode);
        return null;
      }
    } catch (err) {
      console.error('下载失败:', err);
      return null;
    }



    // setDownloading(true);
    // setProgress(0);

    // try {
    //   await downloader.downloadMusic(
    //     musicInfo.url,
    //     musicInfo.title,
    //     {
    //       onProgress: (progress) => {
    //         setProgress(progress);
    //       },
    //       onComplete: (result) => {
    //         setDownloading(false);
    //         console.log('下载完成:', result.localPath);
    //         show({ message: t('music.download_success') });
    //       },
    //       onError: (error) => {
    //         setDownloading(false);
    //         console.log('下载失败:', error);
    //       }
    //     }
    //   );
    // } catch (error) {
    //   setDownloading(false);
    //   console.error('下载出错:', error);
    // }
  };

  const shareFile = async (filePath: string) => {

    try {
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        console.warn('文件不存在，无法分享');
        setDownloading(false);
        return;
      }

      // 2. 提取文件扩展名，确定具体MIME类型
      const fileExt = filePath.split('.').pop()?.toLowerCase();
      let mimeType = 'audio/*';
      if (fileExt === 'mp3') mimeType = 'audio/mpeg';
      if (fileExt === 'wav') mimeType = 'audio/wav';
      if (fileExt === 'flac') mimeType = 'audio/flac';
      if (fileExt === 'aac') mimeType = 'audio/aac';

      // 3. 直接使用Documents目录的文件路径分享（无需复制到Caches）
      const shareUrl = `file://${filePath}`;
      console.log('准备分享路径:', shareUrl);
      // setDownloading(false);

      // 4. 执行分享（使用具体MIME类型）
      const res = await Share.open({
        url: shareUrl,
        type: mimeType, // 精确的MIME类型
        showAppsToView: true,
        title: '分享音频文件', // 增加标题参数提升兼容性
      });

      console.log('分享结果:', res);
      setDownloading(false);
      if (res?.success) {
        show({
          message: t('translate_screen.save_file_success')
        });
      }
    } catch (error) {
      console.error('分享失败:', error);
      setDownloading(false);
    }
  };

  const handleCoverMusic = () => {
    setGenerateMusicType('cover');
    setMusicGenerateInfo({
      title: musicInfo.title,
      lyrics: musicInfo.lyrics,
      musicStyles: musicInfo.genres,
    });
    console.log(musicInfo, 'musicInfo.type');
    // 类型：0生成，1翻唱，2生成+翻唱，3手动上传
    if (musicInfo.type === 0 || musicInfo.type === 2) {
      navigation.navigate('SingerSelection', { type: 'generate' });
    } else {
      navigation.navigate('CoverUpload', { musicInfo });
    }
  }

  useEffect(() => {
    if (music.id) {
      getMusicWorkInfoRequest(music.id);
      handleGetShareLink();
    }
  }, [music.id, getMusicWorkInfoRequest]);

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
        <ImageBackground source={require('@/assets/music/music_avatar_icon.png')} style={styles.avatarBox}>
          <Image source={{ uri: musicInfo.cover }} style={styles.avatar} />
        </ImageBackground>
        <View style={styles.infoMain}>
          <View style={styles.infoHeaderRow}>
            <Text
              style={styles.name}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {musicInfo.title || '暂无'}
            </Text>
          </View>
          <View style={styles.infoHeaderRowRight}>
            <TouchableOpacity onPress={() => {
              setEditTitle(musicInfo.title || '');
              setShowEditModal(true);
            }}>
              <Image source={img_music_edit} style={styles.infoIcon} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.infoSideIcons}>
          <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
            <Image source={img_music_delete} style={styles.infoIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCoverMusic}>
            <Image source={img_music_save} style={styles.infoIcon} />
          </TouchableOpacity>
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
              {musicInfo.genres?.join(", ")}
            </Text>
          ) : (
            // 折叠状态：单行显示，带省略号
            <Text
              style={[styles.tags, styles.tagsCollapsed]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {musicInfo.genres?.join(", ")}
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
        {/* <FlatList
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
                      fontWeight: isActive ? "500" : "normal",
                      fontSize: isActive ? normalizeFontSize(18) : normalizeFontSize(16),
                      opacity: isActive ? 1 : isPast ? 0.7 : 0.5,
                      transform: [{ scale: isActive ? 1.05 : 1 }],
                    },
                  ]}
                >
                  {item.text}
                </Text>
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
        /> */}
        <ScrollView style={styles.lyricSection}>
          <Text style={styles.lyrics}>{musicInfo.lyrics}</Text>
        </ScrollView>
      </View>

      {/* 播放进度条 */}
      <View style={styles.progressRow}>
        <Slider
          style={{ width: "100%", height: normalize(40) }}
          minimumValue={0}
          maximumValue={duration || 1}
          value={currentTime}
          minimumTrackTintColor="#3cff8f"
          maximumTrackTintColor="#333"
          thumbTintColor="#3cff8f"
          onSlidingStart={() => {
            console.log('开始拖动进度条');
            setIsSliding(true);
          }}
          onSlidingComplete={(value) => {
            console.log('完成拖动进度条，值:', value);
            if (sound) {
              sound.setCurrentTime(value);
            }
            setCurrentTime(value);
            setIsSliding(false);
          }}
          onValueChange={(value) => {
            console.log('进度条值变化:', value);
            setCurrentTime(value);
          }}
          step={0.1}
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
            <Text style={styles.modalTitle} numberOfLines={1} ellipsizeMode="tail">
              {t('music.share_music_title').replace('{title}', musicInfo.title)}
            </Text>
            <Text style={styles.shareLink} numberOfLines={1} ellipsizeMode="tail">{musicInfo.url}</Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, styles.shareBtn]}
                onPress={handleDownload}
              >
                <Text style={styles.cancelBtnText}>{t('music.download')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.okBtn}
                onPress={() => {
                  show({
                    title: t('music.copy_success'),
                    message: t('music.link_copied'),
                  });
                  Clipboard.setString(shareLink.current);
                  setShowShareModal(false)
                }}
              >
                <Text style={styles.copyBtnText}>{t('music.copy_link')}</Text>
              </TouchableOpacity>
            </View>

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
          <View style={[styles.bottomModal, styles.bottomModalTitle]}>
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
      <FullScreenLoading
        visible={downloading}
        text={t('translate_screen.loading_text')}
      />
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
    fontWeight: "500",
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
    alignItems: "center",
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
    height: normalize(72),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    minWidth: 0,
  },
  infoHeaderRow: {
    flexDirection: "column",
    flex: 1,
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
    width: normalize(160),
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
    flexShrink: 1,
    minWidth: 0,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: normalize(40),
    width: '100%',
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
  tagsCollapsed: {
    flex: 1,
  },
  expandButton: {
    position: 'absolute',
    right: normalize(0),
    top: normalize(0),
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
    flex: 1
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
    fontWeight: "500",
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
    fontWeight: "500",
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
    fontWeight: "500",
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
  shareBtn: {
    borderColor: theme.primary,
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
    textAlign: "center",
    marginBottom: normalize(55)
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
    fontWeight: "500",
    textAlign: "center",
  },
  editInput: {
    width: normalize(259),
    height: normalize(38),
    backgroundColor: theme.background,
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    color: "#fff",
    fontSize: normalizeFontSize(16),
    bottom: normalize(5)
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
    fontWeight: "500",
  },
  debugText: {
    color: "#fff",
    fontSize: normalizeFontSize(12),
    marginBottom: normalize(8),
    textAlign: "center",
  },
  debugBtn: {
    backgroundColor: "#444",
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(32),
    alignItems: "center",
    marginTop: normalize(16),
    width: "100%",
  },
  debugBtnText: {
    color: "#fff",
    fontSize: normalizeFontSize(16),
    fontWeight: "500",
  },
});

export default MyWorkMusicPlay;
