import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

// 文件路径转换工具
export class FilePathConverter {
  
  /**
   * 将content URI转换为file://路径
   * @param contentUri content://协议的URI
   * @returns Promise<string> file://路径
   */
  static async convertContentUriToFilePath(contentUri: string): Promise<string> {
    try {
      // 检查是否是content URI
      if (!contentUri.startsWith('content://')) {
        return contentUri; // 如果不是content URI，直接返回
      }

      // 生成唯一的文件名
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const extension = this.getFileExtension(contentUri);
      const fileName = `converted_${timestamp}_${randomId}${extension}`;

      // 确定目标路径
      const targetPath = Platform.OS === 'ios' 
        ? `${RNFS.DocumentDirectoryPath}/${fileName}`
        : `${RNFS.CachesDirectoryPath}/${fileName}`;

      // 复制文件
      await RNFS.copyFile(contentUri, targetPath);
      
      // 返回file://路径
      return `file://${targetPath}`;
    } catch (error) {
      console.error('转换文件路径失败:', error);
      throw new Error(`文件路径转换失败: ${error}`);
    }
  }

  /**
   * 批量转换文件路径
   * @param files 文件数组
   * @returns Promise<Array> 转换后的文件数组
   */
  static async convertFilePaths(files: Array<{ uri: string; name: string; type: string }>): Promise<Array<{ uri: string; name: string; type: string }>> {
    const convertedFiles = [];
    
    for (const file of files) {
      try {
        const convertedUri = await this.convertContentUriToFilePath(file.uri);
        convertedFiles.push({
          ...file,
          uri: convertedUri
        });
      } catch (error) {
        console.error(`转换文件 ${file.name} 失败:`, error);
        // 如果转换失败，保留原路径
        convertedFiles.push(file);
      }
    }
    
    return convertedFiles;
  }

  /**
   * 获取文件扩展名
   * @param uri 文件URI
   * @returns string 文件扩展名
   */
  private static getFileExtension(uri: string): string {
    const match = uri.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
    return match ? `.${match[1]}` : '.mp3';
  }

  /**
   * 清理临时文件
   * @param filePath file://路径
   */
  static async cleanupTempFile(filePath: string): Promise<void> {
    try {
      if (filePath.startsWith('file://')) {
        const actualPath = filePath.replace('file://', '');
        await RNFS.unlink(actualPath);
      }
    } catch (error) {
      console.error('清理临时文件失败:', error);
    }
  }

  /**
   * 批量清理临时文件
   * @param filePaths file://路径数组
   */
  static async cleanupTempFiles(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      await this.cleanupTempFile(filePath);
    }
  }
}