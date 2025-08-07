import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform, PermissionsAndroid, Alert, Animated, Easing, Pressable, FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AudioRecorderPlayer, {
    AVEncoderAudioQualityIOSType,
    AVEncodingOption,
    AudioEncoderAndroidType,
    AudioSourceAndroidType,
    OutputFormatAndroidType,
  } from 'react-native-audio-recorder-player';
import { useMessageModal } from '@/contexts/MessageModalContext';
import { useLanguage } from '@/contexts/LanguageContext';
import RNFS from 'react-native-fs';
import { singToMusic } from '@/api/music/music';
import { mergeAudioFiles, validateAudioFiles, getTotalAudioDuration } from '../../../utils/audioUtils';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useMusicStore } from '@/store/modules/music.store';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';

import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';


const MAXDURATION = 1000;

const HummingMusicScreen: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [_isRecordingValid, setIsRecordingValid] = useState(false);
  const [_recordingPath, setRecordingPath] = useState<string>('');
  const [realRecordingTime, setRealRecordingTime] = useState<number>(0);
  const [recordFileList, setRecordFileList] = useState<any[]>([]);
  const [forceUpdate, setForceUpdate] = useState<number>(0); // 强制重新渲染，通过key属性触发
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const realRecordingTimeRef = useRef(realRecordingTime);
  const handleStopRecordingRef = useRef<(() => Promise<void>) | null>(null);
  const recordingStartTime = useRef<number>(0);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTime = useRef<number>(0); // 累计录音时间
  const isPaused = useRef<boolean>(false); // 是否暂停状态
  const mergedAudioPathRef = useRef<string>('');
  const [isLoading, setIsLoading] = useState(false);


  const { t } = useLanguage();

  const navigation = useNavigation();
  const {show} = useMessageModal();
  
  // 清理录音相关数据
  const cleanupRecordingData = useCallback(async () => {
    try {
      // 如果正在录音，先停止录音
      if (isRecording) {
        // 直接停止录音，不调用 handleStopRecording 避免循环依赖
        setIsRecording(false);
        isPaused.current = true;
        
        // 停止定时器
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
          timerInterval.current = null;
        }
        
        // 停止真实录音
        try {
          await audioRecorderPlayer.stopRecorder();
          audioRecorderPlayer.removeRecordBackListener();
        } catch (stopError) {
          console.log('停止录音时出错（可能是正常的）:', stopError);
        }
      }
      
      // 清理录音文件列表
      setRecordFileList([]);
      
      // 重置录音状态
      setIsRecording(false);
      setIsRecordingValid(false);
      setRealRecordingTime(0);
      setRecordingPath('');
      
      // 重置累计时间
      accumulatedTime.current = 0;
      isPaused.current = false;
      
      // 清理定时器
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
      
      // 清理合并的音频路径
      mergedAudioPathRef.current = '';
      
      console.log('录音数据清理完成');
    } catch (error) {
      console.error('清理录音数据失败:', error);
    }
  }, [isRecording, audioRecorderPlayer]);
  
     const pulseAnim = useMemo(() => new Animated.Value(1), []);

     useEffect(() => {
     if (isRecording) {
       const pulseAnimation = Animated.loop(
         Animated.sequence([
           Animated.timing(pulseAnim, {
             toValue: 1.2,
             duration: 1000,
             useNativeDriver: true,
           }),
           Animated.timing(pulseAnim, {
             toValue: 1,
             duration: 1000,
             useNativeDriver: true,
           }),
         ])
       );
       pulseAnimation.start();
       return () => pulseAnimation.stop();
     }
   }, [isRecording, pulseAnim]);


     const formatTime = (seconds: number) => {
     const mins = Math.floor(seconds / 60);
     const secs = Math.floor(seconds % 60);
     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
   };

     const WaveformBar = ({ height, delay = 0 }: { height: number; delay?: number }) => {
     const animatedHeight = useMemo(() => new Animated.Value(height), [height]);
    
         useEffect(() => {
       if (isRecording) {
         const animation = Animated.loop(
           Animated.sequence([
             Animated.timing(animatedHeight, {
               toValue: height * 1.5,
               duration: 1000,
               delay,
               useNativeDriver: false,
             }),
             Animated.timing(animatedHeight, {
               toValue: height,
               duration: 1000,
               useNativeDriver: false,
             }),
           ])
         );
         animation.start();
         return () => animation.stop();
       }
     }, [animatedHeight, height, delay]);

    return (
      <Animated.View
        style={[
          styles.waveformBar,
          {
            height: animatedHeight,
            opacity: 0.5,
          },
        ]}
      />
    );
  };

   // 请求录音权限
   const requestRecordingPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: t('recording.recording_permission'),
            message: t('recording.recording_permission_message'),
            buttonNeutral: '稍后询问',
            buttonNegative: '取消',
            buttonPositive: '确定',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS 会自动请求权限
  };
  
     // 开始录音
   const startRecording = async () => {
     try {
      //  const hasPermission = await requestRecordingPermission();
      //  if (!hasPermission) {
      //    show({message: t('recording.permission_denied')});  
      //    return false;
      //  }

       // 检查是否已经在录音，如果是则先停止
       try {
         await audioRecorderPlayer.stopRecorder();
         audioRecorderPlayer.removeRecordBackListener();
         console.log('停止之前的录音');
       } catch (stopError) {
         // 如果没有在录音，这个错误是正常的，忽略
         console.log('没有正在进行的录音');
       }

       const timestamp = Date.now();
       const fileName = `recording_${timestamp}.m4a`;
       const path = Platform.select({
         ios: `file://${RNFS.CachesDirectoryPath}/${fileName}`,
         android: `${RNFS.CachesDirectoryPath}/${fileName}`,
       });

       const audioSet = {
         AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
         AudioSourceAndroid: AudioSourceAndroidType.MIC,
         AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
         AVNumberOfChannelsKeyIOS: 1, // 单声道，减少文件大小
         AVFormatIDKeyIOS: AVEncodingOption.aac,
         OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS,
         AudioSamplingRateAndroid: 44100, // 采样率
         AudioEncodingBitRateAndroid: 128000, // 比特率
       };

       const uri = await audioRecorderPlayer.startRecorder(path, audioSet);
       setRecordingPath(uri);
       console.log('开始录音:', uri);
       
       // 记录开始时间
       recordingStartTime.current = Date.now();
       
               // 使用 setInterval 实时更新录音时间
        timerInterval.current = setInterval(() => {
          const elapsedTime = Math.floor((Date.now() - recordingStartTime.current) / 1000);
          const totalTime = accumulatedTime.current + elapsedTime;
          setRealRecordingTime(totalTime);
          realRecordingTimeRef.current = totalTime;
          setForceUpdate(prev => prev + 1); // 强制重新渲染
          console.log('实时录音时间:', totalTime);
          
          if (totalTime > MAXDURATION) {
            show({message: t('recording.recording_time_exceeds_maximum')});  
            if (handleStopRecordingRef.current) {
              handleStopRecordingRef.current();
            }
          }
        }, 16); // 每16ms更新一次，约60fps，获得更流畅的更新
       
       return true;
     } catch (error) {
       console.error('开始录音失败:', error);
       show({message: t('recording.cannot_start_recording')});  
       return false;
     }
   };

  
  const handleStartRecording = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.MICROPHONE
        : PERMISSIONS.ANDROID.RECORD_AUDIO;

    const result = await check(permission);
    if (result === RESULTS.GRANTED) {
      // 权限已通过，开始录音
      console.log('权限已通过');

      // 如果是第一次录音，重置时间
    //  if (!isPaused.current) {
       setRealRecordingTime(0);
       realRecordingTimeRef.current = 0;
       accumulatedTime.current = 0;
    //  }
     
     // 开始真实录音
     const success = await startRecording();
     if (success) {
       setIsRecording(true);
       setIsRecordingValid(false);
       isPaused.current = false;
     }
      
      return;
    }

    if (result === RESULTS.DENIED) {
      const newResult = await request(permission);

      if (newResult === RESULTS.GRANTED) {
        // 首次获取权限成功
        console.log('获得麦克风权限');
        
      } else {
        console.log('未授权麦克风');
        show({
          message: t('translate_screen.mic_permission_error')
        })
      }
      return;
    }

    if (result === RESULTS.BLOCKED) {
      show({
        message: t('translate_screen.mic_permission_error')
      })
      return;
    }


   };

   // 停止录音
   const stopRecording = useCallback(async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      console.log('停止录音:', result);
      
      // 移除录音监听器
      audioRecorderPlayer.removeRecordBackListener();
      
      return result;
    } catch (error) {
      console.error('停止录音失败:', error);
      show({message: t('recording.cannot_stop_recording')});  
      return null;
    }
  }, [audioRecorderPlayer, show, t]);

     const handleStopRecording = useCallback(async () => {
     setIsRecording(false);
     isPaused.current = true;
     
     // 停止定时器
     if (timerInterval.current) {
       clearInterval(timerInterval.current);
       timerInterval.current = null;
     }
     
     // 计算当前录音时长并累加
     const currentElapsedTime = Math.floor((Date.now() - recordingStartTime.current) / 1000);
     accumulatedTime.current += currentElapsedTime;
     
     const currentRealTime = realRecordingTimeRef.current;
     console.log('暂停录音，累计时间:', currentRealTime);
     
     // 停止真实录音
     const recordingFile = await stopRecording();
     
     if (recordingFile && recordingFile.length > 0) {
       console.log('录音片段完成:', recordingFile);
       
       // 保存录音文件片段
       try {
         const recordFile = {
           uri: recordingFile,
           name: `recording_music_${recordFileList.length}.m4a`,
           type: 'audio/m4a',
         }
        //  const newRecordFileList = [...recordFileList];
        //  newRecordFileList.push(recordFile);
         setRecordFileList([recordFile]);
         console.log('录音片段列表:', [recordFile]);
         
       } catch (error) {
         console.error('保存录音文件失败:', error);
         show({message: t('recording.recording_file_save_failed')});  
       }
     }
   }, [stopRecording, recordFileList, show, t]);

   //哼唱成曲
   const handleHummingMusic = async() => {
    // console.log('mergedAudioPathRef.current', mergedAudioPathRef.current);
    const uri = recordFileList[0].uri
    console.log('uri', uri);
    try{
        setIsLoading(true);
        const res = await singToMusic({
            uri: uri,
            name:'merged_music.m4a',
            type:'audio/m4a'
        });
        console.log('哼唱成曲:', res);
        useMusicStore.getState().setMusicGenerateInfo({
            title: res.title,
            lyrics: res.work_lyrics,
            musicStyles: res.work_genres
        });
        navigation.navigate('MusicEditHumming' as any,{uri: uri});
    }catch(error){
        console.error('哼唱成曲失败:', error);
        show({message: t('recording.humming_music_failed')});  
    }finally{
        setIsLoading(false);
    }
   }

    // 音频合成功能
  const handleMergeAudio = async () => {
    try {
      // 检查是否有录音文件
      if (recordFileList.length === 0) {
        show({message: t('recording.no_recording_files_to_merge')});  
        return false;
      }

      // 过滤有效的录音文件
      const validFiles = recordFileList.filter(file => file && file.uri);
      if (validFiles.length === 0) {
        show({message: t('recording.no_valid_recording_files')});  
        return false;
      }

      console.log('开始合成音频文件，文件数量:', validFiles.length);

      // 验证音频文件
      const validation = await validateAudioFiles(validFiles);
      if (!validation.valid) {
        show({message: t('recording.invalid_files_message').replace('{files}', validation.invalidFiles.join(', '))});  
        return false;
      }

      // 获取总时长
      // const duration = await getTotalAudioDuration(validFiles);

      // 合成音频文件
      const mergedPath = await mergeAudioFiles(validFiles);
      console.log('原始合并路径:', mergedPath);
      
      // 处理路径格式 - 修复多余的斜杠
      let finalPath = mergedPath;
      if (recordFileList.length > 1) {
        // 如果是合并的文件，需要添加 file:/// 前缀，但不要多余的斜杠
        finalPath = `file:///${mergedPath}`;
      }
      
      mergedAudioPathRef.current = finalPath;

      console.log('最终音频路径:', finalPath);
      console.log('音频合成成功:', mergedPath);
      // console.log('总时长:', duration, '秒');

      return true
    } catch (error) {
      console.error('音频合成失败:', error);
      show({message: t('recording.audio_merge_failed')});    
      return false;
    } finally {
    }
  };

   //下一步
   const handleNext = async () => {
    // const success = await handleMergeAudio();
    // if (success) {
      handleHummingMusic();
    // }
   }

   const handleBack = async () => {
     // 退出页面时清理录音数据
     await cleanupRecordingData();
     navigation.goBack();
   };

    
    useEffect(() => {
      realRecordingTimeRef.current = realRecordingTime;
      
    }, [realRecordingTime]);
        // 更新 ref
  useEffect(() => {
    handleStopRecordingRef.current = handleStopRecording;
  }, [handleStopRecording]);

  // 页面失去焦点时清理录音数据
  useFocusEffect(
    useCallback(() => {
      // 页面获得焦点时的处理（如果需要的话）
      return () => {
        // 页面失去焦点时清理录音数据
        cleanupRecordingData();
      };
    }, [])
  );


  return (
    <SafeAreaView style={styles.container}>

        <ScrollView>
               {/* 顶部导航栏 */}
    <View style={styles.header}>
                 <TouchableOpacity style={styles.backButton} onPress={handleBack}>
           <Image 
             source={require('../../../assets/main/page_return_icon.png')} 
             style={styles.backIcon as any}
           />
         </TouchableOpacity>
        <Text style={styles.title}>{t('music.humming_music')}</Text>
        <View style={styles.headerSpacer} />
      </View>
      {/* Main Card */}
      <View style={styles.mainCard}>
        {/* Background Gradient */}
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
      
        {/* Waveform */}
        <View style={styles.waveformContainer}>
          <View style={styles.waveformRow}>
            {[2, 8, 14, 4, 16, 14, 10, 10, 14, 10, 16, 10, 4, 2].map((height, index) => (
              <WaveformBar key={index} height={normalize(height)} delay={index * 100} />
            ))}
          </View>
                  {/* Timer */}
         <View style={styles.timerContainer}>
             <Text style={styles.timerText} key={forceUpdate}>{formatTime(realRecordingTime)}</Text>
         </View>
          <View style={styles.waveformRow}>
            {[2, 8, 14, 4, 16, 14, 10, 10, 14, 10, 16, 10, 4, 2].map((height, index) => (
              <WaveformBar key={`second-${index}`} height={normalize(height)} delay={index * 100} />
            ))}
          </View>
        </View>

        {/* Recording Button */}
        <TouchableOpacity
          style={styles.recordButton}
          onPress={() => isRecording ? handleStopRecording() : handleStartRecording()}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.recordCircle,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.recordDot} />
          </Animated.View>
        </TouchableOpacity>


                 {/* Recording Status */}
         <Text style={styles.recordingText}>
           {isRecording ? t('music.recording_click_to_pause') : isPaused.current ? t('music.paused_click_to_continue') : t('music.click_to_start_recording')}
         </Text>
         
       </View>

       {/* Action Buttons */}
       <View style={styles.actionButtons}>    
         {/* Next Button */}
         <TouchableOpacity
           style={styles.nextButton}
           onPress={handleNext}
           activeOpacity={0.8}
         >
           <Text style={styles.nextButtonText}>{t('music.next')}</Text>
         </TouchableOpacity>
       </View>
        </ScrollView>
        <FullScreenLoader visible={isLoading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
    paddingHorizontal: normalize(24),
    paddingTop: normalize(12),
    paddingBottom: normalize(24),
  }, header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(10),
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
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: normalize(30),
    marginBottom: normalize(63),
  },
     statusTime: {
     color: '#FFFFFF',
     fontSize: normalizeFontSize(15),
     fontWeight: '600',
   },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  signalIcon: {
    width: normalize(17),
    height: normalize(10.67),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(1),
  },
  wifiIcon: {
    width: normalize(15.33),
    height: normalize(11),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(1),
  },
  batteryIcon: {
    width: normalize(24.33),
    height: normalize(11.33),
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: normalize(2.67),
    opacity: 0.35,
  },
  batteryLevel: {
    width: normalize(18),
    height: normalize(7.33),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(1.33),
    margin: normalize(2),
  },
  mainCard: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    height: normalize(460),
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    marginBottom: normalize(61),
    marginTop: normalize(14),
    paddingBottom: normalize(30),
  },
  animationContainer: {
    width: "100%",
    height: normalize(500),
    position: 'absolute',
    top:normalize(-120),
    right:normalize(0),
  },
  lottieAnimation: {
    flex:1,
  },
  starIcon: {
    position: 'absolute',
    top: normalize(27.49),
    right: normalize(27),
    width: normalize(18),
    height: normalize(29.1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  starText: {
    color: '#FFFFFF',
    fontSize: normalizeFontSize(18),
  },
  recordButton: {
    marginBottom: normalize(20),
  },
  recordCircle: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
    borderWidth: normalize(2.4),
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3C3C3C',
    shadowOffset: {
      width: normalize(4.16),
      height: normalize(4.16),
    },
    shadowOpacity: 1,
    shadowRadius: normalize(17.84),
    elevation: 8,
  },
  recordDot: {
    width: normalize(48.8),
    height: normalize(48.8),
    borderRadius: normalize(24.4),
    backgroundColor: '#EA4335',
    borderWidth: normalize(2.4),
    borderColor: '#000000',
  },
  timerContainer: {
    marginHorizontal: normalize(20),
  },
  timerText: {
    color: '#85F380',
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    textAlign: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: normalize(4),
    marginBottom: normalize(20),
  },
  waveformRow: {
    flexDirection: 'row',
    gap: normalize(4),
    alignItems: 'center',
  },
  waveformBar: {
    width: normalize(2),
    backgroundColor: '#85F380',
    borderRadius: normalize(1),
  },
  recordingText: {
    color: '#B0B0B0',
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#85F380',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
     nextButtonText: {
     color: 'rgba(12, 12, 13, 0.7)',
     fontSize: normalizeFontSize(16),
     fontWeight: '500',
   },
   segmentsText: {
     color: '#85F380',
     fontSize: normalizeFontSize(12),
     fontWeight: '400',
     textAlign: 'center',
     marginTop: normalize(8),
   },
   actionButtons: {
     flexDirection: 'row',
     gap: normalize(12),
     marginTop: normalize(20),
     position:'absolute',
     bottom:normalize(-10),
   },
   mergeButton: {
     backgroundColor: '#FF6B35',
     borderRadius: normalize(12),
     paddingVertical: normalize(12),
     paddingHorizontal: normalize(16),
     alignItems: 'center',
     justifyContent: 'center',
     flex: 1,
   },
   mergeButtonText: {
     color: '#FFFFFF',
     fontSize: normalizeFontSize(16),
     fontWeight: '500',
   },
});

export default HummingMusicScreen; 