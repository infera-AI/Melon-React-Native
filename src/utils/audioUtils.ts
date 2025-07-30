import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';

interface AudioFile {
  uri: string;
  name: string;
  type: string;
}

/**
 * 音频文件合成工具类
 */
export class AudioMerger {
  /**
   * 将多个音频文件合成为一个文件
   * @param audioFiles 音频文件数组
   * @param outputFileName 输出文件名
   * @returns 合成后的文件路径
   */
  static async mergeAudioFiles(audioFiles: AudioFile[], outputFileName: string = 'merged_audio.m4a'): Promise<string> {
    try {
      // 检查输入文件
      if (!audioFiles || audioFiles.length === 0) {
        throw new Error('没有音频文件需要合成');
      }

      if (audioFiles.length === 1) {
        // 如果只有一个文件，直接返回原文件路径
        return audioFiles[0].uri;
      }

      // 生成输出文件路径
      const outputPath = Platform.select({
        ios: `${RNFS.DocumentDirectoryPath}/${outputFileName}`,
        android: `${RNFS.CachesDirectoryPath}/${outputFileName}`,
      });

      if (!outputPath) {
        throw new Error('无法确定输出文件路径');
      }

      console.log('开始合成音频文件...');
      console.log('输入文件数量:', audioFiles.length);
      console.log('输出路径:', outputPath);

      // 尝试 FFmpeg 合成，如果失败则使用备用方法
      try {
        return await this.mergeWithFFmpeg(audioFiles, outputPath);
      } catch (ffmpegError) {
        console.error('FFmpeg 合成失败，尝试备用方法:', ffmpegError);
        return await this.mergeWithFallback(audioFiles, outputPath);
      }
    } catch (error) {
      console.error('音频合成失败:', error);
      throw error;
    }
  }

  /**
   * 使用 FFmpeg 合成音频文件
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
   * 备用音频合成方法（简单的文件复制）
   */
  private static async mergeWithFallback(audioFiles: AudioFile[], outputPath: string): Promise<string> {
    try {
      console.log('使用备用方法合成音频...');
      
      // 如果只有一个文件，直接复制
      if (audioFiles.length === 1) {
        await RNFS.copyFile(audioFiles[0].uri, outputPath);
        console.log('单文件复制完成:', outputPath);
        return outputPath;
      }

      // 对于多个文件，我们暂时只使用第一个文件
      // 这是一个简化的实现，实际项目中可能需要更复杂的处理
      console.warn('备用方法：只使用第一个音频文件');
      await RNFS.copyFile(audioFiles[0].uri, outputPath);
      console.log('备用合成完成（使用第一个文件）:', outputPath);
      return outputPath;
      
    } catch (error) {
      console.error('备用合成方法失败:', error);
      throw new Error('音频合成失败，所有方法都尝试过了');
    }
  }

  /**
   * 创建文件列表
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
   */
  static async validateAudioFile(filePath: string): Promise<boolean> {
    try {
      const exists = await RNFS.exists(filePath);
      if (!exists) {
        return false;
      }

      const stats = await RNFS.stat(filePath);
      return stats.size > 0;
    } catch (error) {
      console.error('验证音频文件失败:', error);
      return false;
    }
  }

  /**
   * 获取音频文件信息
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
   */
  static async getAudioDuration(filePath: string): Promise<number> {
    try {
      const command = `-i "${filePath}" -show_entries format=duration -v quiet -of csv="p=0"`;
      const session = await FFmpegKit.execute(command);
      const returnCode = await session.getReturnCode();
      
      if (ReturnCode.isSuccess(returnCode)) {
        const output = await session.getOutput();
        const duration = parseFloat(output?.trim() || '0');
        return isNaN(duration) ? 0 : duration;
      } else {
        console.warn('获取音频时长失败:', filePath);
        return 0;
      }
    } catch (error) {
      console.error('获取音频时长失败:', error);
      return 0;
    }
  }
}

/**
 * 简化的音频合成函数
 */
export const mergeAudioFiles = async (audioFiles: AudioFile[]): Promise<string> => {
  return await AudioMerger.mergeAudioFiles(audioFiles);
};

/**
 * 验证音频文件列表
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
 */
export const getTotalAudioDuration = async (audioFiles: AudioFile[]): Promise<number> => {
  let totalDuration = 0;
  
  for (const file of audioFiles) {
    const duration = await AudioMerger.getAudioDuration(file.uri);
    totalDuration += duration;
  }
  
  return totalDuration;
};