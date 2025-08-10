/**
 * 简单音乐下载器
 * 提供简洁的音乐下载功能，易于使用
 */
import RNFS from 'react-native-fs';
import { Platform, PermissionsAndroid } from 'react-native';

// 下载状态
export enum DownloadState {
  IDLE = 'idle',
  DOWNLOADING = 'downloading',
  SUCCESS = 'success',
  FAILED = 'failed'
}

// 下载结果
export interface DownloadResult {
  success: boolean;
  localPath?: string;
  error?: string;
  fileSize?: number;
}

// 下载进度回调
export interface DownloadCallback {
  onProgress?: (progress: number) => void;
  onComplete?: (result: DownloadResult) => void;
  onError?: (error: string) => void;
}

export class MusicDownloader {
  private static instance: MusicDownloader;
  private currentState: DownloadState = DownloadState.IDLE;

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): MusicDownloader {
    if (!MusicDownloader.instance) {
      MusicDownloader.instance = new MusicDownloader();
    }
    return MusicDownloader.instance;
  }

  /**
   * 获取当前下载状态
   */
  getState(): DownloadState {
    return this.currentState;
  }

  /**
   * 获取下载目录路径
   */
  private getDownloadPath(): string {
    return Platform.select({
      ios: `${RNFS.DocumentDirectoryPath}/Music`,
      android: `${RNFS.DownloadDirectoryPath}/MelonMusic`,
    }) || '';
  }

  /**
   * 请求存储权限（Android）
   */
  private async requestPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: '存储权限',
          message: '需要存储权限来下载音乐文件',
          buttonNeutral: '稍后询问',
          buttonNegative: '取消',
          buttonPositive: '确定',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('请求存储权限失败:', error);
      return false;
    }
  }

  /**
   * 确保下载目录存在
   */
  private async ensureDirectory(): Promise<void> {
    const downloadPath = this.getDownloadPath();
    const exists = await RNFS.exists(downloadPath);
    if (!exists) {
      await RNFS.mkdir(downloadPath);
      console.log('创建下载目录:', downloadPath);
    }
  }

  /**
   * 生成文件名
   */
  private generateFileName(url: string, title?: string): string {
    const timestamp = Date.now();
    const urlParts = url.split('/');
    const originalName = urlParts[urlParts.length - 1] || 'music';
    const extension = originalName.includes('.') ? originalName.split('.').pop() : 'mp3';
    
    if (title) {
      // 清理文件名中的特殊字符
      const cleanTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
      return `${cleanTitle}_${timestamp}.${extension}`;
    } else {
      return `music_${timestamp}.${extension}`;
    }
  }

  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i];
  }

  /**
   * 下载音乐文件
   * @param url 音乐文件URL
   * @param title 音乐标题（可选）
   * @param callback 下载回调（可选）
   * @returns Promise<DownloadResult>
   */
  async downloadMusic(
    url: string, 
    title?: string, 
    callback?: DownloadCallback
  ): Promise<DownloadResult> {
    try {
      // 检查权限
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        const error = '没有存储权限，无法下载文件';
        callback?.onError?.(error);
        return { success: false, error };
      }

      // 确保下载目录存在
      await this.ensureDirectory();

      // 生成文件名和本地路径
      const fileName = this.generateFileName(url, title);
      const downloadPath = this.getDownloadPath();
      const localPath = `${downloadPath}/${fileName}`;

      // 检查文件是否已存在
      const fileExists = await RNFS.exists(localPath);
      if (fileExists) {
        console.log('文件已存在:', localPath);
        const stats = await RNFS.stat(localPath);
        const result: DownloadResult = {
          success: true,
          localPath,
          fileSize: stats.size
        };
        callback?.onComplete?.(result);
        return result;
      }

      // 开始下载
      this.currentState = DownloadState.DOWNLOADING;
      console.log('开始下载音乐:', { url, fileName, localPath });

      const downloadResult = await RNFS.downloadFile({
        fromUrl: url,
        toFile: localPath,
        background: true,
        discretionary: true,
        progress: (res) => {
          const progress = res.bytesWritten / res.contentLength;
          callback?.onProgress?.(progress);
        },
        progressDivider: 1
      }).promise;

      // 检查下载结果
      if (downloadResult.statusCode === 200) {
        // 验证下载的文件
        const stats = await RNFS.stat(localPath);
        if (stats.size === 0) {
          throw new Error('下载的文件大小为0');
        }

        this.currentState = DownloadState.SUCCESS;
        console.log('下载完成:', localPath);

        const result: DownloadResult = {
          success: true,
          localPath,
          fileSize: stats.size
        };
        
        callback?.onComplete?.(result);
        return result;
      } else {
        throw new Error(`下载失败，状态码: ${downloadResult.statusCode}`);
      }

    } catch (error) {
      this.currentState = DownloadState.FAILED;
      const errorMessage = error instanceof Error ? error.message : '下载失败';
      console.error('下载音乐失败:', errorMessage);
      
      callback?.onError?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * 获取已下载的音乐列表
   */
  async getDownloadedMusic(): Promise<string[]> {
    try {
      const downloadPath = this.getDownloadPath();
      const exists = await RNFS.exists(downloadPath);
      if (!exists) {
        return [];
      }

      const files = await RNFS.readDir(downloadPath);
      const musicFiles = files
        .filter(file => file.isFile() && this.isMusicFile(file.name))
        .map(file => file.path);

      return musicFiles;
    } catch (error) {
      console.error('获取已下载音乐列表失败:', error);
      return [];
    }
  }

  /**
   * 检查是否为音乐文件
   */
  private isMusicFile(fileName: string): boolean {
    const musicExtensions = ['.mp3', '.m4a', '.wav', '.flac', '.aac', '.ogg'];
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return musicExtensions.includes(extension);
  }

  /**
   * 删除音乐文件
   */
  async deleteMusic(filePath: string): Promise<boolean> {
    try {
      const exists = await RNFS.exists(filePath);
      if (exists) {
        await RNFS.unlink(filePath);
        console.log('删除音乐文件:', filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('删除音乐文件失败:', error);
      return false;
    }
  }

  /**
   * 获取下载目录大小
   */
  async getDownloadSize(): Promise<string> {
    try {
      const downloadPath = this.getDownloadPath();
      const exists = await RNFS.exists(downloadPath);
      if (!exists) {
        return '0B';
      }

      const files = await RNFS.readDir(downloadPath);
      let totalSize = 0;

      for (const file of files) {
        if (file.isFile()) {
          const stats = await RNFS.stat(file.path);
          totalSize += stats.size;
        }
      }

      return this.formatFileSize(totalSize);
    } catch (error) {
      console.error('获取下载目录大小失败:', error);
      return '0B';
    }
  }

  /**
   * 清空下载目录
   */
  async clearDownloads(): Promise<boolean> {
    try {
      const downloadPath = this.getDownloadPath();
      const exists = await RNFS.exists(downloadPath);
      if (!exists) {
        return true;
      }

      const files = await RNFS.readDir(downloadPath);
      for (const file of files) {
        if (file.isFile()) {
          await RNFS.unlink(file.path);
        }
      }

      console.log('清空下载目录完成');
      return true;
    } catch (error) {
      console.error('清空下载目录失败:', error);
      return false;
    }
  }
}