import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

// 设计稿的基准尺寸
const baseWidth = 375; // 设计稿宽度
const baseHeight = 667; // 设计稿高度

// 获取屏幕的像素密度
const pixelRatio = PixelRatio.get();

// 计算屏幕的缩放因子
const scaleWidth = width / baseWidth;
const scaleHeight = height / baseHeight;
const scale = Math.min(scaleWidth, scaleHeight); // 保证不会过度拉伸

// 缩放尺寸（适用于固定尺寸的控件）
export const scaleSize = (size: number) => size * scale;

// 缩放字体（适用于字体大小）
export const scaleFont = (size: number) => {
  const scaledSize = size * scale;
  
  // 根据 PixelRatio 做适配，确保在不同密度屏幕上字体大小适配得更好
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize * pixelRatio));
};
