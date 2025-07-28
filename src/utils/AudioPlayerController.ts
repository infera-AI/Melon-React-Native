import Sound from 'react-native-sound';
import { useAppStore } from '@/store';

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
