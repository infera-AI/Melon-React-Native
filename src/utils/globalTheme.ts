// src/utils/globalTheme.ts
import { StyleSheet } from 'react-native';
import { ThemeColors } from '@/contexts/ThemeContext';

// 全局样式覆盖函数
export const applyGlobalTheme = (colors: ThemeColors) => {
  // 覆盖 React Native 的默认样式
  const globalStyles = StyleSheet.create({
    // 全局背景色
    globalBackground: {
      backgroundColor: colors.background,
    },

    //Item背景色
    globalItemBackground: {
      backgroundColor: colors.surface,
    },
    
    // 全局文字颜色
    globalText: {
      color: colors.text,
    },
    
    // 全局次要文字颜色
    globalTextSecondary: {
      color: colors.textSecondary,
    },
  });

  // 动态应用全局样式
  return {
    // 背景色类
    bg: globalStyles.globalBackground,
    
    // 文字颜色类
    text: globalStyles.globalText,
    textSecondary: globalStyles.globalTextSecondary,
    
    // 快速应用函数
    apply: (baseStyle: any, themeProps: any = {}) => ({
      ...baseStyle,
      ...globalStyles.globalBackground,
      ...themeProps,
    }),
    
    applyItem: (baseStyle: any) => {
      return {
        ...baseStyle,
        ...globalStyles.globalItemBackground,
      };
    }

  };
};
