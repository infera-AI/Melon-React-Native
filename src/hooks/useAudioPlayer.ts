// 支持在线歌曲链接
import { useState, useCallback, useRef, useEffect } from 'react';
import Sound from 'react-native-sound';
import { useMessageModal } from '@/contexts/MessageModalContext';
import { useLanguage } from '@/contexts/LanguageContext';

// 音频播放状态接口
export interface AudioPlaybackState {
  isPlaying: boolean;
  isPlayMusic: string;
  isPlayIndex: string;
  isProcessing: boolean;
}

// 音频播放控制接口
export interface AudioPlayerControls {
  play: (music: any) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<void>;
  togglePlayPause: (music: any) => Promise<void>;
  isPlayingUrl: (url: string) => boolean;
  cleanup: () => void;
}

// 音频播放Hook
export const useAudioPlayer = (): AudioPlaybackState & AudioPlayerControls => {
  const { show } = useMessageModal();
  const { t } = useLanguage();
  
  // 状态管理
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayMusic, setIsPlayMusic] = useState('');
  const [sound, setSound] = useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayIndex, setIsPlayIndex] = useState("");
  
  // 引用
  const soundRef = useRef<Sound | null>(null);
  const isProcessingRef = useRef(false);

  // 同步引用
  useEffect(() => {
    soundRef.current = sound;
    isProcessingRef.current = isProcessing;
  }, [sound, isProcessing]);

  // 播放音频
  const play = useCallback(async (music: any) => {
    if (!music.uri) {
      show({ message: t('music.no_audio_available') });
      return;
    }

    console.log('开始播放音频，URI:', music.uri);

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
    setIsPlayIndex("");

    // 重置播放状态
    setIsPlaying(false);
    setIsPlayMusic('');
    
    console.log('创建音频实例，使用URI:', music.uri);
    
    // 创建新的音频实例
    const newSound = new (Sound as any)(music.uri, (error: any) => {
      console.log('音频加载回调，错误:', error);
      
      if (error) {
        console.log('Failed to load audio:', error);
        show({ message: t('music.failed_to_load_audio') });
        setSound(null);
        setIsPlayMusic('');
        return;
      }
      
      console.log('音频加载成功，开始播放');
      
      // 开始播放
      newSound.play((success: boolean) => {
        console.log('播放完成回调，成功:', success);
        
        if (success) {
          console.log('Audio played successfully');
        } else {
          console.log('Audio playback failed');
        }
        
        console.log('播放音乐成功');
        setIsPlaying(false);
        setIsPlayMusic('');
        setIsPlayIndex("");
        
        // 播放完成后释放音频实例
        newSound.release();
        setSound(null);
      });
      
      // 设置播放状态
      setIsPlayMusic(music.uri);
      setIsPlayIndex(music.uri);
      setIsPlaying(true);
    });

    setSound(newSound);
  }, [sound, show, t]);

  // 暂停播放
  const pause = useCallback(() => {
    if (sound && isPlaying) {
      try {
        sound.pause();
        setIsPlaying(false);
        setIsPlayIndex("");
        console.log('暂停播放');
      } catch (error) {
        console.log('暂停播放时出错:', error);
      }
    }
  }, [sound, isPlaying]);

  // 恢复播放
  const resume = useCallback(() => {
    if (sound && !isPlaying) {
      try {
        sound.play();
        setIsPlaying(true);
        setIsPlayIndex(isPlayMusic);
        console.log('恢复播放');
      } catch (error) {
        console.log('恢复播放时出错:', error);
      }
    }
  }, [sound, isPlaying, isPlayMusic]);

  // 停止播放
  const stop = useCallback(async () => {
    if (sound) {
      return new Promise<void>((resolve) => {
        try {
          sound.stop(() => {
            setIsPlaying(false);
            setIsPlayMusic('');
            setIsPlayIndex("");
            sound.release();
            setSound(null);
            console.log('停止播放');
            resolve();
          });
        } catch (error) {
          console.log('停止播放时出错:', error);
          resolve();
        }
      });
    }
  }, [sound]);

  // 播放/暂停切换
  const togglePlayPause = useCallback(async (music: any) => {
    // 如果正在处理中，忽略新的点击
    if (isProcessingRef.current) {
      console.log('正在处理中，忽略点击');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('播放/暂停音频:', music.uri, '当前播放:', isPlayMusic);

      // 如果点击的是不同的歌曲，先停止当前播放的歌曲，然后播放新歌曲
      if (sound && isPlayMusic !== music.uri) {
        console.log('切换播放不同的音频');
        try {
          sound.stop();
          sound.release();
        } catch (error) {
          console.log('停止音频时出错:', error);
        }
        setSound(null);
        setIsPlaying(false);
        setIsPlayMusic('');
        setIsPlayIndex("");

        // 等待一小段时间确保音频完全停止
        await new Promise(resolve => setTimeout(resolve, 100));

        // 立即播放新歌曲
        await play(music);
        return;
      }

      // 如果没有音频实例，创建新的
      if (!sound) {
        console.log('创建新的音频实例');
        await play(music);
        return;
      }

      // 暂停/恢复播放
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    } catch (error) {
      console.error('播放音频时出错:', error);
      show({ message: '播放失败，请重试' });
    } finally {
      // 延迟重置处理状态，防止快速连续点击
      setTimeout(() => {
        setIsProcessing(false);
      }, 300);
    }
  }, [sound, isPlayMusic, isPlaying, play, pause, resume, show]);

  // 检查是否正在播放指定URL
  const isPlayingUrl = useCallback((url: string) => {
    return isPlayMusic === url && isPlaying;
  }, [isPlayMusic, isPlaying]);

  // 清理资源
  const cleanup = useCallback(() => {
    if (sound) {
      try {
        sound.stop();
        sound.release();
      } catch (error) {
        console.log('清理音频资源时出错:', error);
      }
      setSound(null);
    }
    
    // 重置所有状态
    setIsPlaying(false);
    setIsPlayMusic('');
    setIsPlayIndex("");
    setIsProcessing(false);
    
    console.log('音频播放器清理完成');
  }, [sound]);

  // 组件卸载时自动清理
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    // 状态
    isPlaying,
    isPlayMusic,
    isPlayIndex,
    isProcessing,
    
    // 控制方法
    play,
    pause,
    resume,
    stop,
    togglePlayPause,
    isPlayingUrl,
    cleanup,
  };
};