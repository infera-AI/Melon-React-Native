/**
 * audioUtils.ts
 * 
 * 音频工具类文件
 * 主要用于本地音频文件的处理、合成和播放
 * 
 * 包含以下主要功能：
 * 1. AudioMerger - 音频文件合成工具类
 * 2. AudioPlayer - 音频播放器类
 * 3. 各种音频处理工具函数
 */

import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import { NativeModules } from 'react-native';

const { AudioConcatModule } = NativeModules;

/**
 * 音频文件接口定义
 */
interface AudioFile {
  uri: string;    // 文件路径
  name: string;   // 文件名
  type: string;   // 文件类型
}

/**
 * 清理音频文件路径
 * 统一处理各种格式的音频文件路径，确保格式正确
 * 
 * @param filePath 原始文件路径
 * @returns 清理后的标准路径
 */
const cleanAudioPath = (filePath: string): string => {
  if (Platform.OS === 'ios') {
    return filePath; // iOS 不需要处理
  }
  let cleanPath = filePath;
  
  // 处理多余的斜杠
  if (cleanPath.startsWith('file:///')) {
    cleanPath = cleanPath.replace('file:///', 'file://');
  }
  
  // 确保路径格式正确
  if (cleanPath.startsWith('file://') && !cleanPath.startsWith('file:///')) {
    // 路径格式正确
  } else if (!cleanPath.startsWith('file://')) {
    // 添加 file:// 前缀
    cleanPath = `file://${cleanPath}`;
  }
  
  console.log('路径清理:', filePath, '->', cleanPath);
  return cleanPath;
};

/**
 * 音频文件合成工具类
 * 用于将多个音频文件合成为一个文件
 * 支持 FFmpeg 合成和备用合成方法
 */
export class AudioMerger {
  /**
   * 将多个音频文件合成为一个文件
   * 
   * @param audioFiles 音频文件数组
   * @param outputFileName 输出文件名，默认为 'merged_audio.m4a'
   * @returns 合成后的文件路径
   */
  static async mergeAudioFiles(audioFiles: AudioFile[], outputFileName: string = 'merged_audio.m4a'): Promise<string> {
    try {
      // 检查输入文件
      if (!audioFiles || audioFiles.length === 0) {
        throw new Error('没有音频文件需要合成');
      }

      // 如果只有一个文件，直接返回原文件路径
      if (audioFiles.length === 1) {
        return audioFiles[0].uri;
      }

      // 生成输出文件路径
      const outputPath = Platform.select({
        ios: `${RNFS.CachesDirectoryPath}/${performance.now()}-${outputFileName}`,
        android: `${RNFS.CachesDirectoryPath}/${outputFileName}`,
      });

      if (!outputPath) {
        throw new Error('无法确定输出文件路径');
      }

      console.log('开始合成音频文件...');
      console.log('输入文件数量:', audioFiles.length);
      console.log('输出路径:', outputPath);

      if (Platform.OS === 'ios') {
          // iOS 直接使用 FFmpegKit
        let arr = audioFiles.map(file => file.uri);
        try {
          await AudioConcatModule.concatAudios(arr, outputPath)
          console.log('=======拼接成功');
          return outputPath;
        } catch (error) {
          console.error('======拼接失败');
          throw error
        }
      } else {
        // 尝试 FFmpeg 合成，如果失败则使用备用方法
        try {
          return await this.mergeWithFFmpeg(audioFiles, outputPath);
        } catch (ffmpegError) {
          console.error('FFmpeg 合成失败，尝试备用方法:', ffmpegError);
          return await this.mergeWithFallback(audioFiles, outputPath);
        }
      }

      
    } catch (error) {
      console.error('音频合成失败:', error);
      throw error;
    }
  }

  /**
   * 使用 FFmpeg 合成音频文件
   * 
   * @param audioFiles 音频文件数组
   * @param outputPath 输出文件路径
   * @returns 合成后的文件路径
   */
  private static async mergeWithFFmpeg(audioFiles: AudioFile[], outputPath: string): Promise<string> {
    try {
      // 检查文件是否存在
      for (const file of audioFiles) {
        const exists = await RNFS.exists(file.uri);
        if (!exists) {
          throw new Error(`文件不存在: ${file.uri}`);
        }
      }

      // 如果输出文件已存在，先删除
      const outputExists = await RNFS.exists(outputPath);
      if (outputExists) {
        await RNFS.unlink(outputPath);
        console.log('删除已存在的输出文件:', outputPath);
      }

      // 创建文件列表
      const fileListPath = await this.createFileList(audioFiles);
      
      // 构建 FFmpeg 命令，添加 -y 参数自动覆盖
      const ffmpegCommand = `-f concat -safe 0 -i "${fileListPath}" -c copy -y "${outputPath}"`;

      console.log('FFmpeg 命令:', ffmpegCommand);

      // 执行 FFmpeg 命令
      const session = await FFmpegKit.execute(ffmpegCommand);
      const returnCode = await session.getReturnCode();
      
      if (ReturnCode.isSuccess(returnCode)) {
        console.log('音频合成成功:', outputPath);
        
        // 清理临时文件列表
        try {
          await RNFS.unlink(fileListPath);
        } catch (cleanupError) {
          console.warn('清理临时文件失败:', cleanupError);
        }
        
        return outputPath;
      } else {
        const logs = await session.getLogs();
        const output = await session.getOutput();
        console.error('FFmpeg 执行失败，返回码:', returnCode);
        console.error('FFmpeg 输出:', output);
        console.error('FFmpeg 日志:', logs);
        
        // 尝试获取更详细的错误信息
        const errorLogs = logs.filter(log => {
          const message = log.getMessage();
          return message && message.includes('error');
        });
        if (errorLogs.length > 0) {
          console.error('FFmpeg 错误日志:', errorLogs.map(log => log.getMessage()));
        }
        
        throw new Error(`FFmpeg 执行失败，返回码: ${returnCode}`);
      }
    } catch (error) {
      console.error('FFmpeg 合成失败:', error);
      throw error;
    }
  }

  /**
   * 备用音频合成方法
   * 当 FFmpeg 合成失败时使用
   * 
   * @param audioFiles 音频文件数组
   * @param outputPath 输出文件路径
   * @returns 合成后的文件路径
   */
  private static async mergeWithFallback(audioFiles: AudioFile[], outputPath: string): Promise<string> {
    try {
      console.log('使用备用方法合成音频文件');
      
      // 这里可以实现其他合成方法
      // 目前暂时抛出错误，提示使用 FFmpeg
      throw new Error('备用合成方法暂未实现，请确保 FFmpeg 可用');
    } catch (error) {
      console.error('备用合成方法失败:', error);
      throw error;
    }
  }

  /**
   * 创建 FFmpeg 文件列表
   * 用于 FFmpeg concat 命令
   * 
   * @param audioFiles 音频文件数组
   * @returns 文件列表路径
   */
  private static async createFileList(audioFiles: AudioFile[]): Promise<string> {
    const timestamp = Date.now();
    const fileListPath = Platform.select({
      ios: `${RNFS.DocumentDirectoryPath}/filelist_${timestamp}.txt`,
      android: `${RNFS.CachesDirectoryPath}/filelist_${timestamp}.txt`,
    });

    if (!fileListPath) {
      throw new Error('无法确定文件列表路径');
    }

    let fileListContent = '';
    for (const file of audioFiles) {
      // 确保路径格式正确
      const filePath = file.uri.replace(/\\/g, '/');
      fileListContent += `file '${filePath}'\n`;
    }

    await RNFS.writeFile(fileListPath, fileListContent, 'utf8');
    console.log('文件列表已创建:', fileListPath);
    console.log('文件列表内容:', fileListContent);
    
    return fileListPath;
  }

  /**
   * 检查音频文件是否有效
   * 
   * @param filePath 文件路径
   * @returns 文件是否有效
   */
  static async validateAudioFile(filePath: string): Promise<boolean> {
    try {
      const cleanPath = cleanAudioPath(filePath);
      console.log('验证音频文件，清理后路径:', cleanPath);
      
      const exists = await RNFS.exists(cleanPath);
      if (!exists) {
        console.log('文件不存在:', cleanPath);
        return false;
      }

      const stats = await RNFS.stat(cleanPath);
      const isValid = stats.size > 0;
      console.log('文件验证结果:', isValid, '文件大小:', stats.size);
      return isValid;
    } catch (error) {
      console.error('验证音频文件失败:', error);
      return false;
    }
  }

  /**
   * 获取音频文件信息
   * 
   * @param filePath 文件路径
   * @returns 文件信息（大小和存在性）
   */
  static async getAudioFileInfo(filePath: string): Promise<{ size: number; exists: boolean }> {
    try {
      const exists = await RNFS.exists(filePath);
      if (!exists) {
        return { size: 0, exists: false };
      }

      const stats = await RNFS.stat(filePath);
      return { size: stats.size, exists: true };
    } catch (error) {
      console.error('获取音频文件信息失败:', error);
      return { size: 0, exists: false };
    }
  }

  /**
   * 获取音频文件时长（使用 FFmpeg）
   * 
   * @param filePath 文件路径
   * @returns 音频时长（秒）
   */
  static async getAudioDuration(filePath: string): Promise<number> {
    try {
      if (Platform.OS === 'ios') {
        return await this.getAudioDurationFallback(filePath);
      }
      console.log('=== 开始获取音频时长 ===');
      console.log('原始路径:', filePath);
      
      const cleanPath = cleanAudioPath(filePath);
      console.log('清理后路径:', cleanPath);
      
      // 先验证文件是否存在
      const exists = await RNFS.exists(cleanPath);
      console.log('文件是否存在:', exists);
      
      if (!exists) {
        console.error('文件不存在，无法获取时长');
        return 0;
      }
      
      const command = `-i "${cleanPath}" -show_entries format=duration -v quiet -of csv="p=0"`;
      console.log('FFmpeg 命令:', command);
      
      const session = await FFmpegKit.execute(command);
      const returnCode = await session.getReturnCode();
      console.log('FFmpeg 返回码:', returnCode);
      
      if (ReturnCode.isSuccess(returnCode)) {
        const output = await session.getOutput();
        console.log('FFmpeg 输出:', output);
        const duration = parseFloat(output?.trim() || '0');
        console.log('解析后的时长:', duration);
        console.log('是否为NaN:', isNaN(duration));
        const finalDuration = isNaN(duration) ? 0 : duration;
        console.log('最终时长:', finalDuration);
        return finalDuration;
      } else {
        const logs = await session.getLogs();
        const output = await session.getOutput();
        console.warn('FFmpeg 执行失败');
        console.warn('返回码:', returnCode);
        console.warn('输出:', output);
        console.warn('日志:', logs.map(log => log.getMessage()));
        
        // 尝试备用方法
        console.log('尝试备用方法获取时长...');
        return await this.getAudioDurationFallback(cleanPath);
      }
    } catch (error) {
      console.error('获取音频时长失败:', error);
      // 尝试备用方法
      try {
        const cleanPath = cleanAudioPath(filePath);
        return await this.getAudioDurationFallback(cleanPath);
      } catch (fallbackError) {
        console.error('备用方法也失败:', fallbackError);
        return 0;
      }
    }
  }

  /**
   * 备用的音频时长获取方法
   * 使用 react-native-sound 获取时长
   * 
   * @param filePath 文件路径
   * @returns 音频时长（秒）
   */
  private static async getAudioDurationFallback(filePath: string): Promise<number> {
    try {
      console.log('使用备用方法获取音频时长');
      
      // 使用 react-native-sound 获取时长
      const { default: Sound } = await import('react-native-sound');
      Sound.setCategory('Playback');
      
      return new Promise((resolve) => {
        const sound = new Sound(filePath, undefined, (error) => {
          if (error) {
            console.error('备用方法加载音频失败:', error);
            resolve(0);
            return;
          }
          
          const duration = sound.getDuration();
          console.log('备用方法获取到的时长:', duration);
          sound.release();
          resolve(duration);
        });
      });
    } catch (error) {
      console.error('备用方法失败:', error);
      return 0;
    }
  }
}

/**
 * 简化的音频合成函数
 * 导出 AudioMerger.mergeAudioFiles 方法
 * 
 * @param audioFiles 音频文件数组
 * @returns 合成后的文件路径
 */
export const mergeAudioFiles = async (audioFiles: AudioFile[]): Promise<string> => {
  return await AudioMerger.mergeAudioFiles(audioFiles);
};

/**
 * 验证音频文件列表
 * 
 * @param audioFiles 音频文件数组
 * @returns 验证结果和无效文件列表
 */
export const validateAudioFiles = async (audioFiles: AudioFile[]): Promise<{ valid: boolean; invalidFiles: string[] }> => {
  const invalidFiles: string[] = [];
  
  for (const file of audioFiles) {
    const isValid = await AudioMerger.validateAudioFile(file.uri);
    if (!isValid) {
      invalidFiles.push(file.uri);
    }
  }

  return {
    valid: invalidFiles.length === 0,
    invalidFiles
  };
};

/**
 * 获取音频文件总时长
 * 
 * @param audioFiles 音频文件数组
 * @returns 总时长（秒）
 */
export const getTotalAudioDuration = async (audioFiles: AudioFile[]): Promise<number> => {
  let totalDuration = 0;
  
  for (const file of audioFiles) {
    const duration = await AudioMerger.getAudioDuration(file.uri);
    totalDuration += duration;
  }
  
  return totalDuration;
};

/**
 * 音频播放器类
 * 提供基本的音频播放功能
 * 主要用于本地音频文件的播放
 */
export class AudioPlayer {
  // 单例实例
  private static instance: AudioPlayer;
  
  // 音频播放器实例
  private sound: any = null;
  
  // 播放状态
  private isPlaying: boolean = false;
  
  // 当前播放时间
  private currentTime: number = 0;
  
  // 音频总时长
  private duration: number = 0;
  
  // 进度回调函数
  private onProgressCallback?: (currentTime: number, duration: number) => void;
  
  // 播放完成回调函数
  public onFinishCallback?: () => void;

  /**
   * 获取单例实例
   * @returns AudioPlayer 实例
   */
  static getInstance(): AudioPlayer {
    if (!AudioPlayer.instance) {
      AudioPlayer.instance = new AudioPlayer();
    }
    return AudioPlayer.instance;
  }

  /**
   * 播放音频文件
   * 
   * @param filePath 音频文件路径
   * @returns 播放是否成功
   */
  async playAudio(filePath: string): Promise<boolean> {
    try {
      // 清理路径
      const cleanPath = cleanAudioPath(filePath);
      console.log('播放音频文件:', cleanPath);

      // 如果正在播放，先停止
      if (this.sound) {
        await this.stopAudio();
      }

      // 动态导入 Sound 模块
      const { default: Sound } = await import('react-native-sound');
      
      // 启用播放功能
      Sound.setCategory('Playback');

      return new Promise((resolve, reject) => {
        this.sound = new Sound(cleanPath, undefined, (error) => {
          if (error) {
            console.error('音频加载失败:', error);
            reject(error);
            return;
          }

          console.log('音频加载成功');
          this.duration = this.sound.getDuration();
          console.log('音频时长:', this.duration);

          this.sound.play((success: boolean) => {
            if (success) {
              console.log('音频播放完成');
              this.isPlaying = false;
              this.onFinishCallback?.();
            } else {
              console.error('音频播放失败');
            }
          });

          this.isPlaying = true;
          this.startProgressTracking();
          resolve(true);
        });
      });
    } catch (error) {
      console.error('播放音频失败:', error);
      return false;
    }
  }

  /**
   * 暂停播放
   */
  pauseAudio(): void {
    if (this.sound && this.isPlaying) {
      this.sound.pause();
      this.isPlaying = false;
      console.log('音频已暂停');
    }
  }

  /**
   * 恢复播放
   */
  resumeAudio(): void {
    if (this.sound && !this.isPlaying) {
      this.sound.play();
      this.isPlaying = true;
      console.log('音频已恢复播放');
    }
  }

  /**
   * 停止播放
   */
  async stopAudio(): Promise<void> {
    if (this.sound) {
      this.sound.stop();
      this.sound.release();
      this.sound = null;
      this.isPlaying = false;
      this.currentTime = 0;
      console.log('音频已停止');
    }
  }

  /**
   * 跳转到指定时间
   * 
   * @param time 目标时间（秒）
   */
  seekTo(time: number): void {
    if (this.sound) {
      this.sound.setCurrentTime(time);
      this.currentTime = time;
      console.log('跳转到时间:', time);
    }
  }

  /**
   * 设置音量
   * 
   * @param volume 音量值（0-1）
   */
  setVolume(volume: number): void {
    if (this.sound) {
      this.sound.setVolume(volume);
      console.log('设置音量:', volume);
    }
  }

  /**
   * 获取播放状态
   * @returns 播放状态信息
   */
  getPlaybackStatus(): { isPlaying: boolean; currentTime: number; duration: number } {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration
    };
  }

  /**
   * 设置进度回调函数
   * 
   * @param callback 进度回调函数
   */
  setProgressCallback(callback: (currentTime: number, duration: number) => void): void {
    this.onProgressCallback = callback;
  }

  /**
   * 设置播放完成回调函数
   * 
   * @param callback 播放完成回调函数
   */
  setFinishCallback(callback: () => void): void {
    this.onFinishCallback = callback;
  }

  /**
   * 开始进度跟踪
   * 定期更新播放进度并调用回调
   */
  private startProgressTracking(): void {
    this.stopProgressTracking();
    
    this.progressInterval = setInterval(() => {
      if (this.sound && this.isPlaying) {
        this.sound.getCurrentTime((seconds) => {
          this.currentTime = seconds;
          this.onProgressCallback?.(seconds, this.duration);
          
          // 检查是否播放完成
          if (seconds >= this.duration) {
            this.isPlaying = false;
            this.stopProgressTracking();
            this.onFinishCallback?.();
            console.log('音频播放完成');
          }
        });
      }
    }, 1000); // 每秒更新一次进度
  }

  /**
   * 停止进度跟踪
   */
  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  // 进度跟踪定时器
  private progressInterval: NodeJS.Timeout | null = null;
}

/**
 * 获取音频时长（简化接口）
 * 
 * @param filePath 文件路径
 * @returns 音频时长（秒）
 */
export const getAudioDuration = async (filePath: string): Promise<number> => {
  return await AudioMerger.getAudioDuration(filePath);
};

/**
 * 播放音频（简化接口）
 * 
 * @param filePath 文件路径
 * @returns 播放是否成功
 */
export const playAudio = async (filePath: string): Promise<boolean> => {
  const player = AudioPlayer.getInstance();
  return await player.playAudio(filePath);
};

/**
 * 测试音频文件
 * 用于调试和验证音频文件
 * 
 * @param filePath 文件路径
 */
export const testAudioFile = async (filePath: string) => {
  console.log('=== 测试音频文件 ===');
  console.log('文件路径:', filePath);
  
  try {
    // 验证文件
    const isValid = await AudioMerger.validateAudioFile(filePath);
    console.log('文件验证结果:', isValid);
    
    if (isValid) {
      // 获取文件信息
      const info = await AudioMerger.getAudioFileInfo(filePath);
      console.log('文件信息:', info);
      
      // 获取时长
      const duration = await AudioMerger.getAudioDuration(filePath);
      console.log('音频时长:', duration, '秒');
      
      // 尝试播放
      const player = AudioPlayer.getInstance();
      const playSuccess = await player.playAudio(filePath);
      console.log('播放测试结果:', playSuccess);
      
      // 停止播放
      await player.stopAudio();
    }
  } catch (error) {
    console.error('测试音频文件失败:', error);
  }
};

/**
 * 快速验证音频文件
 * 用于快速检查音频文件是否可用
 * 
 * @param filePath 文件路径
 * @returns 验证结果
 */
export const quickValidateAudio = async (filePath: string) => {
  console.log('=== 快速验证音频文件 ===');
  console.log('文件路径:', filePath);
  
  try {
    const cleanPath = cleanAudioPath(filePath);
    console.log('清理后路径:', cleanPath);
    
    // 检查文件是否存在
    const exists = await RNFS.exists(cleanPath);
    console.log('文件是否存在:', exists);
    
    if (!exists) {
      console.log('❌ 文件不存在');
      return false;
    }
    
    // 获取文件大小
    const stats = await RNFS.stat(cleanPath);
    console.log('文件大小:', stats.size, '字节');
    
    if (stats.size === 0) {
      console.log('❌ 文件大小为0');
      return false;
    }
    
    // 尝试获取时长
    const duration = await AudioMerger.getAudioDuration(filePath);
    console.log('音频时长:', duration, '秒');
    
    if (duration === 0) {
      console.log('❌ 无法获取音频时长');
      return false;
    }
    
    console.log('✅ 音频文件验证通过');
    return true;
  } catch (error) {
    console.error('快速验证失败:', error);
    return false;
  }
};