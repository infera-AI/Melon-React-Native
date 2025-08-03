import Sound from 'react-native-sound';
import { useAppStore } from '@/store';
import { FFmpegKit } from 'ffmpeg-kit-react-native';

// 快速获取音频时长的类
export class AudioDurationManager {
  private static cache = new Map<string, number>();
  
  static async getDuration(audioUrl: string): Promise<number> {
    // 检查缓存
    if (this.cache.has(audioUrl)) {
      console.log('从缓存获取音频时长:', audioUrl);
      return this.cache.get(audioUrl)!;
    }
    
    try {
      console.log('开始获取音频时长:', audioUrl);
      const duration = await this.getDurationWithFFmpeg(audioUrl);
      this.cache.set(audioUrl, duration);
      console.log('音频时长获取成功:', duration, '秒');
      return duration;
    } catch (error) {
      console.error('FFmpeg获取音频时长失败，尝试使用Sound:', error);
      try {
        const duration = await this.getDurationWithSound(audioUrl);
        this.cache.set(audioUrl, duration);
        console.log('Sound音频时长获取成功:', duration, '秒');
        return duration;
      } catch (soundError) {
        console.error('Sound获取音频时长也失败:', soundError);
        return 0;
      }
    }
  }
  
  private static async getDurationWithFFmpeg(audioUrl: string): Promise<number> {
    try {
      // 清理文件路径，移除多余的斜杠
      const cleanUrl = audioUrl.replace(/\/+/g, '/');
      console.log('清理后的文件路径:', cleanUrl);
      
      // 使用更简单的FFmpeg命令来获取时长
      const command = `-i "${cleanUrl}" -show_entries format=duration -v quiet -of csv="p=0"`;
      console.log('FFmpeg命令:', command);
      
      const result = await FFmpegKit.execute(command);
      const output = await result.getOutput();
      const returnCode = await result.getReturnCode();
      
      console.log('FFmpeg返回码:', returnCode);
      console.log('FFmpeg输出:', output);
      
      // 检查是否成功
      if (returnCode.isValueSuccess() && output.trim()) {
        const duration = parseFloat(output.trim());
        if (!isNaN(duration) && duration > 0) {
          console.log('解析到的时长:', duration, '秒');
          return duration;
        }
      }
      
      // 如果上面的方法失败，尝试使用probe命令
      console.log('尝试使用probe命令...');
      const probeCommand = `-i "${cleanUrl}" -show_entries format=duration -v quiet -of csv="p=0"`;
      const probeResult = await FFmpegKit.execute(probeCommand);
      const probeOutput = await probeResult.getOutput();
      const probeReturnCode = await probeResult.getReturnCode();
      
      console.log('Probe返回码:', probeReturnCode);
      console.log('Probe输出:', probeOutput);
      
      if (probeReturnCode.isValueSuccess() && probeOutput.trim()) {
        const duration = parseFloat(probeOutput.trim());
        if (!isNaN(duration) && duration > 0) {
          console.log('Probe解析到的时长:', duration, '秒');
          return duration;
        }
      }
      
      console.error('无法从FFmpeg输出中解析时长，输出内容:', output);
      throw new Error('无法解析音频时长');
    } catch (error) {
      console.error('FFmpeg执行失败:', error);
      throw error;
    }
  }

  private static async getDurationWithSound(audioUrl: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const sound = new Sound(audioUrl, (error) => {
        if (error) {
          console.error('Sound加载失败:', error);
          reject(error);
          return;
        }
        
        const duration = sound.getDuration();
        console.log('Sound获取到的时长:', duration, '秒');
        sound.release();
        resolve(duration);
      });
    });
  }
  
  static clearCache() {
    this.cache.clear();
  }
  
  // 测试音频时长获取功能
  static async testGetDuration(audioUrl: string): Promise<void> {
    console.log('=== 测试音频时长获取功能 ===');
    console.log('音频URL:', audioUrl);
    
    try {
      const duration = await this.getDuration(audioUrl);
      console.log('✅ 音频时长获取成功:', duration, '秒');
    } catch (error) {
      console.error('❌ 音频时长获取失败:', error);
    }
    
    console.log('=== 测试结束 ===');
  }
}

type Callbacks = {
  onInit?: (info: { duration: string; controller: AudioPlayerController }) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onProgress?: (data: { position: string; percent: number }) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
};

function formatTime(seconds: number): string {
  if (seconds <= 0 || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export class AudioPlayerController {
  private static _instance: AudioPlayerController | null = null;
  private sound: Sound | null = null;
  private _url: string = '';
  private _callbacks: Callbacks = {};
  private _progressTimer?: ReturnType<typeof setInterval>;
  private _isPlaying: boolean = false;
  private _duration: number = 0;

  private constructor() {}

  public static getInstance() {
    if (!this._instance) {
      this._instance = new AudioPlayerController();
    }
    return this._instance;
  }

  async init(url: string, callbacks?: Callbacks) {
    if (!url) return;
    if (callbacks) this._callbacks = callbacks;

    if (this._url === url && this.sound) {
      console.log('[AudioPlayer] 使用已加载音频，重置播放');
      this.sound.setCurrentTime(0);
      this._callbacks.onInit?.({ duration: formatTime(this.getDuration()), controller: this });
      await this.play();
      return;
    }

    this.release();

    this._url = url;
    console.log(`[AudioPlayer] 开始加载音频: ${url}`);
    this.sound = new Sound(url, undefined, (error) => {
      if (error) {
        console.log('[AudioPlayer] 音频加载失败:', error);
        this._callbacks.onError?.(error);
        return;
      }
      const duration = this.getDuration();
      if (duration > 0) {
        this._callbacks.onInit?.({ duration: formatTime(duration), controller: this });
        console.log(`[AudioPlayer] 音频加载完成，时长: ${this._duration}s`);
        this.play();
      } else {
        // iOS 可能时长为0，延迟再读一次
        setTimeout(() => {
          const d = this.getDuration();
          if (d > 0) {
            this._callbacks.onInit?.({ duration: formatTime(duration), controller: this });
            console.log(`[AudioPlayer] 延迟音频加载完成，时长: ${this._duration}s`);
            this.play();
          }
        }, 1000);
      }
      
    });
  }

  async play() {
    if (!this.sound) return;
    this.sound.play((success) => {
      if (success) {
        this._isPlaying = false;
        this._callbacks.onEnd?.();
        this.clearProgressTimer();
      } else {
        this._callbacks.onError?.(new Error('播放失败'));
      }
    });
    this._isPlaying = true;
    this._callbacks.onPlay?.();
    this.startProgressTimer();
  }

  async pause() {
    if (!this.sound) return;
    this.sound.pause();
    this._isPlaying = false;
    this._callbacks.onPause?.();
    this.clearProgressTimer();
  }

  async stop() {
    if (!this.sound) return;
    this.sound.stop(() => {
      this._isPlaying = false;
      this._callbacks.onStop?.();
      this.clearProgressTimer();
    });
  }

  release() {
    if (this.sound) {
      this.sound.release();
      this.sound = null;
    }
    this._isPlaying = false;
    this.clearProgressTimer();
  }

  private startProgressTimer() {
    this.clearProgressTimer();
    this._progressTimer = setInterval(() => {
      if (this.sound && this._isPlaying) {
        this.sound.getCurrentTime((seconds, isPlaying) => {
          if (!this.sound) return;
          const percent = this._duration > 0 ? Math.floor((seconds / this._duration) * 100) : 0;
          this._callbacks.onProgress?.({
            position: formatTime(seconds),
            percent,
          });
        });
      }
    }, 500);
  }

  private clearProgressTimer() {
    if (this._progressTimer) {
      clearInterval(this._progressTimer);
      this._progressTimer = undefined;
    }
  }

  public getDuration(): number {
    // 读取缓存中音频时长
    const cacheDuration = useAppStore.getState().getAudioDurationCache(this._url);
    console.log('缓存值cacheDuration---', cacheDuration);
    if (cacheDuration) {
        console.log('缓存中已存在直接返回');
        this._duration = cacheDuration
        return cacheDuration
    }
    let newDuration = this.sound?.getDuration() ?? 0
    if (newDuration > 0) {
        console.log('设置新的音频链接+时长到缓存');
        useAppStore.getState().setAudioDurationCache(this._url, newDuration)
    }
    this._duration = newDuration

    return newDuration;
  }
}
