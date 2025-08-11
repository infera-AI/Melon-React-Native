import {Dimensions,PixelRatio} from 'react-native';
import { scaleSize,scaleFont } from './scale';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const pixelRatio = PixelRatio.get();
// export const normalize = (size: number, based: 'width' | 'height' = 'width') => {
//   const newSize = based === 'height' ? size * screenHeight / 812 : size * screenWidth / 375;
//   return Math.round(newSize);
// };
// export const normalizeFontSize = (size: number) => {
//   const newSize = (size) * screenWidth / 375;
//   return Math.min(Math.round(newSize), size);
// };

export const normalize = (size: number) => {
  return scaleSize(size);
}

export const normalizeFontSize = (size: number) => {
  // 确保最小字体大小
  const minSize = 12;
  const maxSize = size * 1.5; // 最大不超过原尺寸的1.5倍
  const pixelAlignedSize = scaleFont(size)/pixelRatio
  return Math.max(minSize, Math.min(maxSize, pixelAlignedSize));
}

// export const normalizeFontSize = (size: number) => {
//   const newSize = size * screenWidth / 375;
//   const pixelRatio = PixelRatio.get();
//   // 先计算缩放后的尺寸，再应用像素对齐
//   const scaledSize = newSize * pixelRatio;
//   return PixelRatio.roundToNearestPixel(scaledSize) / pixelRatio;
// };

// export const normalize = (size: number, based: 'width' | 'height' = 'width') => {
//   const newSize = based === 'height' ? size * screenHeight /812 : size * screenWidth / 375;
//   // 使用 PixelRatio 进行像素对齐
//   const pixelRatio = PixelRatio.get();
//   const scaledSize = newSize * pixelRatio;
//   return PixelRatio.roundToNearestPixel(scaledSize) / pixelRatio;
// };



export const wrapTextByLetters = (text: string, maxLength: number = 15): string => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join('\n');
};