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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMusicWorks } from '@/api/music/music';
import { AudioPlayer } from '@/utils/audioUtils';
import Sound from "react-native-sound";
import { useMessageModal } from '@/contexts/MessageModalContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatTime } from '@/utils/helpers';

// normalize函数
const normalize = (size: number) => {
  const { width } = Dimensions.get('window');
  const scale = width / 375;
  return Math.round(size * scale);
};

// normalizeFontSize函数
const normalizeFontSize = (size: number) => {
  const { width } = Dimensions.get('window');
  const scale = width / 375;
  return Math.round(size * scale);
};

interface Music {
  id: number;
  url: string;
  cover: string;
  title: string;
  lyrics: string;
  taskId: string;
  duration: number;
  genres: string[];
  playing: boolean;
}


const MyWorkScreen = ({ navigation }: any) => {
  const [myWorks, setMyWorks] = useState<Music[]>([]);
  const [filteredWorks, setFilteredWorks] = useState<Music[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [sound, setSound] = useState<Sound | null>(null);
  const audioPlayerRef = useRef<AudioPlayer>(null);
  const [isPlayMusic, setIsPlayMusic] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // 添加处理状态
  const {show} = useMessageModal();
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
      
      // 重置所有作品的播放状态
      setMyWorks(prevWorks => 
        prevWorks.map((item: Music) => ({
          ...item,
          playing: false,
        }))
      );
      
      console.log('音频数据清理完成');
    } catch (error) {
      console.error('清理音频数据失败:', error);
    }
  }, [sound]);
  
  console.log(myWorks)
   // 获取作品
  const getMyWorks = async () => {
    try {
      const response = await getMusicWorks();
      setMyWorks(transformMyWorks(response.works));
      setFilteredWorks(transformMyWorks(response.works)); // 初始化过滤后的作品
    } catch (error) {
      console.error('Error fetching my works:', error);
      return [];
    }
  }

  // 转化作品数据
  const transformMyWorks = (data: any[]): Music[] => {
    return data.map((item: any) => ({
      id: item.work_id,
      title: item.work_title,
      genres: item.work_genres,
      duration: item.work_duration,
      cover: item.work_cover,
      lyrics: item.work_lyrics,
      taskId: item.task_id,
      url: item.work_url,
      playing: false,
    }));
  }

  // 搜索功能
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredWorks(myWorks);
    } else {
      const filtered = myWorks.filter((work: Music) => {
        const searchLower = text.toLowerCase();
        return (
          work.title?.toLowerCase().includes(searchLower) ||
          (Array.isArray(work.genres) && work.genres.some((genre: string) => 
            genre.toLowerCase().includes(searchLower)
          ))
        );
      });
      setFilteredWorks(filtered);
    }
  };

  // 清除搜索
  const clearSearch = () => {
    setSearchText('');
    setFilteredWorks(myWorks);
  };

  // 当 myWorks 更新时，同步更新 filteredWorks
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredWorks(myWorks);
    } else {
      const filtered = myWorks.filter((work: Music) => {
        const searchLower = searchText.toLowerCase();
        return (
          work.title.toLowerCase().includes(searchLower) ||
          (Array.isArray(work.genres) && work.genres.some((genre: string) => 
            genre.toLowerCase().includes(searchLower)
          ))
        );
      });
      setFilteredWorks(filtered);
    }
  }, [myWorks, searchText]);

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

    // 重置所有作品的播放状态
    setMyWorks(prevWorks => 
      prevWorks.map((item: Music) => ({
        ...item,
        playing: false,
      }))
    );

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
        
        // 重置播放状态
        setMyWorks(prevWorks => 
          prevWorks.map((item: Music) => ({
            ...item,
            playing: false,
          }))
        );
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
        
        // 重置所有作品的播放状态
        setMyWorks(prevWorks => 
          prevWorks.map((item: Music) => ({
            ...item,
            playing: false,
          }))
        );
        
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
        setMyWorks(prevWorks => 
          prevWorks.map((item: Music) => {
            if (item.url === music.url) {
              return { ...item, playing: false };
            }
            return item;
          })
        );
      } else {
        sound.play();
        setIsPlaying(true);
        setMyWorks(prevWorks => 
          prevWorks.map((item: Music) => {
            if (item.url === music.url) {
              return { ...item, playing: true };
            }
            return item;
          })
        );
      }
    } finally {
      // 延迟重置处理状态，防止快速连续点击
      setTimeout(() => {
        setIsProcessing(false);
      }, 300);
    }
  };



  // 监听页面焦点变化，当页面重新获得焦点时执行getMyWorks
  useFocusEffect(
    React.useCallback(() => {
      console.log('页面获得焦点，执行getMyWorks');
      getMyWorks();
      
      // 页面失去焦点时的清理函数
      return () => {
        console.log('页面失去焦点，清理音频数据');
        cleanupAudioData();
      };
    }, [cleanupAudioData])
  );

  useEffect(() => {
    console.log('isPlayMusic',isPlayMusic);
    if (isPlayMusic) {
      const playWors = myWorks.map((item: Music) => {
        if (item.url === isPlayMusic) {
          item.playing = true;
        } else {
          item.playing = false;
        }
        return item;
      });
      setMyWorks([...playWors]);
      
      // 同时更新 filteredWorks
      const filteredPlayWorks = filteredWorks.map((item: Music) => {
        if (item.url === isPlayMusic) {
          item.playing = true;
        } else {
          item.playing = false;
        }
        return item;
      });
      setFilteredWorks([...filteredPlayWorks]);
    }
  }, [isPlayMusic,sound]);

  useEffect(() => {
    getMyWorks();
  }, []);
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => {
          cleanupAudioData();
          navigation.goBack();
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

      {/* Search */}
      <View style={styles.searchBox}>
        <Image source={require('@/assets/music/music_search_icon.png')} style={styles.searchIcon} resizeMode="contain" />
        <TextInput
          style={styles.searchInput}
          placeholder={t('music.search_placeholder')}
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={handleSearch}
          onSubmitEditing={clearSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearSearchBtn}>
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
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
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }: { item: Music }) => (
          <TouchableOpacity
            style={styles.itemCard}
            onPress={() => navigation.navigate('MyWorkMusicPlay', { music: item ,myWorkIds:myWorks.map((item:Music)=>item.id)})}
          >
            <Image source={{ uri: item.cover }} style={styles.avatar} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.title}</Text>
              <Text style={styles.itemTags}>{item.genres}</Text>
            </View>
            {item.playing ? (
              <Image
                source={require('../../../../assets/images/play_wave.png')}
                style={styles.priceWave}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.price}>{formatTime(item.duration/1000)}</Text>
            )}
            <TouchableOpacity style={styles.playBtn} onPress={()=>handlePlayPause(item)}>
              <Image
                source={
                  item.playing
                    ? require('../../../../assets/images/pause_btn.png')
                    : require('../../../../assets/images/play_btn.png')
                }
                style={styles.playIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('music.no_works_found')}</Text>
        </View>}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
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
    backgroundColor: '#222',
    height:normalize(48),
    borderRadius: normalize(12),
    marginHorizontal: normalize(16),
    marginBottom: normalize(18),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    justifyContent:'center',
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
    height:normalize(48),
    paddingVertical:normalize(4),
    fontSize: normalizeFontSize(15),
    backgroundColor:'transparent',
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
    borderRadius: normalize(12),
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
});

export default MyWorkScreen;
