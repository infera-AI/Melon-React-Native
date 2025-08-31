// src/screens/SingerSelectionScreen/index.tsx
import React, { useState } from 'react';
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
import { polishLyrics, recommendGenres, generateMusic } from '@/api/music/music';
import { useMusicStore } from '@/store/modules/music.store';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useMessageModal } from '@/contexts/MessageModalContext';


// 歌手数据接口
interface Singer {
  id: string;
  name: string;
  language: string;
  avatar: any;
  isSelected?: boolean;
}

// Tab类型
type TabType = 'public' | 'voiceprint';

// 模拟歌手数据
const singers: Singer[] = [
  {
    id: '1',
    name: 'Gladys',
    language: 'Hindi',
    avatar: require('@/assets/profile/profile_voice_icon.png'),
  },
  {
    id: '2',
    name: 'Beyoncé Giselle Knowles',
    language: 'English',
    avatar: require('@/assets/profile/profile_voice_icon.png'),
  },
  {
    id: '3',
    name: 'Gladys',
    language: 'Hindi',
    avatar: require('@/assets/profile/profile_voice_icon.png'),
  },
  {
    id: '4',
    name: 'Gladys',
    language: 'Hindi',
    avatar: require('@/assets/profile/profile_voice_icon.png'),
  },
  {
    id: '5',
    name: 'Gladys',
    language: 'Hindi',
    avatar: require('@/assets/profile/profile_voice_icon.png'),
  },
  {
    id: '6',
    name: 'Gladys',
    language: 'Hindi',
    avatar: require('@/assets/profile/profile_voice_icon.png'),
  },
  {
    id: '7',
    name: 'Gladys',
    language: 'Hindi',
    avatar: require('@/assets/profile/profile_voice_icon.png'),
  },
  {
    id: '8',
    name: 'Gladys',
    language: 'Hindi',
    avatar: require('@/assets/profile/profile_voice_icon.png'),
  },
];

const SingerSelectionScreen: React.FC<any> = ({route}:any) => {
  const {type} = route.params||{};
  const navigation = useNavigation();
  const { t } = useLanguage();
  const {show} = useMessageModal()
  const { apply, applyItem, text, textSecondary } = useGlobalTheme();
  const [selectedSinger, setSelectedSinger] = useState<string | null>(null);
  const [singersList, setSingersList] = useState<Singer[]>(singers);
  const [activeTab, setActiveTab] = useState<TabType>('public');
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  // 处理歌手选择
  const handleSingerSelect = (singerId: string) => {
    setSelectedSinger(singerId);
    
    // 更新歌手列表的选择状态
    setSingersList(prev => 
      prev.map(singer => ({
        ...singer,
        isSelected: singer.id === singerId
      }))
    );
  };

  // 处理跳过选择
  const handleSkipSelection = () => {
    // 跳过选择逻辑
    console.log('跳过选择');
    // navigation.navigate('NextScreen');
  };

  // 处理上一步
  const handlePreviousStep = () => {
    navigation.goBack();
  };

  // 处理下一步
  const handleNextStep = () => {

    setModalVisible(true);
    // if (selectedSinger) {
    //   console.log('选择的歌手:', selectedSinger);
    //   console.log('当前Tab:', activeTab);
    //   // navigation.navigate('NextScreen', { selectedSinger, tab: activeTab });
    // } else {
    //   // 提示用户选择歌手
    //   console.log('请选择歌手');
    // }
  };

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
          Public singer
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
          My voiceprint
        </Text>
        {activeTab === 'voiceprint' && <View style={styles.tabIndicator} />}
      </TouchableOpacity>
    </View>
  );

  // 渲染内容区域
  const renderContent = () => {
    if (activeTab === 'public') {
      return (
        <>
         <View
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
                console.log('Go record pressed');
              }}
            >
              <View style={styles.addButtonContent}>
                <Image source={require('@/assets/music/music_add_icon.png')} style={styles.plusIcon} />
                <Text style={styles.addButtonText}>Go record</Text>
              </View>
            </TouchableOpacity>
          </View>
          {/* 歌手列表 */}
          <ScrollView style={styles.singerList} showsVerticalScrollIndicator={false}>
           
            {singersList.map((singer,index) => (
              <TouchableOpacity
                key={singer.id}
                style={[
                  styles.singerItem,
                  index === singersList.length - 1 && styles.lastSingerItem,
                  singer.isSelected && styles.selectedSingerItem
                ]}
                onPress={() => handleSingerSelect(singer.id)}
              >
                <View style={styles.singerInfo}>
                  <Image 
                    source={singer.avatar}
                    style={styles.singerAvatar}
                  />
                  <Text style={[styles.singerName, text]}>
                    {singer.name} - {singer.language}
                  </Text>
                </View>
                <TouchableOpacity>
                  <Image source={require('../../../../assets/images/music_play.png')} style={styles.playIcon} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      );
    } else {
      return (
        <View style={styles.voiceprintContent}>
          <Text style={[styles.voiceprintText, text]}>
            My voiceprint content will be displayed here
          </Text>
          <Text style={[styles.voiceprintSubtext, textSecondary]}>
            This is the voiceprint tab content
          </Text>
        </View>
      );
    }
  };

  // 跳转到音乐生成页面
  const handleToMusicGenerate = () => {
    setIsLoading(true);
    const {musicGenerateInfo} = useMusicStore.getState();
    generateMusic({ 
      work_title: musicGenerateInfo.title,
      work_lyrics: musicGenerateInfo.lyrics,
      work_genres: musicGenerateInfo.musicStyles,
    }).then((rsp) => {
      setIsLoading(false);
      if(!rsp.task_id){
        show({
          message: t('translate_screen.failed_again')
        })
        return
      }
      navigation.navigate('GeneratingMusic' as never, {
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

  const handlePointsTopup = () => {
    // navigation.navigate('PointsTopup');
  }

  const handleWatchAds = () => {
    // navigation.navigate('AI');
  }

  return (
    <SafeAreaView style={apply(styles.container)} edges={['top', 'bottom']}>

      {/* Tab栏 */}
      {renderTabBar()}

      {/* 内容区域 */}
      {renderContent()}

       {/* 跳过选择 */}
     {type === 'generate' && <View style={styles.skipContainer}>
            <TouchableOpacity onPress={handleSkipSelection}>
              <Text style={[styles.skipText]}>
                Skip selection &gt;&gt;
              </Text>
            </TouchableOpacity>
        </View>}

      {/* 底部按钮 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.previousButton, applyItem(styles.button)]}
          onPress={handlePreviousStep}
        >
          <Text style={[styles.buttonText, text]}>Previous step</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.nextButton, 
            !selectedSinger && activeTab === 'public' && styles.disabledButton
          ]}
          onPress={handleNextStep}
          disabled={!selectedSinger && activeTab === 'public'}
        >
          <Text style={[styles.buttonText, styles.nextButtonText]}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
      <PointsConfirmModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleToMusicGenerate}
        onCancel={() => setModalVisible(false)}
        pointsToSpend={50}
        pointsBalance={300}
        onDontShowAgain={() => {}}
      />
      {/* <PointsLimitModal
        visible={modalVisible}
        onClose={handleWatchAds}
        onConfirm={handlePointsTopup}
        onCancel={() => setModalVisible(false)}
        pointsToSpend={50}
        pointsBalance={300}
        onDontShowAgain={() => {}}
      /> */}
      <FullScreenLoader
        visible={isLoading}
        message={t('loading')}
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
  addButtonContainer:{
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
    margin:normalize(24),
    marginBottom: normalize(15),
    marginTop: normalize(0),
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
    flex:1,
  },
  lastSingerItem:{
    borderBottomWidth: 0,
  },
  singerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  
  // 声纹内容
  voiceprintContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
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
    fontWeight: '600',
  },
  nextButtonText: {
    color: theme.background,
  },
  addButton: {
    flex:1,
    backgroundColor: theme.backgroundTertiary,
    height: normalize(48),
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    margin:normalize(16),
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
    width: normalize(16),
    height: normalize(16),
    marginRight: normalize(8),
  },
  addButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: theme.primary,
  },
});

export default SingerSelectionScreen;