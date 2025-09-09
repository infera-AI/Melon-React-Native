import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import theme from '@/utils/theme';
import { pick } from '@react-native-documents/picker';
import { useMessageModal } from '@/contexts/MessageModalContext';
import FullScreenLoader from '@/components/FullScreenLoader';
import { formatTime } from '@/utils/helpers';
import { AudioPlayer, quickValidateAudio, getAudioDuration } from '@/utils/audioUtils';
import { useNavigation } from '@react-navigation/native';
import { useMusicStore } from '@/store/modules/music.store';

const img_pause_btn = require("../../../../assets/images/music_pause.png");

// 支持的文件类型
const audioFileTypes = [
  'audio/mpeg',           // .mp3
  'audio/wav',            // .wav
  'audio/mp4',            // .m4a
  'audio/aac',            // .aac
  'audio/ogg',            // .ogg
  'audio/flac',           // .flac
  'audio/x-m4a',          // .m4a (alternative MIME type)
];

// Android 支持的文件类型
const androidAudioTypes = [
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/aac',
  'audio/ogg',
  'audio/flac',
  'audio/x-m4a',
];

// iOS 支持的文件类型
const iosAudioTypes = [
  'public.audio',
  'public.mp3',
  'public.wav',
  'public.m4a',
  'public.aac',
  'public.ogg',
  'public.flac',
];

const MAX_FILE_SIZE_MB = 100; // 文件大小限制（MB）

interface AudioFile {
  name: string;
  size: number;
  uri: string;
  type: string;
  fileCopyUri?: string;
}

const CoverUploadScreen: React.FC = () => {
  const { t } = useLanguage();
  const { text, textSecondary } = useGlobalTheme();
  const { show } = useMessageModal();
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState<AudioFile | null>(null);
  const [isUploading, _setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const navigation = useNavigation();
  const { setCoverMusicFile, setGenerateMusicType } = useMusicStore.getState();


  // 清空播放器
  const clearAudioPlayer = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stopAudio();
      audioPlayerRef.current = null;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const fetchDuration = useCallback(async () => {
    if (!selectedFile?.uri) {
      console.log('没有选择文件，跳过时长获取');
      return;
    }

    console.log('开始获取音频时长，URI:', selectedFile.uri);

    // 先进行快速验证
    const isValid = await quickValidateAudio(selectedFile.uri);
    console.log('快速验证结果:', isValid);

    if (!isValid) {
      console.error('音频文件验证失败，无法获取时长');
      setDuration(0);
      return;
    }

    try {
      const durationValue = await getAudioDuration(selectedFile.uri);
      console.log('获取到的音频时长:', durationValue);
      setDuration(durationValue);
    } catch (error) {
      console.error('获取音频时长失败:', error);
      setDuration(0);
    }
  }, [selectedFile?.uri]);

  const handlePlayAudio = async () => {
    if (!selectedFile?.uri) {
      console.log('没有选择文件，无法播放');
      return;
    }

    if (isPlaying) {
      // 暂停播放
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pauseAudio();
      }
      setIsPlaying(false);
      return;
    }

    // 如果已经有播放器实例，说明之前暂停过，直接恢复播放
    if (audioPlayerRef.current) {
      audioPlayerRef.current.resumeAudio();
      setIsPlaying(true);
      return;
    }

    // 首次播放，创建新的播放器实例
    console.log('开始播放音频，URI:', selectedFile.uri);
    audioPlayerRef.current = AudioPlayer.getInstance();

    // 设置播放完成的回调
    audioPlayerRef.current.setFinishCallback(() => {
      audioPlayerRef.current = null;
      setIsPlaying(false);
      setCurrentTime(0); // 重置播放时间
    });

    // 设置播放进度更新的回调
    audioPlayerRef.current.setProgressCallback((currentTime: number) => {
      setCurrentTime(currentTime);
    });

    const success = await audioPlayerRef.current.playAudio(selectedFile.uri);
    setIsPlaying(true);
    console.log('播放成功:', success);
  };

  const handleFileSelect = async () => {
    try {
      const res = await pick({
        type: Platform.OS === 'ios' ? iosAudioTypes : audioFileTypes,
        allowMultiSelection: false,
      });

      if (!res || res.length === 0) {
        console.log('用户取消选择文件');
        return;
      }

      const file = res[0];

      // 验证文件类型
      if (!androidAudioTypes.includes(file.type ?? '')) {
        show({
          message: t('music.unsupported_file_format')
        });
        return;
      }

      // 验证文件大小
      const fileSizeMB = (file.size ?? 0) / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        show({
          message: t('music.file_size_exceeded').replace('{maxSize}', MAX_FILE_SIZE_MB.toString())
        });
        return;
      }

      console.log('✅ 选中的音频文件:', file);
      setSelectedFile(file as AudioFile);
      clearAudioPlayer();
      // 自动开始上传
      // handleUpload(file as AudioFile);

    } catch (error) {
      console.error('文件选择失败:', error);
      show({
        message: t('music.file_selection_failed')
      });
    }
  };

  const _handleUpload = async (_file: AudioFile) => {

  };

  const handleReupload = () => {
    setSelectedFile(null);
    clearAudioPlayer();
  };

  const handleNextStep = () => {
    setCoverMusicFile(selectedFile);
    setGenerateMusicType('cover');
    (navigation as any).navigate('SingerSelection', { type: 'cover' });
  };

  useEffect(() => {
    if (selectedFile) {
      fetchDuration();
    }
  }, [selectedFile, fetchDuration]);

  useEffect(() => {
    return () => {
      clearAudioPlayer();
    };
  }, []);
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* 主要内容区域 */}
      <View style={styles.mainContent}>
        {/* 上传区域 */}
        <View style={styles.uploadArea}>
          {/* 圆形背景 */}
          {!selectedFile ? <View style={styles.circleBackground}>
            {/* 音乐图标 */}
            <View style={styles.musicIconContainer}>
              <Image
                source={require('@/assets/music/music_mp3_icon.png')}
                style={styles.musicIcon}
              />
            </View>
          </View> : <View style={styles.fileInfoContainer}>
            <Text style={[styles.fileName, text]} numberOfLines={1}>
              {selectedFile.name}
            </Text>
            {/* <Text style={[styles.fileSize, textSecondary]}>
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </Text> */}
          </View>}
        </View>

        {/* 选择文件后展示音频播放器，没选择展示说明文字 */}
        {selectedFile ? (
          <View style={styles.audioBarContainer}>
            {/* 音频波形图 */}
            <View style={styles.audioWaveform}>
              <Image
                source={require('@/assets/music/music_wave_icon.png')}
                style={styles.waveformImage}
                resizeMode="contain"
              />
            </View>

            {/* 进度条 */}
            <View style={styles.progressSection}>
              <View style={styles.audioProgressBar}>
                <View style={[styles.audioProgressFill, { width: `${((currentTime || 0) / (duration || 1)) * 100}%` }]} />
              </View>
            </View>

            {/* 时间显示 */}
            <View style={styles.timeWrapper}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

            {/* 播放按钮 */}
            <TouchableOpacity style={styles.playButton} activeOpacity={0.7} onPress={handlePlayAudio}>
              <Image
                source={isPlaying ? img_pause_btn : require('../../../../assets/images/music_play.png')}
                style={styles.playIcon}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={[styles.descriptionText, textSecondary]}>
            {t('music.supported_formats_description')}
          </Text>
        )}

        {/* 上传成功文案 */}
        {/* {selectedFile && (
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Image 
                    source={require('@/assets/profile/profile_langguage_selected.png')}
                    style={styles.successIcon}
              />
            </View>
            <Text style={styles.successText}>{t('music.upload_successful')}</Text>
          </View>
        )} */}

        {/* 上传按钮 */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            selectedFile && styles.uploadButtonDisabled
          ]}
          onPress={selectedFile ? handleReupload : handleFileSelect}
          activeOpacity={0.7}
          disabled={isUploading}
        >
          <Text style={[styles.uploadButtonText, selectedFile && styles.uploadButtonTextDisabled]}>
            {selectedFile
              ? t('music.re_upload')
              : t('music.upload_original_song')
            }
          </Text>
        </TouchableOpacity>

        {/* 没有选择文件置灰下一步按钮 */}
        {selectedFile && <TouchableOpacity disabled={!selectedFile} style={[styles.uploadButton, styles.nextButton, !selectedFile && styles.nextBtnDisabled]} onPress={handleNextStep}>
          <Text style={[styles.uploadButtonText]}>{t('music.next')}</Text>
        </TouchableOpacity>}

        {/* 上传进度 */}
        {isUploading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${uploadProgress}%` }
                ]}
              />
            </View>
            <Text style={[styles.progressText, textSecondary]}>
              {t('music.uploading')} {uploadProgress}%
            </Text>
          </View>
        )}
      </View>

      {/* 全屏加载器 */}
      <FullScreenLoader visible={isUploading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  mainContent: {
    flex: 1,
    backgroundColor: theme.backgroundSecondary,
    marginHorizontal: normalize(24),
    marginTop: normalize(30),
    borderRadius: normalize(12),
    alignItems: 'center',
    paddingTop: normalize(76),
  },
  uploadArea: {
    alignItems: 'center',
  },
  circleBackground: {
    width: normalize(184),
    height: normalize(184),
    borderRadius: normalize(47),
    backgroundColor: theme.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(22, 52, 80, 0.1)',
    shadowOffset: {
      width: 0,
      height: normalize(24),
    },
    shadowOpacity: 1,
    shadowRadius: normalize(89),
    elevation: 8,
  },
  musicIconContainer: {
    position: 'absolute',
    top: normalize(49),
    left: normalize(59),
    width: normalize(68),
    height: normalize(85),
  },
  musicIcon: {
    width: '100%',
    height: '100%',
  },
  fileInfoContainer: {
    alignItems: 'center',
    marginTop: normalize(26),
  },
  fileName: {
    width: normalize(184),
    fontSize: normalizeFontSize(14),
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: normalize(4),
  },
  fileSize: {
    fontSize: normalizeFontSize(12),
    fontWeight: '400',
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: normalize(20),
    letterSpacing: -0.4,
    marginTop: normalize(32),
    paddingHorizontal: normalize(18),
    maxWidth: normalize(291),
    marginBottom: normalize(70),
  },
  uploadButton: {
    backgroundColor: theme.primary,
    borderRadius: normalize(12),
    height: normalize(48),
    width: normalize(295),
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    marginTop: normalize(12),
  },
  nextBtnDisabled: {
    backgroundColor: theme.backgroundTertiary,
  },
  uploadButtonDisabled: {
    backgroundColor: theme.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  uploadButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: theme.background,
    letterSpacing: -0.4,
    lineHeight: normalize(21),
  },
  uploadButtonTextDisabled: {
    color: theme.textPrimary,
  },
  progressContainer: {
    width: normalize(295),
    alignItems: 'center',
    marginBottom: normalize(30),
  },
  progressBar: {
    width: '100%',
    height: normalize(4),
    backgroundColor: theme.backgroundTertiary,
    borderRadius: normalize(2),
    marginBottom: normalize(8),
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: normalize(2),
  },
  progressText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    textAlign: 'center',
  },
  audioBarContainer: {
    backgroundColor: 'rgba(38, 38, 38, 1)',
    borderRadius: normalize(12),
    width: normalize(327),
    height: normalize(156),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(16),
    marginBottom: normalize(25),
  },
  audioWaveform: {
    flexDirection: 'row',
    width: normalize(260),
    height: normalize(32),
    marginTop: normalize(16),
    marginLeft: normalize(34),
    marginRight: normalize(33),
  },
  waveformImage: {
    width: normalize(260),
    height: normalize(32),
    marginRight: normalize(2),
  },
  progressSection: {
    backgroundColor: 'rgba(51, 51, 51, 1)',
    borderRadius: normalize(4),
    height: normalize(2),
    width: normalize(287),
    marginTop: normalize(16),
    marginLeft: normalize(20),
    marginRight: normalize(20),
  },
  audioProgressBar: {
    width: '100%',
    height: '100%',
    borderRadius: normalize(4),
  },
  audioProgressFill: {
    backgroundColor: 'rgba(52, 199, 89, 1)',
    borderRadius: normalize(4),
    height: '100%',
  },
  timeWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: normalize(287),
    height: normalize(18),
    marginTop: normalize(3),
    marginLeft: normalize(20),
    marginRight: normalize(20),
  },
  timeText: {
    width: normalize(43),
    height: normalize(18),
    color: 'rgba(255, 255, 255, 1)',
    fontSize: normalizeFontSize(10),
    letterSpacing: -0.4,
    fontFamily: 'SF Pro-Medium',
    fontWeight: '500',
    textAlign: 'left',
    lineHeight: normalize(18),
  },
  playButton: {
    width: normalize(39),
    height: normalize(38),
    marginTop: normalize(15),
    marginBottom: normalize(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: normalize(39),
    height: normalize(38),
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    marginTop: normalize(16),
    marginBottom: normalize(8),
  },
  successIconContainer: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  successIcon: {
    width: normalize(16),
    height: normalize(16),
    tintColor: theme.primary,
  },
  successText: {
    color: theme.primary,
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    letterSpacing: -0.4,
  },
});

export default CoverUploadScreen;
