import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  AppState,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MusicStackParamList } from './navigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { generateMusic, getGenerateMusicOSStatus, getCoverMusicStatus, saveCoverMusicOS } from '@/api/music/music';
import { useMusicStore } from '@/store/modules/music.store';
import { useVoiceStore } from '@/store/modules/voice.store';
import { useMessageModal } from '@/contexts/MessageModalContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import { usePointsStore } from '@/store/modules/points.store';

type GeneratingMusicScreenNavigationProp = NativeStackNavigationProp<MusicStackParamList, 'GeneratingMusic'>;


let getTaskInfoTimer: any = null

const GeneratingMusicScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<GeneratingMusicScreenNavigationProp>();
  const navigationRef = useRef(navigation);
  navigationRef.current = navigation;
  const [progress, setProgress] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [_isGenerating, setIsGenerating] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const statusInterval = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const taskIdRef = useRef<string>('');
  const { show } = useMessageModal();
  const { t } = useLanguage();
  const { lyrics, musicStyles, title } = useMusicStore.getState().musicGenerateInfo;
  const { generateMusicType, isSelectedVoice, setTaskId } = useMusicStore.getState();
  const translationMaxTimeRef = useRef(isSelectedVoice ? 180000 : 60000);
  const { refreshPointsBalance } = usePointsStore.getState();
  const { taskId, createTaskTime } = route.params || {};

  // 清理所有轮询
  const cleanupPolling = () => {
    console.log('清理轮询...');
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    if (statusInterval.current) {
      clearInterval(statusInterval.current);
      statusInterval.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

  };

  useEffect(() => {

    console.log('接收taskId-----', taskId);
    setProgress(0)
    taskIdRef.current = taskId
    startStatusPolling();

    // 禁用返回手势，但允许程序化导航
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // 检查是否是程序化导航（如replace）
      if (e.data.action.type === 'REPLACE') {
        // 允许程序化导航
        return;
      }
      // 阻止用户手动返回
      e.preventDefault();
    });

    // generateMusicRequest();

    // // 监听应用状态变化
    // const handleAppStateChange = (nextAppState: string) => {
    //   if (nextAppState === 'background' || nextAppState === 'inactive') {
    //     console.log('应用进入后台，清理轮询');
    //     cleanupPolling();
    //   }else{
    //     console.log('应用进入前台，恢复轮询',taskIdRef.current);
    //     startStatusPolling(taskIdRef.current);
    //     startProgressSimulation();
    //   }
    // };

    // const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // cleanupPolling();
      // subscription?.remove();
      clearTimeout(getTaskInfoTimer)
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generRationFailed = () => {
    setIsGenerating(false);
    show({ message: t('music.generation_failed') });
    if (generateMusicType === 'generate') {
      navigation.replace('SingerSelection', { type: 'generate' });
    } else {
      navigation.replace('CoverUpload');
    }
    // 由于禁用了返回功能，改为跳转到主页面
    // 发生错误时清理轮询
    cleanupPolling();
    clearTimeout(getTaskInfoTimer);
  }

  const generateMusicRequest = async () => {
    console.log(lyrics, musicStyles, title, 'lyrics, musicStyles');
    try {
      // setIsGenerating(true);
      // const res = await generateMusic({ 
      //   work_title: title,
      //   work_lyrics: lyrics,
      //   work_genres: musicStyles,
      // });
      // console.log(res, 'res');
      // if(!res.task_id){
      //   generRationFailed()
      //   return
      // }
      // taskIdRef.current = res.task_id;

      // 开始轮询查询状态
      // startStatusPolling(taskIdRef.current);

      // // 开始模拟进度更新
      // startProgressSimulation();

      // 设置超时，3分钟后自动停止轮询
      // timeoutRef.current = setTimeout(() => {
      //   console.log('轮询超时，自动停止');
      //   cleanupPolling();
      //   setIsGenerating(false);
      //   show({message: t('music.generation_timeout')});
      //   navigation.goBack();
      // }, 3 * 60 * 1000); // 3分

    } catch (error) {
      // console.log(error,'error')
      // generRationFailed()
    }
  };

  // 保存翻唱歌曲
  const saveCoverMusicRequest = async () => {
    try {
      const res = await saveCoverMusicOS({
        task_id: taskIdRef.current,
      });
      return res;
    } catch (error) {
      console.log(error, 'error')
      return error;
    }
  }

  // 开始轮询查询状态
  const startStatusPolling = () => {
    // if(!id){
    //   generRationFailed()
    //   return
    // }
    // statusInterval.current = setInterval(async () => {
    //   await getMusicTaskStatusRequest(id);
    // }, 3500); // 每2秒查询一次
    getTaskInfoTimer = setTimeout(async () => {
      // await getMusicTaskStatusRequest(id);

      const getStatusRequest = generateMusicType === 'generate' ? getGenerateMusicOSStatus : getCoverMusicStatus;

      getStatusRequest({
        task_id: taskIdRef.current,
      }).then((rsp) => {
        console.log('轮询状态------', rsp);

        let isSuccess = false;

        if (generateMusicType === "generate") {
          isSuccess = rsp.status === 3;
        } else if (generateMusicType === "cover") {
          isSuccess = rsp.status === 2;
        }


        if (!isSuccess) { // 说明在生成中
          startStatusPolling()
          let percent = toPercent(Math.floor(performance.now()) - createTaskTime)
          setProgress(percent === 100 ? 99 : percent)

        } else { // 生成成功
          setProgress(100)

          setTimeout(async () => {
            clearTimeout(getTaskInfoTimer)

            if (generateMusicType === 'cover') {
              const resSave = await saveCoverMusicRequest()
              refreshPointsBalance();
              navigation.replace('MusicPlay', { music: resSave, type: 'cover' });
            } else {
              setTaskId(taskIdRef.current)
              refreshPointsBalance();
              navigation.replace('MusicPreview', { music: rsp });
            }
          }, 1000)

        }
      }).catch((err) => {
        console.log(err, 'err')
        generRationFailed()
      })

    }, 3000); // 每2秒查询一次
  };

  const toPercent = (num: number) => {
    const percent = (num / translationMaxTimeRef.current) * 100;
    return Math.min(Math.round(percent), 100); // 四舍五入并确保最大值为 100
  }

  // 开始模拟进度更新
  const startProgressSimulation = () => {
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          return 100;
        }
        return newProgress;
      });
    }, 2000);
  };

  // 查询生成状态
  const getMusicTaskStatusRequest = async (id: string) => {
    try {
      const res = await getMusicTaskStatus({
        task_id: id,
      });
      console.log(res, 'status res');

      // 如果res.data不为null，说明生成成功
      if (res !== null) {
        // 停止轮询和进度模拟
        cleanupPolling();

        // 设置进度为100%
        setProgress(100);
        setIsGenerating(false);
        const timer = setTimeout(() => {
          // 跳转音乐预览页面
          navigation.replace('MusicPreview', { music: res });
          clearTimeout(timer);
        }, 500);
        // setIsGenerating(false);



        // 显示完成弹窗
        // setTimeout(() => {
        //   if(useVoiceStore.getState().type === VoiceType.CREATE){
        //     // 跳转专属音色页面
        //     // navigation.replace('LanguageVoice');
        //   } else {
        //     // 跳转专属音色页面
        //     setShowCompletionModal(true);
        //   }
        // }, 1000);
      }
    } catch (error: any) {
      show({ message: t('music.generation_failed') + error.message || '' });
      console.log('Status check error:', error);
    }
  };

  const handleReRecording = () => {
    setShowCompletionModal(false);
    useVoiceStore.getState().setVoiceFile({
      uri: '',
      type: '',
      name: '',
    });
    useVoiceStore.getState().setLocal("");
    // navigation.navigate('CreateVoice');
  };

  const handleConfirm = () => {
    setShowCompletionModal(false);
    // 跳转到 ProfileHome 页面，注意这里应该直接跳转到 ProfileHome，而不是 ProfileNavigator
    useVoiceStore.getState().setVoiceFile({
      uri: '',
      type: '',
      name: '',
    });
    useVoiceStore.getState().setLocal("");
    navigation.replace('MusicMain');
  };

  // 阻止所有返回操作
  const preventGoBack = () => {
    // 不执行任何操作，阻止返回
    return;
  };

  return (
    <Modal
      visible={true}
      transparent={false}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={() => {
        // 禁用返回手势，不执行任何操作
        return;
      }}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container} edges={[]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* 背景图片 */}
          <Image
            source={require('../../../assets/profile/profile_generate_bg.png')}
            style={styles.backgroundImage}
          />

          {/* 顶部导航栏 */}
          <View style={styles.header}>
            {/* <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image 
            source={require('../../../assets/main/page_return_icon.png')} 
            style={styles.backIcon}
          />
        </TouchableOpacity> */}
            <Text style={styles.title}>{t('music.generating_music')}</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* 动画容器 */}
          <View style={styles.animationContainer}>
            <LottieView
              source={require('../../../assets/lottie/generate_voice.json')}
              style={styles.lottieAnimation}
              autoPlay
              loop
              speed={1}
            />
          </View>

          {/* 进度百分比 */}
          <Text style={styles.progressText}>{t('music.estimated_time').replace('{time}', isSelectedVoice ? '2 - 3' : '1').replace('{progress}', Math.round(progress).toString())}</Text>

          {/* 状态文本根据时间进度切换文字 */}
          <View style={styles.statusContainer}>
            {progress >= 0 && progress < 25 && <Text style={styles.statusText}>
              {t('music.arranging_music')}
            </Text>}
            {progress >= 25 && progress < 50 && <Text style={styles.statusText}>
              {t('music.vocal_singing')}
            </Text>}
            {progress >= 50 && progress < 75 && <Text style={styles.statusText}>
              {t('music.editing_fine_tuning')}
            </Text>}
            {progress >= 75 && progress < 100 && <Text style={styles.statusText}>
              {t('music.reverberating_music')}
            </Text>}
            {progress >= 100 && <Text style={styles.statusText}>
              {t('music.reverberating_music')}
            </Text>}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* 生成完成弹窗 */}
      <Modal
        visible={showCompletionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* 标题和描述 */}
            <View style={styles.modalContent}>
              <View style={styles.iconContainer}>
                <Image
                  source={require('../../../assets/main/success_icon.png')}
                  style={styles.successIconImage}
                />
              </View>

              <Text style={styles.modalTitle}>
                {t('generating_voice.voiceprint_optimization_complete')}
              </Text>

              <Text style={styles.modalDescription}>
                {t('generating_voice.listen_optimization_effect')}
              </Text>
            </View>

            {/* 按钮 */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleReRecording}
              >
                <Text style={styles.reRecordingText}>{t('generating_voice.re_recording')}</Text>
              </TouchableOpacity>

              <View style={styles.buttonSeparator} />

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmText}>{t('generating_voice.confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  scrollView: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  backgroundImage: {
    position: 'absolute',
    top: normalize(0),
    left: normalize(-224),
    width: normalize(831),
    height: normalize(747),
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(24),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backIcon: {
    width: normalize(16),
    height: normalize(16),
  },
  headerSpacer: {
    width: normalize(40),
  },
  title: {
    flex: 1,
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: normalize(400),
    marginTop: normalize(0),
  },
  lottieAnimation: {
    width: normalize(517),
    height: normalize(517),
  },
  progressText: {
    fontSize: normalizeFontSize(25),
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: normalize(20),
  },
  statusText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.5,
    lineHeight: normalize(20),
  },
  // 弹窗样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: normalize(327),
    backgroundColor: '#333333',
    borderRadius: normalize(8),
    overflow: 'hidden',
    paddingTop: normalize(12),
  },
  modalContent: {
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(16),
    paddingTop: normalize(12),
  },
  iconContainer: {
    alignItems: 'center',
    paddingVertical: normalize(4),
    paddingBottom: normalize(8),
  },
  successIcon: {
    width: normalize(48),
    height: normalize(48),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconImage: {
    width: normalize(36),
    height: normalize(36),
    tintColor: '#36F279',
  },
  modalTitle: {
    fontSize: normalizeFontSize(17),
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: normalize(22),
    letterSpacing: -0.4,
    marginBottom: normalize(4),
  },
  modalDescription: {
    fontSize: normalizeFontSize(13),
    fontWeight: '400',
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: normalize(18),
    letterSpacing: -0.4,
  },
  modalButtons: {
    flexDirection: 'row',
    borderTopWidth: normalize(0.33),
    borderTopColor: '#4F4F4F',
  },
  modalButton: {
    flex: 1,
    height: normalize(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSeparator: {
    width: normalize(0.33),
    height: normalize(44),
    backgroundColor: '#4F4F4F',
  },
  reRecordingText: {
    fontSize: normalizeFontSize(17),
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: normalize(22),
    letterSpacing: -0.4,
  },
  confirmText: {
    fontSize: normalizeFontSize(17),
    fontWeight: '600',
    color: '#85F380',
    textAlign: 'center',
    lineHeight: normalize(22),
    letterSpacing: -0.4,
  },
});

export default GeneratingMusicScreen; 