// 尺寸适配功工具类
/**
 * 375 x 667 是以iPhone 6 / 7 / 8 的屏幕尺寸为基准， 也可以修改为和UI图一样的基准
 * 
 * 使用示例
 * import { scaleSize, scaleFont } from '@/utils/scale';
 * 字体大小：scaleFont(16)
 * 其他固定尺寸用scaleSize(100)
 */
import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');
const baseWidth = 375;
const baseHeight = 667;

export const scaleSize = (size: number) => (width / baseWidth) * size;

export const scaleFont = (size: number) => {
  const scaledSize = (height / baseHeight) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};


export const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const { width, height } = require('react-native').Dimensions.get('window');
  const scale = based === 'width' ? width / 375 : height / 812;
  return Math.round(size * scale);
};

export const normalizeFontSize = (size: number) => {
  return normalize(size, 'width');
};