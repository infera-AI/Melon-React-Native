import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getPersonalWorks,
  uploadAudioFile,
  saveMusicByLink
} from '@/api/music/music';
import { AudioPlayer } from '@/utils/audioUtils';
import Sound from "react-native-sound";
import { useMessageModal } from '@/contexts/MessageModalContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatTime } from '@/utils/helpers';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import theme from '@/utils/theme';
import { pick } from '@react-native-documents/picker';
import FullScreenLoader from '@/components/FullScreenLoader';

interface Music {
  id: number;
  music_url: string;
  url: string;
  cover: string;
  title: string;
  lyrics: string;
  taskId: string;
  duration: number;
  genres: string[];
  playing: boolean;
  type: string;
}

const iosTypes = [
  'public.mp3',
  'com.microsoft.waveform-audio',
  'public.wav',
  'public.mpeg-4-audio',
];

const androidTypes = [
  'audio/mpeg',    // mp3
  'audio/wav', // wav 常用简化版	
  'audio/vnd.wave', // wav 官方标准    
  'audio/x-wav',   // wav 历史兼容版
  'audio/mp4',     // m4a
  'audio/x-m4a',   // m4a 另一种写法
]

const fileTypes = Platform.select({
  ios: iosTypes,
  android: androidTypes,
});


const MyWorkScreen = ({ navigation }: any) => {
  const [filteredWorks, setFilteredWorks] = useState<Music[]>([]);
  const [searchText, setSearchText] = useState('');

  const searchTextRef = useRef('');

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [sound, setSound] = useState<Sound | null>(null);
  const audioPlayerRef = useRef<AudioPlayer>(null);
  const [isPlayMusic, setIsPlayMusic] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // 添加处理状态

  const [loading, setLoading] = useState(false)

  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRequestList, setIsRequestList] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pageSize = 10; // 每页数据量

  // 新增临时标记：标记是否需要执行查询
  const [shouldFetch, setShouldFetch] = useState(false);

  // 标记页面是否已完成首次挂载
  const isMounted = useRef(false);

  const totalDataCount = useRef(0); // 总数据量

  const { show } = useMessageModal();
  const { t } = useLanguage();

  // 清理音频相关数据
  const cleanupAudioData = React.useCallback(() => {
    try {
      // 停止音频播放
      if (sound) {
        sound.stop();
        sound.release();
        setSound(null);
      }

      // 重置播放状态
      setIsPlaying(false);
      setIsPlayMusic('');
      console.log('音频数据清理完成');
    } catch (error) {
      console.error('清理音频数据失败:', error);
    }
  }, [sound]);

  // 获取作品
  const getMyWorks = async (page: number = 1, isLoadMore: boolean = false) => {
    setIsRequestList(true);
    try {
      const response = await getPersonalWorks({
        page_num: page,
        page_size: pageSize,
        title: searchTextRef.current
      });

      const newWorks = transformMyWorks(response.data_list || []);
      totalDataCount.current = response.total_count || 0; // 总数据量
      const loadedCount = isLoadMore ? filteredWorks.length + newWorks.length : newWorks.length; // 已加载数据量

      if (isLoadMore) {
        // 加载更多时追加数据
        setFilteredWorks(prevWorks => [...prevWorks, ...newWorks]);
      } else {
        // 首次加载或搜索时替换数据
        setFilteredWorks(newWorks);
      }

      // 检查是否还有更多数据
      // setHasMoreData(newWorks.length === pageSize);
      setHasMoreData(loadedCount < totalDataCount.current);
      setCurrentPage(page);
      setIsRequestList(false);
      setShouldFetch(false);
      return newWorks;
    } catch (error) {
      setIsRequestList(false);
      setShouldFetch(false);
      console.error('Error fetching my works:', error);
      show({ message: t('music.load_failed') });
      return [];
    }
  }

  // 转化作品数据
  const transformMyWorks = (data: any[]): Music[] => {
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      genres: item.genres,
      duration: item.duration,
      cover: item.cover,
      lyrics: item.lyrics,
      taskId: item.task_id,
      url: item.cover_url || item.music_url,
      music_url: item.music_url,
      type: item.type,
      playing: false,
    }));
  }

  // 加载更多数据
  const loadMoreData = async () => {
    // 新增：若已加载数据量 >= 总数据量，直接退出
    const totalLoaded = filteredWorks.length;
    if (totalLoaded >= totalDataCount.current && currentPage !== 0) {
      setHasMoreData(false);
      console.log('loadMoreData---已加载全部数据，退出');
      return;
    }

    if (isLoadingMore || !hasMoreData || isRefreshing || isRequestList || shouldFetch) {
      console.log('loadMoreData---判断符合不执行逻辑');
      return;
    }
    console.log('loadMoreData---执行loadMoreData方法逻辑');

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      await getMyWorks(nextPage, true);
      //   setCurrentPage(nextPage);
    } catch (error) {
      console.error('加载更多数据失败:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // 下拉刷新
  const handleRefresh = async () => {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    setCurrentPage(1);
    setHasMoreData(true);

    try {
      await getMyWorks(1, false);
    } catch (error) {
      console.error('刷新数据失败:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 搜索功能
  const handleSearch = (text: string) => {
    searchTextRef.current = text;
    setSearchText(text);
    setCurrentPage(1);
    setHasMoreData(true);
    setShouldFetch(true);
  };

  const inputSubmitEditing = (e: any) => {
    console.log('inputSubmitEditing---', e?.nativeEvent?.text);
    handleSearch(e.nativeEvent.text)
  }

  // 清除搜索
  const clearSearch = () => {
    searchTextRef.current = '';
    setSearchText('');
    setCurrentPage(1);
    setHasMoreData(true);
    setShouldFetch(true);
  };

  // 当搜索文本变化时，重新加载数据
  useEffect(() => {
    // 搜索文本变化时，重置分页状态并重新加载
    // setCurrentPage(1);
    // setHasMoreData(true);
    // getMyWorks(1, false);
    if (shouldFetch) {
      getMyWorks(currentPage, false);
    }
  }, [shouldFetch]);

  // 播放音乐
  const handlePlayAudio = async (music: Music) => {
    if (!music.url) {
      show({ message: t('music.no_audio_available') });
      return;
    }

    // 停止当前播放的音频
    if (sound) {
      try {
        sound.stop();
        sound.release();
      } catch (error) {
        console.log('停止音频时出错:', error);
      }
      setSound(null);
    }
    // 重置播放状态
    setIsPlaying(false);
    setIsPlayMusic('');

    // 创建新的音频实例
    const newSound = new (Sound as any)(music.url, (error: any) => {
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
        setIsPlayMusic('');
      });
      setIsPlayMusic(music.url);

      setIsPlaying(true);
    });

    setSound(newSound);
  };

  // 播放/暂停
  const handlePlayPause = async (music: Music) => {
    // 如果正在处理中，忽略新的点击
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      // 如果点击的是不同的歌曲，先停止当前播放的歌曲，然后播放新歌曲
      if (sound && isPlayMusic !== music.url) {
        try {
          sound.stop();
          sound.release();
        } catch (error) {
          console.log('停止音频时出错:', error);
        }
        setSound(null);
        setIsPlaying(false);
        setIsPlayMusic('');

        // 等待一小段时间确保音频完全停止
        await new Promise(resolve => setTimeout(resolve, 100));

        // 立即播放新歌曲
        await handlePlayAudio(music);
        return;
      }

      if (!sound) {
        await handlePlayAudio(music);
        return;
      }

      if (isPlaying) {
        sound.pause();
        setIsPlaying(false);
        setIsPlayMusic('');
      } else {
        sound.play();
        setIsPlaying(true);
        setIsPlayMusic(music.url);
      }
    } finally {
      // 延迟重置处理状态，防止快速连续点击
      setTimeout(() => {
        setIsProcessing(false);
      }, 300);
    }
  };


  const selectFileBtnClick = async () => {

    // setUploadStatus(UploadStatusEnum.TYPE_SUCCESS)
    try {
      const res = await pick({
        type: fileTypes,
        allowMultiSelection: false,
      });
      console.log('res----', res);
      if (androidTypes.includes(res[0]?.type ?? '')) {
        console.log('文件格式正确');
      } else {
        show({
          message: t('translate_screen.document_filetype_error')
        })
        return
      }

      // let totalSizeBytes = 0;

      // res.forEach((file) => {
      //   totalSizeBytes += file.size ?? 0;
      // });

      // const totalSizeMB = totalSizeBytes / (1024 * 1024);

      // if (totalSizeMB  > MAX_FILE_SIZE_MB) {
      //   console.warn(`${t('translate_screen.document_filesize_max1')} ${MAX_FILE_SIZE_MB}MB, ${t('translate_screen.document_filesize_max2')}`);
      //   return;
      // }

      console.log('选中的文件:', res);

      // 在这里处理上传等逻辑
      if (res && res.length > 0) {
        setLoading(true)
        const file = res[0];
        uploadAudioFile({
          uri: file.uri,
          name: file.name ?? Date.now() + '',
          type: file.type || 'application/octet-stream', // 兜底
        }).then(response => {
          console.log('上传成功', response?.url_list?.[0]);
          let urlStr = response?.url_list?.[0]
          if (urlStr) {
            let nameStr = ''
            // 找到最后一个点的位置
            const lastDotIndex = file?.name?.lastIndexOf('.');
            // 如果没有点，直接返回原字符串
            if (lastDotIndex === -1) {
              nameStr = file?.name || '';
            } else {
              nameStr = file?.name?.substring(0, lastDotIndex) || '';
            }


            saveMusicByLink({
              title: nameStr || t('music.no_title'),
              file_url: urlStr
            }).then(saveRes => {
              console.log('保存成功', saveRes);
              show({ message: t('music.upload_success') });
              setCurrentPage(1);
              setHasMoreData(true);
              getMyWorks(1, false);
            }).catch(err => {
              console.error('保存失败', err);
              show({ message: t('music.save_failed') });
            }).finally(() => {
              setLoading(false)
            })
          }

        }).catch(err => {
          setLoading(false)
          console.error('上传失败', err);
        });
      }

    } catch (err) {
      console.log('用户取消选择');
      // console.error('文件选择出错:', err);
    }
  }



  // 监听页面焦点变化，当页面重新获得焦点时执行getMyWorks
  useFocusEffect(
    React.useCallback(() => {
      console.log('页面获得焦点');
      console.log('isMounted--', isMounted.current);

      // 页面首次渲染完成后标记为已挂载
      if (!isMounted.current) {
        isMounted.current = true;
      } else {
        console.log('页面获得焦点---执行getMyWorks');

        // setCurrentPage(1);
        // setHasMoreData(true);
        // getMyWorks(1, false);
      }
      // setCurrentPage(1);
      // setHasMoreData(true);
      // getMyWorks(1, false);

      // 页面失去焦点时的清理函数
      return () => {
        console.log('页面失去焦点，清理音频数据');
        cleanupAudioData();
      };
    }, [cleanupAudioData])
  );

  const handleToPlayMusic = (music: Music) => {
    cleanupAudioData();
    navigation.navigate('MyWorkMusicPlay', { music: filteredWorks[0], songList: filteredWorks, myWorkIds: filteredWorks.map((item: Music) => item.id) });
  }

  useEffect(() => {
    // 组件初始化时加载第一页数据
    // setCurrentPage(1);
    // setHasMoreData(true);
    // setIsRefreshing(true);
    // getMyWorks(1, false);
  }, []);
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => {
          cleanupAudioData();
          navigation.reset({
            index: 0,
            routes: [
              { name: 'MusicMain' }
            ]
          });
        }} style={styles.backBtn}>
          <Image
            source={require('../../../../assets/images/music_back_btn.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('music.my_works')}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.searchUploadContainer}>
        {/* Search */}
        <View style={styles.searchBox}>
          <Image source={require('@/assets/music/music_search_icon.png')} style={styles.searchIcon} resizeMode="contain" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('music.search_placeholder')}
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={handleSearch}
            onSubmitEditing={inputSubmitEditing}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearSearchBtn}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* 上传按钮 */}
        <TouchableOpacity style={styles.uploadBtn} onPress={selectFileBtnClick}>
          <Text style={styles.uploadBtnText}>{t('music.upload')}</Text>
        </TouchableOpacity>
      </View>




      {/* Search Results Info */}
      {/* {searchText.length > 0 && (
        <View style={styles.searchInfo}>
          <Text style={styles.searchInfoText}>
            {`${t('music.search_results')} ${filteredWorks.length}/${myWorks.length}`}
          </Text>
        </View>
      )} */}

      {/* List */}
      <FlatList
        data={filteredWorks}
        keyExtractor={item => item.url?.toString()}
        renderItem={({ item }: { item: Music }) => (
          <TouchableOpacity
            style={styles.itemCard}
            onPress={() => { handleToPlayMusic(item) }}
          >
            <Image source={item.cover ? { uri: item.cover } : require('@/assets/music/music_avatar_icon.png')} style={styles.avatar} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.title || t('music.no_title')}</Text>
              <Text style={styles.itemTags} numberOfLines={1} ellipsizeMode="tail">{item.genres}</Text>
            </View>
            {item.url === isPlayMusic ? (
              <Image
                source={require('../../../../assets/images/play_wave.png')}
                style={styles.priceWave}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.price}>{formatTime(item.duration)}</Text>
            )}
            <TouchableOpacity style={styles.playBtn} onPress={() => handlePlayPause(item)}>
              <Image
                source={
                  item.url === isPlayMusic
                    ? require('../../../../assets/images/pause_btn.png')
                    : require('../../../../assets/images/play_btn.png')
                }
                style={styles.playIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isRefreshing ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('music.no_works_found')}</Text>
            </View>
          ) : null
        }
        ListFooterComponent={() => {
          if (isLoadingMore) {
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#85F380" />
                <Text style={styles.loadingText}>{t('music.loading_more')}</Text>
              </View>
            );
          }
          if (!hasMoreData && filteredWorks.length > 0) {
            return (
              <View style={styles.noMoreContainer}>
                <Text style={styles.noMoreText}>{t('music.no_more_data')}</Text>
              </View>
            );
          }
          return null;
        }}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.1}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
      <FullScreenLoader
        visible={loading}
        text={t('translate_screen.loading_text')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: normalize(32),
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    marginBottom: normalize(16),
  },
  backBtn: {
    width: normalize(32),
    height: normalize(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: normalize(28),
    height: normalize(28),
    // tintColor: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontSize: normalizeFontSize(20),
    fontWeight: '700',
    textAlign: 'center',
  },
  searchBox: {
    width: "66%",
    backgroundColor: '#222',
    height: normalize(48),
    borderRadius: normalize(12),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    width: normalize(20),
    height: normalize(20),
    marginRight: normalize(10),
  },
  searchInput: {
    color: '#fff',
    height: normalize(48),
    paddingVertical: normalize(4),
    fontSize: normalizeFontSize(15),
    backgroundColor: 'transparent',
    flex: 1,
  },
  clearSearchBtn: {
    padding: normalize(8),
    marginLeft: normalize(8),
  },
  clearSearchText: {
    color: '#888',
    fontSize: normalizeFontSize(18),
  },
  searchInfo: {
    backgroundColor: '#222',
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(16),
    marginHorizontal: normalize(16),
    marginBottom: normalize(14),
    borderRadius: normalize(12),
  },
  searchInfoText: {
    color: '#aaa',
    fontSize: normalizeFontSize(13),
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191919',
    borderRadius: normalize(16),
    marginHorizontal: normalize(16),
    marginBottom: normalize(14),
    padding: normalize(12),
  },
  avatar: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    marginRight: normalize(12),
    backgroundColor: '#333',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    color: '#fff',
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    marginBottom: normalize(2),
  },
  itemTags: {
    color: '#aaa',
    fontSize: normalizeFontSize(13),
  },
  price: {
    color: '#85F380',
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    marginHorizontal: normalize(10),
  },
  playBtn: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: normalize(22),
    height: normalize(22),
    tintColor: '#85F380',
  },
  priceWave: {
    width: normalize(40),
    height: normalize(22),
    marginHorizontal: normalize(10),
  },
  emptyContainer: {
    height: normalize(300),
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: normalizeFontSize(15),
  },
  searchUploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    marginBottom: normalize(18),
  },
  uploadBtn: {
    width: "30%",
    height: normalize(48),
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(12),
  },
  uploadBtnText: {
    color: theme.background,
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: normalize(20),
  },
  loadingText: {
    color: '#85F380',
    fontSize: normalizeFontSize(14),
    marginLeft: normalize(8),
  },
  noMoreContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: normalize(20),
  },
  noMoreText: {
    color: '#888',
    fontSize: normalizeFontSize(14),
  },
});

export default MyWorkScreen;
