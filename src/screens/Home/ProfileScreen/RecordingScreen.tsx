import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getVoiceprintEnrollmentConfig, generateVoiceId } from '../../../api/profile/profile';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { mergeAudioFiles, validateAudioFiles, getTotalAudioDuration } from '../../../utils/audioUtils';
import { useVoiceStore } from '@/store';
import { VoiceType } from '@/store/modules/voice.store';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const newSize = based === 'height' ? size * screenHeight / 812 : size * screenWidth / 375;
  return Math.round(newSize);
};

const normalizeFontSize = (size: number) => {
  const newSize = size * screenWidth / 375;
  return Math.min(Math.round(newSize), size);
};

type RecordingScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Recording'>;

const RecordingScreen: React.FC = () => {
  const navigation = useNavigation<RecordingScreenNavigationProp>();
  const [isRecording, setIsRecording] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(1);
  const [voiceprintEnrollmentConfig, setVoiceprintEnrollmentConfig] = useState<any>(null);
  const [isRecordingValid, setIsRecordingValid] = useState(false);
  const [_recordingPath, setRecordingPath] = useState<string>('');
  const [realRecordingTime, setRealRecordingTime] = useState<number>(0);
  const [recordFileList, setRecordFileList] = useState<any[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  
  // 使用 useRef 来解决闭包问题
  const voiceprintEnrollmentConfigRef = useRef(voiceprintEnrollmentConfig);
  const realRecordingTimeRef = useRef(realRecordingTime);
  const handleStopRecordingRef = useRef<(() => Promise<void>) | null>(null);
  const mergedAudioPathRef = useRef<string>('');

  // 更新 ref 值
  useEffect(() => {
    voiceprintEnrollmentConfigRef.current = voiceprintEnrollmentConfig;
  }, [voiceprintEnrollmentConfig]);

  useEffect(() => {
    realRecordingTimeRef.current = realRecordingTime;
  }, [realRecordingTime]);

  // 请求录音权限
  const requestRecordingPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: '录音权限',
            message: '需要录音权限来录制您的声音，用于声纹注册',
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
      const hasPermission = await requestRecordingPermission();
      if (!hasPermission) {
        Alert.alert('权限被拒绝', '需要录音权限才能继续');
        return false;
      }

      const timestamp = Date.now();
      const fileName = `recording_${timestamp}.m4a`;
      const path = Platform.select({
        ios: `${RNFS.DocumentDirectoryPath}/${fileName}`,
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
      
      // 开始监听录音时长 - 修复闭包问题
      audioRecorderPlayer.addRecordBackListener((e) => {
        const currentPosition = e.currentPosition;
        const currentTime = Math.floor(currentPosition / 1000); // 转换为秒
        setRealRecordingTime(currentTime);
        
        // 使用 ref 获取最新值
        const config = voiceprintEnrollmentConfigRef.current;
        if (config && currentTime > config.max_segment_duration_seconds) {
          Alert.alert('recording too long', 'recording time exceeds the maximum recording time and stop recording');
          if (handleStopRecordingRef.current) {
            handleStopRecordingRef.current();
          }
        }
        console.log('录音进度:', currentPosition, currentTime);
      });
      
      return true;
    } catch (error) {
      console.error('开始录音失败:', error);
      Alert.alert('录音失败', '无法开始录音，请检查麦克风权限并重试');
      return false;
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
      Alert.alert('录音失败', '无法停止录音，请重试');
      return null;
    }
  }, [audioRecorderPlayer]);

  const getVoiceprintEnrollmentConfigRequest = useCallback(async () => {
    try{
      const res = await getVoiceprintEnrollmentConfig({
        locale: useVoiceStore.getState().local || 'zh',
        mode: 'TEXT_DEPENDENT',
      });
      setVoiceprintEnrollmentConfig(res);
    }catch(error){
      console.log(error);
    }
  }, []);

  const handleStopRecording = useCallback(async () => {
    setIsRecording(false);
    const minDuration = voiceprintEnrollmentConfig?.min_segment_duration_seconds;
    const currentRealTime = realRecordingTimeRef.current;

    console.log('realRecordingTime', currentRealTime);
    
    // 停止真实录音
    const recordingFile = await stopRecording();
    console.log(currentRealTime, minDuration, '1111')
    if (currentRealTime < minDuration) {
      Alert.alert(
        'Recording Too Short', 
        `Recording must be at least ${minDuration} seconds. Please try again.`
      );
      setRealRecordingTime(0);
      setIsRecordingValid(false);
      return;
    }
    if (recordingFile && recordingFile.length > 0) {
      console.log('录音完成:', recordingFile);
      
      // 检查录音文件是否有效
      if (currentRealTime < 1) {
        Alert.alert('录音无效', '录音时间太短，请重新录制');
        setIsRecording(false);
        setIsRecordingValid(false);
        setRealRecordingTime(0);
        return;
      }
      
      // 保存录音文件
      try {
        const currentPhrase = voiceprintEnrollmentConfig?.phrases?.[currentSegment - 1];
        if (currentPhrase) {
          const recordFile = {
            uri: recordingFile,
            name: `recording_${currentSegment}.m4a`,
            type: 'audio/m4a',
          }
          const newRecordFileList = [...recordFileList];
          newRecordFileList[currentSegment-1] = recordFile;
          setRecordFileList(newRecordFileList);
          console.log(newRecordFileList,'recordFileList')
          
          // const uploadResult = await uploadVoiceprintRecording({
          //   recording_file: {
          //     uri: recordingFile,
          //     name: `recording_${currentSegment}.m4a`,
          //     type: 'audio/m4a',
          //   },
          //   phrase_id: currentPhrase.id,
          //   duration: currentRealTime,
          // });
          // console.log('上传结果:', uploadResult);
        }
      } catch (error) {
        console.error('保存录音文件失败:', error);
        Alert.alert('保存失败', '录音文件保存失败，请重试');
      }
    }
  }, [voiceprintEnrollmentConfig, stopRecording, currentSegment, recordFileList]);

  // 更新 ref
  useEffect(() => {
    handleStopRecordingRef.current = handleStopRecording;
  }, [handleStopRecording]);

  useEffect(() => {
    getVoiceprintEnrollmentConfigRequest();
    
    // 组件卸载时清理录音器
    return () => {
      if (audioRecorderPlayer) {
        audioRecorderPlayer.removeRecordBackListener();
        audioRecorderPlayer.stopRecorder();
      }
    };
  }, [getVoiceprintEnrollmentConfigRequest, audioRecorderPlayer]);

  useEffect(() => {
    if (isRecording) {
      // 开始录音动画
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
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
      
      return () => {
        pulseAnim.stopAnimation();
      };
    } else {
      pulseAnim.stopAnimation();
    }
  }, [isRecording, voiceprintEnrollmentConfig, pulseAnim, handleStopRecording]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleStartRecording = async () => {
    const minDuration = voiceprintEnrollmentConfig?.min_segment_duration_seconds;
    const maxDuration = voiceprintEnrollmentConfig?.max_segment_duration_seconds;
    
    if (!minDuration || !maxDuration) {
      Alert.alert('Error', 'Recording configuration not loaded');
      return;
    }
    
    // 开始真实录音
    const success = await startRecording();
    if (success) {
      setIsRecording(true);
      setIsRecordingValid(false);
    }
  };

  // 重新录音功能
  const handleRerecord = () => {
    setRealRecordingTime(0);
    setIsRecording(false);
    setIsRecordingValid(false);
    setRecordingPath('');
  };

  // 音频合成功能
  const handleMergeAudio = async () => {
    try {
      // 检查是否有录音文件
      if (recordFileList.length === 0) {
        Alert.alert('提示', '没有录音文件可以合成');
        return false;
      }

      // 过滤有效的录音文件
      const validFiles = recordFileList.filter(file => file && file.uri);
      if (validFiles.length === 0) {
        Alert.alert('提示', '没有有效的录音文件');
        return false;
      }

      console.log('开始合成音频文件，文件数量:', validFiles.length);

      // 验证音频文件
      const validation = await validateAudioFiles(validFiles);
      if (!validation.valid) {
        Alert.alert('错误', `以下文件无效: ${validation.invalidFiles.join(', ')}`);
        return false;
      }

      // 获取总时长
      const duration = await getTotalAudioDuration(validFiles);

      // 合成音频文件
      const mergedPath = await mergeAudioFiles(validFiles);
      mergedAudioPathRef.current = mergedPath;

      console.log('音频合成成功:', mergedPath);
      console.log('总时长:', duration, '秒');

      return true
    } catch (error) {
      console.error('音频合成失败:', error);
      Alert.alert('合成失败', '音频文件合成失败，请重试');
      return false;
    } finally {
    }
  };

  const handleNext = async () => {
    const totalPhrases = voiceprintEnrollmentConfig?.required_phrases_count || 0;
    if(!recordFileList[currentSegment-1]){
      Alert.alert('提示', '请先录制音频');
      return;
    }
    
    if (currentSegment < totalPhrases) {
      setCurrentSegment(prev => prev + 1);
      setRealRecordingTime(0);
      setIsRecording(false);
      setIsRecordingValid(false);
      setRecordingPath('');
    } else {
      // 合成音频
      const isMerged = await handleMergeAudio();
      if(isMerged){
        // 保存音频文件
        const voiceFile = {
          uri: "file:///"+mergedAudioPathRef.current,
          name:'merged_voiceprint.m4a',
          type:'audio/m4a'
        }
        useVoiceStore.getState().setVoiceFile(voiceFile);
        // 完成所有录音，导航到生成页面
        navigation.navigate('GeneratingVoice');
      }else{
        Alert.alert('提示', '音频合成失败，请重试');
      }
     
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView>
         {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image 
            source={require('../../../assets/main/page_return_icon.png')} 
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{useVoiceStore.getState().type === VoiceType.CREATE ? 'Create your own voice' : 'Optimize your voice'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.recordingStatus}>
        <Text style={styles.recordingStatusText}>
          {isRecording ? 'Recording...' : 'Ready to record'} Segment {currentSegment}{'\n'}({voiceprintEnrollmentConfig?.required_phrases_count || 0} segments in total)
        </Text>
      </View>

      <View style={styles.progressContainer}>
        {Array.from({ length: voiceprintEnrollmentConfig?.required_phrases_count|| 0 }, (_, index) => (
          <View
            key={index}
            style={[
               styles.progressDot,
               index < currentSegment ? styles.progressDotActive : styles.progressDotInactive,
             ]}
          />
        ))}
      </View>

      <View style={styles.transcriptContainer}>
        <Text style={styles.transcriptText}>
          {voiceprintEnrollmentConfig?.phrases?.[currentSegment - 1] || 'Loading...'}
        </Text>
      </View>

      <View style={styles.recordingTimeContainer}>
        <Image source={require('../../../assets/profile/profile_record_voice_icon.png')} style={styles.recordingIcon} />
        <Text style={styles.recordingTime}>{formatTime( realRecordingTime)}</Text>
        <Image source={require('../../../assets/profile/profile_record_voice_icon.png')} style={styles.recordingIcon} />
      </View>
      
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <Text style={styles.recordingIndicatorText}>Recording in progress...</Text>
        </View>
      )}

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
          <Text style={styles.rerecordButtonText}>Re-record This Segment</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.nextButton,
            isRecordingValid && currentSegment === (voiceprintEnrollmentConfig?.required_phrases_count || 0) && styles.nextButtonActive
          ]} 
          onPress={handleNext}
        >
          <Text style={[
            styles.nextButtonText,
            isRecordingValid && currentSegment === (voiceprintEnrollmentConfig?.required_phrases_count|| 0) && styles.nextButtonTextActive
          ]}>
            Next
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
    marginBottom: normalize(20),
  },
  recordingStatus: {
    alignItems: 'center',
    marginBottom: normalize(20),
  },
  recordingStatusText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#B0B0B0',
    textAlign: 'center',
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