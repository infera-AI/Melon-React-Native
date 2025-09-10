import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../ProfileNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getVoiceprintEnrollmentConfig } from '@/api/profile/profile';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { mergeAudioFiles, validateAudioFiles, getTotalAudioDuration } from '@/utils/audioUtils';
import { useVoiceStore } from '@/store';
import { VoiceType } from '@/store/modules/voice.store';
import { useMessageModal } from '@/contexts/MessageModalContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import { PERMISSIONS, check, request, RESULTS } from 'react-native-permissions';

type RecordingScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Recording'>;

const MAXDURATION = 1000;

const RecordingScreen: React.FC<{ route: { params: { locale: string } } }> = ({ route }) => {
  const navigation = useNavigation<RecordingScreenNavigationProp>();
  const { locale } = route.params;
  const [isRecording, setIsRecording] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(1);
  const [voiceprintEnrollmentConfig, setVoiceprintEnrollmentConfig] = useState<any>(null);
  const [isRecordingValid, setIsRecordingValid] = useState(false);
  const [_recordingPath, setRecordingPath] = useState<string>('');
  const [realRecordingTime, setRealRecordingTime] = useState<number>(0);
  const [recordFileList, setRecordFileList] = useState<any[]>([]);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const { show } = useMessageModal();
  const { t } = useLanguage();
  // 使用 useRef 来解决闭包问题
  const voiceprintEnrollmentConfigRef = useRef(voiceprintEnrollmentConfig);
  const realRecordingTimeRef = useRef(realRecordingTime);
  const handleStopRecordingRef = useRef<(() => Promise<void>) | null>(null);
  const mergedAudioPathRef = useRef<string>('');
  const [forceUpdate, setForceUpdate] = useState<number>(0); // 强制重新渲染，通过key属性触发
  const recordingStartTime = useRef<number>(0);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTime = useRef<number>(0); // 累计录音时间
  const isPaused = useRef<boolean>(false); // 是否暂停状态
  const [recordText, setRecordText] = useState<string>('');


  // 获取录音文本
  const getRecordTextRequest = async () => {
    try {
      const res = await getVoiceprintEnrollmentConfig({ language: locale });
      setRecordText(res.content);
    } catch (error) {
      console.log(error);
    }
  }

  // 请求录音权限
  const requestRecordingPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: t('recording.recording_permission'),
            message: t('recording.recording_permission_message'),
            buttonNeutral: t('music.ask_later'),
            buttonNegative: t('music.cancel'),
            buttonPositive: t('music.confirm'),
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
      // const hasPermission = await requestRecordingPermission();
      // if (!hasPermission) {
      //   show({message: t('recording.permission_denied')});  
      //   return false;
      // }

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
          show({ message: t('recording.recording_time_exceeds_maximum') });
          if (handleStopRecordingRef.current) {
            handleStopRecordingRef.current();
          }
        }
      }, 16); // 每16ms更新一次，约60fps，获得更流畅的更新

      return true;
    } catch (error) {
      console.error('开始录音失败:', error);
      show({ message: t('recording.cannot_start_recording') });
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
      show({ message: t('recording.cannot_stop_recording') });
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
          name: `${Date.now()}.m4a`,
          type: 'audio/m4a',
        }
        //  const newRecordFileList = [...recordFileList];
        //  newRecordFileList.push(recordFile);
        setRecordFileList([recordFile]);
        console.log('录音片段列表:', [recordFile]);

      } catch (error) {
        console.error('保存录音文件失败:', error);
        show({ message: t('recording.recording_file_save_failed') });
      }
    }
  }, [stopRecording, recordFileList, show, t]);

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

  // 重新录制功能
  const handleRerecord = async () => {
    // 清理当前录音数据
    await cleanupRecordingData();
    handleStartRecording();
  };

  const handleNext = async () => {
    if (isRecording) {
      show({ message: t('recording.please_stop_recording') });
      return;
    }
    if (recordFileList.length === 0) {
      show({ message: t('recording.please_record_audio_first') });
      return;
    }
    useVoiceStore.getState().setMaterials([...useVoiceStore.getState().materials, recordFileList[0]]);
    navigation.navigate('VoiceprintMaterialCreate');
  };

  const handleBack = async () => {
    // 退出页面时清理录音数据
    await cleanupRecordingData();
    navigation.goBack();
  };

  // 脉冲动画效果
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

  // 更新 ref
  useEffect(() => {
    realRecordingTimeRef.current = realRecordingTime;
  }, [realRecordingTime]);

  useEffect(() => {
    handleStopRecordingRef.current = handleStopRecording;
  }, [handleStopRecording]);

  useEffect(() => {
    getRecordTextRequest();
  }, [locale]);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* 顶部导航栏 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image
              source={require('@/assets/main/page_return_icon.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('music.recording_timbre')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.recordingStatus}>
          <Text style={styles.recordingStatusText}>
            {t('music.after_reading_content_click_next')}
          </Text>
        </View>

        <ScrollView
          style={styles.transcriptContainer}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.transcriptText}>
            {recordText}
          </Text>
        </ScrollView>

        <View style={styles.recordingTimeContainer}>
          <Image source={require('@/assets/profile/profile_record_voice_icon.png')} style={styles.recordingIcon} />
          <Text style={styles.recordingTime}>{formatTime(realRecordingTime)}</Text>
          <Image source={require('@/assets/profile/profile_record_voice_icon.png')} style={styles.recordingIcon} />
        </View>

        <View style={styles.recordingControls}>
          <View style={styles.recordingButtonContainer}>
            {!isRecording ? (
              <TouchableOpacity
                style={styles.recordingButton}
                onPress={handleStartRecording}
                activeOpacity={0.8}
              >
                <View style={styles.recordingButtonInner} />
              </TouchableOpacity>
            ) : (
              <Animated.View
                style={[
                  styles.recordingButton,
                  {
                    transform: [{ scale: pulseAnim }]
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.recordingButtonInner}
                  onPress={handleStopRecording}
                  activeOpacity={0.8}
                />
              </Animated.View>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.rerecordButton} onPress={handleRerecord}>
            <Text style={styles.rerecordButtonText}>{t('music.re_record')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.nextButton,
              !isRecording && styles.nextButtonActive
            ]}
            onPress={handleNext}
          >
            <Text style={[
              styles.nextButtonText,
              !isRecording && styles.nextButtonTextActive
            ]}>
              {t('music.done')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
    paddingHorizontal: normalize(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(10),
    marginBottom: normalize(16),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: normalize(16),
    height: normalize(16),
  },
  headerSpacer: {
    width: normalize(40),
  },
  headerTitle: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  title: {
    fontSize: normalizeFontSize(22),
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: normalize(18),
  },
  recordingStatus: {
    marginBottom: normalize(12),
  },
  recordingStatusText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#B0B0B0',
    lineHeight: normalize(20),
  },
  recordingFilesText: {
    fontSize: normalizeFontSize(13),
    fontWeight: '400',
    color: '#85F380',
    textAlign: 'center',
    marginTop: normalize(5),
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: normalize(4),
    marginBottom: normalize(20),
  },
  progressDot: {
    width: normalize(43),
    height: normalize(5),
    borderRadius: normalize(99),
  },
  progressDotActive: {
    backgroundColor: '#85F380',
  },
  progressDotInactive: {
    backgroundColor: '#85F380',
    opacity: 0.3,
  },
  transcriptContainer: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    padding: normalize(20),
    height: normalize(311),
    marginBottom: normalize(20),
  },
  transcriptText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#B0B0B0',
    opacity: 0.5,
    lineHeight: normalize(20),
  },
  recordingControls: {
    alignItems: 'center',
    marginBottom: normalize(40),
  },
  recordingButtonContainer: {
    alignItems: 'center',
    marginBottom: normalize(10),
  },
  recordingButton: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(25.6),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3C3C3C',
    shadowOffset: {
      width: normalize(4.16),
      height: normalize(4.16),
    },
    shadowOpacity: 1,
    shadowRadius: normalize(17.84),
    elevation: 8,
  },
  recordingButtonInner: {
    width: normalize(52),
    height: normalize(52),
    borderRadius: normalize(26),
    backgroundColor: '#EA4335',
    borderWidth: normalize(2.4),
    borderColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButtonCenter: {
    width: normalize(20),
    height: normalize(20),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(10),
  },
  recordingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(12),
    marginBottom: normalize(20),
  },
  recordingIcon: {
    width: normalize(86),
    height: normalize(32),
  },
  recordingTime: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#85F380',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: normalize(12),
  },
  rerecordButton: {
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rerecordButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  nextButton: {
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonActive: {
    backgroundColor: '#85F380',
  },
  nextButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  nextButtonTextActive: {
    color: 'rgba(12, 12, 13, 0.7)',
  },
  recordingIndicator: {
    alignItems: 'center',
    marginBottom: normalize(10),
  },
  recordingIndicatorText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '500',
    color: '#EA4335',
    textAlign: 'center',
  },
  mergeButton: {
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  mergeButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  mergeButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#3E3E3E',
  },
  mergeButtonTextDisabled: {
    color: '#B0B0B0',
  },
  mergeResultContainer: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    padding: normalize(15),
    marginTop: normalize(10),
  },
  mergeResultText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: '#85F380',
    textAlign: 'center',
    marginBottom: normalize(5),
  },
  mergeResultPath: {
    fontSize: normalizeFontSize(12),
    fontWeight: '400',
    color: '#B0B0B0',
    textAlign: 'center',
  },
});

export default RecordingScreen; 