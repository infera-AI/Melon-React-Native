import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

// 设计稿的基准尺寸
const baseWidth = 375; // 设计稿宽度
const baseHeight = 667; // 设计稿高度

// 获取屏幕的像素密度
// const pixelRatio = PixelRatio.get();

// 计算屏幕的缩放因子
// const scaleWidth = width / baseWidth;
// const scaleHeight = height / baseHeight;
// const scale = Math.min(scaleWidth, scaleHeight); // 保证不会过度拉伸

// 缩放尺寸（适用于固定尺寸的控件）
// export const scaleSize = (size: number) => size * scale;

// 缩放字体（适用于字体大小）
// export const scaleFont = (size: number) => {
//   const scaledSize = size * scale;
  
//   // 根据 PixelRatio 做适配，确保在不同密度屏幕上字体大小适配得更好
//   return Math.round(PixelRatio.roundToNearestPixel(scaledSize * pixelRatio));
// };

// 缩放比例--新
const scaleWidth = width / baseWidth;
const scaleHeight = height / baseHeight;

/**
 * 控件尺寸缩放--新
 * 用较小的缩放系数，防止拉伸变形
 */
export const scaleSize = (size: number) => size * Math.min(scaleWidth, scaleHeight);

/**
 * 字体缩放--新
 * 使用宽度比例即可，避免长屏导致字体过小
 */
export const scaleFont = (size: number) => {
  const scaledSize = size * scaleWidth;
  const finalSize = Math.round(PixelRatio.roundToNearestPixel(scaledSize));
  // 限制字体范围（可调）
  const MIN_FONT_SIZE = 10;
  const MAX_FONT_SIZE = 30;

  if (finalSize < MIN_FONT_SIZE) return MIN_FONT_SIZE;
  if (finalSize > MAX_FONT_SIZE) return MAX_FONT_SIZE;
  return finalSize;
};

/**
 * 图标尺寸缩放（不受字体最小/最大限制）
 */
export const scaleIcon = (size: number) => {
  const scaledSize = size * scaleWidth;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));  // 这里不加最小/最大限制
};
