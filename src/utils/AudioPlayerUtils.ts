/**
 * AudioPlayerController.ts
 * 
 * 音频播放控制器工具类
 * 主要用于网络音频文件的播放控制和时长获取
 * 
 * 包含两个主要类：
 * 1. AudioDurationManager - 音频时长管理器（带缓存）
 * 2. AudioPlayerController - 音频播放控制器（单例模式）
 */

import Sound from 'react-native-sound';
import { useAppStore } from '@/store';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import { Platform } from 'react-native';

/**
 * 音频时长管理器
 * 专门用于获取音频文件时长，支持缓存机制避免重复计算
 * 优先使用 FFmpeg 获取时长，失败时使用 react-native-sound 作为备用方案
 */
export class AudioDurationManager {
  // 缓存音频时长，避免重复计算
  private static cache = new Map<string, number>();
  
  /**
   * 获取音频文件时长
   * @param audioUrl 音频文件URL（支持本地和网络路径）
   * @returns 音频时长（秒）
   */
  static async getDuration(audioUrl: string): Promise<number> {
    // 检查缓存，如果已计算过直接返回
    if (this.cache.has(audioUrl)) {
      console.log('从缓存获取音频时长:', audioUrl);
      return this.cache.get(audioUrl)!;
    }
    
    try {
      if (Platform.OS === 'ios') {
        const duration = await this.getDurationWithSound(audioUrl);
        this.cache.set(audioUrl, duration);
        console.log('Sound音频时长获取成功:', duration, '秒');
        return duration;
      }
      console.log('开始获取音频时长:', audioUrl);
      // 优先使用 FFmpeg 获取时长
      const duration = await this.getDurationWithFFmpeg(audioUrl);
      this.cache.set(audioUrl, duration);
      console.log('音频时长获取成功:', duration, '秒');
      return duration;
    } catch (error) {
      console.error('FFmpeg获取音频时长失败，尝试使用Sound:', error);
      try {
        // FFmpeg 失败时使用 react-native-sound 作为备用方案
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
  
  /**
   * 使用 FFmpeg 获取音频时长
   * @param audioUrl 音频文件URL
   * @returns 音频时长（秒）
   */
  private static async getDurationWithFFmpeg(audioUrl: string): Promise<number> {
    try {
      // 清理文件路径，移除多余的斜杠
      const cleanUrl = audioUrl.replace(/\/+/g, '/');
      console.log('清理后的文件路径:', cleanUrl);
      
      // 使用 FFmpeg 命令获取音频时长
      const command = `-i "${cleanUrl}" -show_entries format=duration -v quiet -of csv="p=0"`;
      console.log('FFmpeg命令:', command);
      
      const result = await FFmpegKit.execute(command);
      const output = await result.getOutput();
      const returnCode = await result.getReturnCode();
      
      console.log('FFmpeg返回码:', returnCode);
      console.log('FFmpeg输出:', output);
      
      // 检查是否成功获取到时长
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

  /**
   * 使用 react-native-sound 获取音频时长（备用方案）
   * @param audioUrl 音频文件URL
   * @returns 音频时长（秒）
   */
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

  /**
   * 清除缓存
   * 在内存不足或需要重新计算时长时调用
   */
  static clearCache() {
    this.cache.clear();
    console.log('音频时长缓存已清除');
  }

  /**
   * 测试获取音频时长功能
   * @param audioUrl 测试用的音频URL
   */
  static async testGetDuration(audioUrl: string): Promise<void> {
    console.log('=== 测试音频时长获取功能 ===');
    console.log('测试URL:', audioUrl);
    
    try {
      const duration = await this.getDuration(audioUrl);
      console.log('测试成功，时长:', duration, '秒');
    } catch (error) {
      console.error('测试失败:', error);
    }
  }
}

/**
 * 播放器回调函数类型定义
 */
type Callbacks = {
  onInit?: (info: { duration: string; controller: AudioPlayerController }) => void;  // 初始化完成回调
  onPlay?: () => void;      // 开始播放回调
  onPause?: () => void;     // 暂停播放回调
  onStop?: () => void;      // 停止播放回调
  onProgress?: (data: { position: string; percent: number }) => void;  // 播放进度回调
  onEnd?: () => void;       // 播放结束回调
  onError?: (error: Error) => void;  // 错误回调
};

/**
 * 格式化时间为 MM:SS 格式
 * @param seconds 秒数
 * @returns 格式化后的时间字符串
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 音频播放控制器
 * 单例模式，提供完整的音频播放控制功能
 * 支持播放、暂停、停止、进度跟踪等操作
 * 主要用于网络音频文件的播放
 */
export class AudioPlayerController {
  // 单例实例
  private static _instance: AudioPlayerController | null = null;
  
  // 音频播放器实例
  private sound: Sound | null = null;
  
  // 当前播放的音频URL
  private _url: string = '';
  
  // 回调函数集合
  private _callbacks: Callbacks = {};
  
  // 进度跟踪定时器
  private _progressTimer?: ReturnType<typeof setInterval>;
  
  // 播放状态
  private _isPlaying: boolean = false;
  
  // 音频总时长
  private _duration: number = 0;

  // 私有构造函数，确保单例模式
  private constructor() {}

  /**
   * 获取单例实例
   * @returns AudioPlayerController 实例
   */
  public static getInstance() {
    if (!this._instance) {
      this._instance = new AudioPlayerController();
    }
    return this._instance;
  }

  /**
   * 初始化音频播放器
   * @param url 音频文件URL
   * @param callbacks 回调函数集合
   */
  async init(url: string, callbacks?: Callbacks) {
    try {
      // 如果已有音频在播放，先停止
      if (this.sound) {
        this.stop();
      }

      this._url = url;
      this._callbacks = callbacks || {};
      
      console.log('初始化音频播放器:', url);

      // 获取音频时长
      const duration = await AudioDurationManager.getDuration(url);
      this._duration = duration;

      // 创建音频播放器实例
      this.sound = new Sound(url, (error) => {
        if (error) {
          console.error('音频加载失败:', error);
          this._callbacks.onError?.(error);
          return;
        }

        console.log('音频加载成功，时长:', duration, '秒');
        
        // 调用初始化完成回调
        this._callbacks.onInit?.({
          duration: formatTime(duration),
          controller: this
        });
      });

    } catch (error) {
      console.error('初始化音频播放器失败:', error);
      this._callbacks.onError?.(error as Error);
    }
  }

  /**
   * 开始播放音频
   */
  async play() {
    if (!this.sound) {
      console.warn('音频播放器未初始化');
      return;
    }

    try {
      this.sound.play((success) => {
        if (success) {
          this._isPlaying = true;
          this.startProgressTimer();
          this._callbacks.onPlay?.();
          console.log('音频开始播放');
        } else {
          console.error('音频播放失败');
          this._callbacks.onError?.(new Error('播放失败'));
        }
      });
    } catch (error) {
      console.error('播放音频时出错:', error);
      this._callbacks.onError?.(error as Error);
    }
  }

  /**
   * 暂停播放
   */
  async pause() {
    if (this.sound && this._isPlaying) {
      this.sound.pause();
      this._isPlaying = false;
      this.clearProgressTimer();
      this._callbacks.onPause?.();
      console.log('音频已暂停');
    }
  }

  /**
   * 停止播放
   */
  async stop() {
    if (this.sound) {
      this.sound.stop();
      this._isPlaying = false;
      this.clearProgressTimer();
      this._callbacks.onStop?.();
      console.log('音频已停止');
    }
  }

  /**
   * 释放音频资源
   * 在不再需要播放器时调用，释放内存
   */
  release() {
    if (this.sound) {
      this.sound.release();
      this.sound = null;
    }
    this.clearProgressTimer();
    this._isPlaying = false;
    this._duration = 0;
    this._url = '';
    console.log('音频资源已释放');
  }

  /**
   * 开始进度跟踪定时器
   * 定期更新播放进度并调用回调
   */
  private startProgressTimer() {
    this.clearProgressTimer();
    
    this._progressTimer = setInterval(() => {
      if (this.sound && this._isPlaying) {
        this.sound.getCurrentTime((seconds) => {
          const percent = (seconds / this._duration) * 100;
          this._callbacks.onProgress?.({
            position: formatTime(seconds),
            percent: Math.min(percent, 100)
          });
          
          // 检查是否播放完成
          if (seconds >= this._duration) {
            this._isPlaying = false;
            this.clearProgressTimer();
            this._callbacks.onEnd?.();
            console.log('音频播放完成');
          }
        });
      }
    }, 1000); // 每秒更新一次进度
  }

  /**
   * 清除进度跟踪定时器
   */
  private clearProgressTimer() {
    if (this._progressTimer) {
      clearInterval(this._progressTimer);
      this._progressTimer = undefined;
    }
  }

  /**
   * 获取音频总时长
   * @returns 音频时长（秒）
   */
  public getDuration(): number {
    return this._duration;
  }

  /**
   * 获取当前播放状态
   * @returns 是否正在播放
   */
  public isPlaying(): boolean {
    return this._isPlaying;
  }

  /**
   * 获取当前播放的URL
   * @returns 音频URL
   */
  public getUrl(): string {
    return this._url;
  }
}
